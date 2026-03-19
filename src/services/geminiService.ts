import { GoogleGenAI } from "@google/genai";
import { Product } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const suggestLooks = async (userStyle: string, products: Product[]) => {
  const model = ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Você é um personal stylist especialista em streetwear. 
    O cliente descreveu seu estilo como: "${userStyle}".
    Aqui está o catálogo de produtos: ${JSON.stringify(products.map(p => ({ id: p.id, name: p.name, category: p.category })))}.
    
    Sugira 3 looks completos usando apenas os produtos do catálogo. 
    Para cada look, explique por que combina com o estilo do cliente.
    Responda em formato Markdown amigável.`,
  });

  const response = await model;
  return response.text;
};
