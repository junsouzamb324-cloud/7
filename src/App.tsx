import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Zap, ArrowRight, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductGrid from './components/ProductGrid';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import AuthModal from './components/AuthModal';
import AdminModal from './components/AdminModal';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import ErrorBoundary from './components/ErrorBoundary';
import Toast, { ToastType } from './components/Toast';

import { auth, db, loginWithGoogle, logout, onAuthStateChanged, doc, getDoc, setDoc, OperationType, handleFirestoreError, collection, onSnapshot, query, updateDoc, arrayUnion, arrayRemove } from './firebase';
import { Product, CartItem, UserProfile } from './types';
import { MOCK_PRODUCTS } from './constants';
import { suggestLooks } from './services/geminiService';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [userStyle, setUserStyle] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  };

  // Checkout Success/Cancel Handler
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    if (queryParams.get('success')) {
      setCart([]);
      alert('Pagamento realizado com sucesso! Seu pedido está sendo processado.');
      // Remove query params from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    if (queryParams.get('canceled')) {
      alert('Pagamento cancelado.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const isAdminEmail = firebaseUser.email === 'junsouzamb324@gmail.com';

          if (userDoc.exists()) {
            const userData = userDoc.data() as UserProfile;
            if (isAdminEmail && userData.role !== 'admin') {
              userData.role = 'admin';
              await updateDoc(doc(db, 'users', firebaseUser.uid), { role: 'admin' });
            }
            setUser(userData);
          } else {
            const newUser: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Usuário',
              photoURL: firebaseUser.photoURL || '',
              role: isAdminEmail ? 'admin' : 'client'
            };
            await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
            setUser(newUser);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch products from Firestore
  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
      if (productsData.length > 0) {
        setProducts(productsData);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'products');
    });

    return () => unsubscribe();
  }, []);

  // Cart Handlers
  const addToCart = (product: Product, size?: string, color?: string) => {
    const s = size || product.sizes[0];
    const c = color || product.colors[0];
    
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === s && item.selectedColor === c);
      if (existing) {
        return prev.map(item => 
          (item.id === product.id && item.selectedSize === s && item.selectedColor === c)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, selectedSize: s, selectedColor: c }];
    });
    showToast(`${product.name} adicionado ao carrinho!`);
    setIsCartOpen(true);
    setSelectedProduct(null);
  };

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      setIsAuthOpen(true);
      showToast('Faça login para salvar favoritos', 'info');
      return;
    }

    const isWishlisted = user.wishlist?.includes(productId);
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        wishlist: isWishlisted ? arrayRemove(productId) : arrayUnion(productId)
      });
      
      setUser(prev => prev ? ({
        ...prev,
        wishlist: isWishlisted 
          ? prev.wishlist?.filter(id => id !== productId) 
          : [...(prev.wishlist || []), productId]
      }) : null);

      showToast(isWishlisted ? 'Removido dos favoritos' : 'Adicionado aos favoritos');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      showToast('Erro ao atualizar favoritos', 'error');
    }
  };

  const updateQuantity = (id: string, size: string, color: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id && item.selectedSize === size && item.selectedColor === color) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string, size: string, color: string) => {
    setCart(prev => prev.filter(item => !(item.id === id && item.selectedSize === size && item.selectedColor === color)));
  };

  // AI Suggestion Handler
  const handleAiSuggestion = async () => {
    if (!userStyle) return;
    setIsAiLoading(true);
    try {
      const suggestion = await suggestLooks(userStyle, MOCK_PRODUCTS);
      setAiSuggestion(suggestion);
    } catch (error) {
      console.error('AI Error:', error);
      setAiSuggestion('Desculpe, não consegui gerar uma sugestão agora. Tente novamente mais tarde.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Checkout Handler
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          userId: user?.uid,
          successUrl: `${window.location.origin}/?success=true`,
          cancelUrl: `${window.location.origin}/?canceled=true`,
        }),
      });

      const session = await response.json();
      if (session.url) {
        window.location.href = session.url;
      } else {
        throw new Error(session.error || 'Erro ao criar sessão de checkout');
      }
    } catch (error) {
      console.error('Checkout Error:', error);
      alert('Erro ao processar pagamento. Tente novamente.');
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-black selection:bg-neon-purple selection:text-black">
        <Navbar 
          user={user} 
          onOpenCart={() => setIsCartOpen(true)} 
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenAdmin={() => setIsAdminOpen(true)}
          onLogout={logout}
          cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        />

        <main>
          <Hero />
          
          {/* Admin Section (Only for admins) */}
          {user?.role === 'admin' && (
            <section className="max-w-7xl mx-auto px-4 py-8 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-neon-purple uppercase italic">Painel Admin</h2>
                <button 
                  onClick={() => setIsAdminOpen(true)}
                  className="px-6 py-2 bg-neon-purple text-black font-bold uppercase text-xs rounded-lg hover:bg-white transition-colors"
                >
                  Adicionar Novo Produto
                </button>
              </div>
            </section>
          )}
          <ProductGrid 
            products={products} 
            onOpenDetails={setSelectedProduct}
            onAddToCart={addToCart}
            wishlist={user?.wishlist || []}
            onToggleWishlist={toggleWishlist}
          />

          {/* Highlights Section */}
          <section className="max-w-7xl mx-auto px-4 py-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="relative h-80 rounded-3xl overflow-hidden group cursor-pointer">
                <img src="https://picsum.photos/seed/streetwear-new-collection/800/800" alt="Novidades" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-8">
                  <span className="text-neon-purple font-black uppercase tracking-widest text-xs mb-2">🔥 Drop Recente</span>
                  <h3 className="text-3xl font-display font-black uppercase italic">Novidades</h3>
                </div>
              </div>
              <div className="relative h-80 rounded-3xl overflow-hidden group cursor-pointer">
                <img src="https://picsum.photos/seed/streetwear-best-sellers/800/800" alt="Mais Vendidos" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-8">
                  <span className="text-neon-green font-black uppercase tracking-widest text-xs mb-2">🛒 Top Escolhas</span>
                  <h3 className="text-3xl font-display font-black uppercase italic">Mais Vendidos</h3>
                </div>
              </div>
              <div className="relative h-80 rounded-3xl overflow-hidden group cursor-pointer">
                <img src="https://picsum.photos/seed/streetwear-sale-promo/800/800" alt="Promoções" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-8">
                  <span className="text-red-500 font-black uppercase tracking-widest text-xs mb-2">💸 Até 50% OFF</span>
                  <h3 className="text-3xl font-display font-black uppercase italic">Promoções</h3>
                </div>
              </div>
            </div>
          </section>

          {/* AI Section */}
          <section className="max-w-7xl mx-auto px-4 py-24">
            <div className="relative p-12 rounded-3xl overflow-hidden glass border-neon-purple/20">
              <div className="absolute top-0 right-0 w-1/2 h-full bg-neon-purple/5 blur-[100px] -z-10" />
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-6 text-neon-purple">
                  <Sparkles className="w-6 h-6" />
                  <span className="text-xs font-black uppercase tracking-widest">Personal Stylist IA</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-display font-black tracking-tighter uppercase italic mb-6">
                  Monte seu <span className="text-neon-purple">Outfit</span> com IA
                </h2>
                <p className="text-zinc-400 mb-8 text-lg">
                  Descreva seu estilo ou a ocasião (ex: "rolê noturno cyberpunk" ou "estilo minimalista urbano") e nossa IA sugere o look perfeito do nosso catálogo.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input 
                    type="text" 
                    placeholder="Descreva seu estilo aqui..."
                    value={userStyle}
                    onChange={(e) => setUserStyle(e.target.value)}
                    className="flex-1 px-6 py-4 bg-zinc-900 border border-white/10 rounded-xl focus:border-neon-purple outline-none transition-all"
                  />
                  <button 
                    onClick={() => {
                      setIsAiModalOpen(true);
                      handleAiSuggestion();
                    }}
                    className="px-8 py-4 bg-neon-purple text-black font-black uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2"
                  >
                    Sugerir Look
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>

        </main>

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
      />

      <Footer />
        <WhatsAppButton />

        <AnimatePresence>
          {toast && (
            <Toast 
              message={toast.message} 
              type={toast.type} 
              onClose={() => setToast(null)} 
            />
          )}
        </AnimatePresence>

        {/* Modals */}
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          onAddToCart={addToCart}
          isWishlisted={selectedProduct ? user?.wishlist?.includes(selectedProduct.id) : false}
          onToggleWishlist={toggleWishlist}
        />

        <CartDrawer 
          isOpen={isCartOpen} 
          onClose={() => setIsCartOpen(false)} 
          items={cart}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeFromCart}
          onCheckout={handleCheckout}
        />

        <AuthModal 
          isOpen={isAuthOpen} 
          onClose={() => setIsAuthOpen(false)} 
          user={user}
          onLogin={loginWithGoogle}
          onLogout={logout}
          onOpenAdmin={() => setIsAdminOpen(true)}
        />

        {/* AI Suggestion Modal */}
        <AnimatePresence>
          {isAiModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
              onClick={() => setIsAiModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                className="relative max-w-2xl w-full max-h-[80vh] overflow-y-auto bg-zinc-950 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl shadow-neon-purple/20"
                onClick={(e) => e.stopPropagation()}
              >
                <button 
                  onClick={() => setIsAiModalOpen(false)}
                  className="absolute top-6 right-6 p-2 hover:bg-neon-purple hover:text-black rounded-full transition-all"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-3 mb-8 text-neon-purple">
                  <Sparkles className="w-8 h-8" />
                  <h2 className="text-3xl font-display font-black tracking-tighter uppercase italic">Sugestões da <span className="text-neon-purple">IA</span></h2>
                </div>

                {isAiLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-6">
                    <div className="w-16 h-16 border-4 border-neon-purple border-t-transparent rounded-full animate-spin" />
                    <p className="text-zinc-500 font-bold uppercase tracking-widest animate-pulse">Analisando seu estilo...</p>
                  </div>
                ) : (
                  <div className="prose prose-invert prose-neon max-w-none">
                    <div className="markdown-body">
                      <ReactMarkdown>{aiSuggestion || ''}</ReactMarkdown>
                    </div>
                    <button 
                      onClick={() => setIsAiModalOpen(false)}
                      className="mt-12 w-full py-5 bg-white text-black font-black uppercase tracking-widest hover:bg-neon-purple transition-all"
                    >
                      Entendido, vamos às compras!
                    </button>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}
