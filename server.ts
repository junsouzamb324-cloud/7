import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import dotenv from "dotenv";
import admin from "firebase-admin";
import firebaseConfig from "./firebase-applet-config.json" assert { type: "json" };

dotenv.config();

// Initialize Firebase Admin (lazy)
let db: admin.firestore.Firestore | null = null;
const getFirestoreAdmin = () => {
  if (!db) {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: firebaseConfig.projectId,
      });
    }
    db = admin.firestore();
  }
  return db;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Stripe initialization (lazy)
  let stripe: Stripe | null = null;
  const getStripe = () => {
    if (!stripe) {
      const key = process.env.STRIPE_SECRET_KEY;
      if (!key) {
        console.warn("STRIPE_SECRET_KEY is not set. Payments will not work.");
        return null;
      }
      stripe = new Stripe(key, { apiVersion: '2025-02-11' as any });
    }
    return stripe;
  };

  // Webhook endpoint MUST use express.raw() for signature verification
  app.post("/api/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const stripeClient = getStripe();
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeClient || !sig || !endpointSecret) {
      return res.status(400).send("Webhook Error: Missing configuration");
    }

    let event;

    try {
      event = stripeClient.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const cartItems = JSON.parse(session.metadata?.cartItems || "[]");
      const total = session.amount_total ? session.amount_total / 100 : 0;

      if (userId) {
        const firestore = getFirestoreAdmin();
        try {
          // Create order
          await firestore.collection("orders").add({
            userId,
            items: cartItems,
            total,
            status: "processing",
            createdAt: new Date().toISOString(),
            paymentId: session.id,
          });

          // Update stock and record movements
          for (const item of cartItems) {
            const productRef = firestore.collection("products").doc(item.id);
            const productDoc = await productRef.get();
            if (productDoc.exists) {
              const currentStock = productDoc.data()?.stock || 0;
              await productRef.update({
                stock: Math.max(0, currentStock - item.quantity)
              });
              
              // Record movement
              await firestore.collection("stock_movements").add({
                productId: item.id,
                productName: item.name,
                type: 'exit',
                quantity: item.quantity,
                value: item.price * item.quantity,
                reason: 'Venda Online (Stripe)',
                createdAt: admin.firestore.FieldValue.serverTimestamp()
              });
            }
          }
          
          console.log(`Order created and stock updated for user ${userId}`);
        } catch (error) {
          console.error("Error processing order/stock in Firestore:", error);
        }
      }
    }

    res.json({ received: true });
  });

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/create-checkout-session", async (req, res) => {
    const { items, successUrl, cancelUrl, userId } = req.body;
    const stripeClient = getStripe();

    if (!stripeClient) {
      return res.status(500).json({ error: "Stripe is not configured." });
    }

    try {
      const session = await stripeClient.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: items.map((item: any) => ({
          price_data: {
            currency: "brl",
            product_data: {
              name: `${item.name} (${item.selectedSize} / ${item.selectedColor})`,
              images: item.images,
            },
            unit_amount: Math.round((item.discountPrice || item.price) * 100),
          },
          quantity: item.quantity,
        })),
        mode: "payment",
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId,
          cartItems: JSON.stringify(items.map((item: any) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.discountPrice || item.price,
            selectedSize: item.selectedSize,
            selectedColor: item.selectedColor,
          }))),
        },
      });

      res.json({ id: session.id, url: session.url });
    } catch (error: any) {
      console.error("Stripe Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
