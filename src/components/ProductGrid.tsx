import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Filter, Search, SlidersHorizontal, Zap } from 'lucide-react';
import ProductCard from './ProductCard';
import { Product } from '../types';

interface ProductGridProps {
  products: Product[];
  onOpenDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ products, onOpenDetails, onAddToCart, wishlist, onToggleWishlist }) => {
  const [filter, setFilter] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['Todos', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(p => {
    const matchesCategory = filter === 'Todos' || p.category === filter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="max-w-7xl mx-auto px-4 py-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
        <div className="flex flex-col items-center md:items-start">
          <div className="flex items-center gap-2 mb-4 text-neon-purple">
            <Zap className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest">Explore o Urbano</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-display font-black tracking-tighter uppercase italic">
            Coleção <span className="text-neon-purple">Streetwear</span>
          </h2>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Buscar peça..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-white/10 rounded-xl focus:border-neon-purple outline-none transition-all text-sm"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  filter === cat 
                    ? 'bg-neon-purple text-black' 
                    : 'bg-zinc-900 text-zinc-400 border border-white/5 hover:border-neon-purple/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onOpenDetails={onOpenDetails}
            onAddToCart={onAddToCart}
            isWishlisted={wishlist.includes(product.id)}
            onToggleWishlist={onToggleWishlist}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-zinc-500 text-lg font-medium italic">Nenhuma peça encontrada para sua busca.</p>
        </div>
      )}
    </section>
  );
};

export default ProductGrid;
