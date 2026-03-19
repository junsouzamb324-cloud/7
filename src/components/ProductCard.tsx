import React from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Star, Zap, Heart } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails, onAddToCart, isWishlisted, onToggleWishlist }) => {
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="group relative bg-zinc-950 border border-white/5 rounded-2xl overflow-hidden transition-all hover:border-neon-purple/30 hover:shadow-2xl hover:shadow-neon-purple/10"
    >
      {/* Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {hasDiscount && (
          <span className="px-3 py-1 bg-neon-green text-black text-[10px] font-black uppercase tracking-widest rounded-full">
            OFF {Math.round((1 - (product.discountPrice! / product.price)) * 100)}%
          </span>
        )}
        {product.stock < 5 && (
          <span className="px-3 py-1 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full animate-pulse">
            Últimas Unidades
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      {onToggleWishlist && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          className={`absolute top-4 right-4 z-10 p-2 rounded-full glass border transition-all ${
            isWishlisted 
              ? 'bg-neon-purple text-black border-neon-purple' 
              : 'text-white border-white/10 hover:border-neon-purple'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>
      )}

      {/* Image Container */}
      <div 
        onClick={() => onOpenDetails(product)}
        className="relative aspect-[3/4] overflow-hidden cursor-pointer"
      >
        <img 
          src={product.images[0]} 
          alt={product.name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
          <button className="w-full py-3 bg-white text-black font-black uppercase tracking-widest text-xs rounded-none transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            Ver Detalhes
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">{product.category}</span>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-neon-purple fill-neon-purple" />
            <span className="text-[10px] font-bold">{product.rating}</span>
          </div>
        </div>

        <h3 className="text-lg font-display font-bold mb-3 line-clamp-1 group-hover:text-neon-purple transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {hasDiscount ? (
              <>
                <span className="text-xs text-zinc-500 line-through">R$ {product.price.toFixed(2)}</span>
                <span className="text-xl font-black text-neon-green">R$ {product.discountPrice!.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-xl font-black">R$ {product.price.toFixed(2)}</span>
            )}
          </div>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="p-3 bg-zinc-900 border border-white/10 rounded-xl hover:bg-neon-purple hover:text-black hover:border-neon-purple transition-all"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
