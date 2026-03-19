import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingCart, MessageCircle, Star, Zap, Info, CreditCard, Truck, Heart } from 'lucide-react';
import { Product } from '../types';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, size: string, color: string) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onAddToCart, isWishlisted, onToggleWishlist }) => {
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  if (!product) return null;

  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          className="relative max-w-6xl w-full max-h-[90vh] overflow-y-auto bg-zinc-950 border border-white/10 rounded-3xl flex flex-col md:flex-row shadow-2xl shadow-neon-purple/20"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 z-20 p-3 bg-black/50 hover:bg-neon-purple hover:text-black rounded-full transition-all"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image Section */}
          <div className="md:w-1/2 relative bg-zinc-900">
            <img 
              src={product.images[0]} 
              alt={product.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {hasDiscount && (
              <div className="absolute top-8 left-8 px-4 py-2 bg-neon-green text-black font-black uppercase tracking-widest rounded-full text-sm shadow-lg shadow-neon-green/30">
                OFF {Math.round((1 - (product.discountPrice! / product.price)) * 100)}%
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col">
            <div className="flex items-center gap-2 mb-4 text-neon-purple">
              <Zap className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">{product.category}</span>
            </div>

            <h2 className="text-4xl md:text-5xl font-display font-black tracking-tighter uppercase italic mb-4">
              {product.name}
            </h2>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-neon-purple fill-neon-purple' : 'text-zinc-700'}`} 
                  />
                ))}
                <span className="text-sm font-bold ml-2">{product.rating}</span>
              </div>
              <span className="text-zinc-500 text-sm">|</span>
              <span className="text-zinc-500 text-sm font-medium">124 avaliações</span>
            </div>

            <div className="mb-8">
              {hasDiscount ? (
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-black text-neon-green">R$ {product.discountPrice!.toFixed(2)}</span>
                  <span className="text-xl text-zinc-500 line-through">R$ {product.price.toFixed(2)}</span>
                </div>
              ) : (
                <span className="text-4xl font-black">R$ {product.price.toFixed(2)}</span>
              )}
              <p className="text-xs text-zinc-500 mt-2 flex items-center gap-2">
                <CreditCard className="w-3 h-3" />
                Até 10x de R$ {(product.discountPrice || product.price / 10).toFixed(2)} sem juros no cartão
              </p>
            </div>

            <p className="text-zinc-400 mb-10 leading-relaxed text-lg">
              {product.description}
            </p>

            {/* Selection */}
            <div className="space-y-8 mb-12">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4 block">Tamanho</span>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-14 h-14 flex items-center justify-center font-bold border transition-all ${
                        selectedSize === size 
                          ? 'bg-neon-purple text-black border-neon-purple' 
                          : 'bg-transparent border-white/10 hover:border-neon-purple/50'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4 block">Cor</span>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-6 py-3 font-bold border transition-all ${
                        selectedColor === color 
                          ? 'bg-neon-purple text-black border-neon-purple' 
                          : 'bg-transparent border-white/10 hover:border-neon-purple/50'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              {onToggleWishlist && (
                <button 
                  onClick={() => onToggleWishlist(product.id)}
                  className={`p-5 border-2 transition-all flex items-center justify-center ${
                    isWishlisted 
                      ? 'bg-neon-purple border-neon-purple text-black' 
                      : 'border-white/10 text-white hover:border-neon-purple'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              )}
              
              <button 
                onClick={() => onAddToCart(product, selectedSize, selectedColor)}
                disabled={!selectedSize || !selectedColor}
                className="flex-1 py-5 bg-white text-black font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-neon-purple transition-all disabled:opacity-50 disabled:hover:bg-white"
              >
                <ShoppingCart className="w-5 h-5" />
                Adicionar ao Carrinho
              </button>
              
              <button className="flex-1 py-5 border-2 border-neon-green text-neon-green font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-neon-green hover:text-black transition-all">
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </button>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-zinc-900/50 rounded-xl border border-white/5">
                <Truck className="w-5 h-5 text-neon-purple" />
                <div>
                  <span className="text-[10px] font-black uppercase block text-zinc-500">Frete Grátis</span>
                  <span className="text-xs font-bold">Acima de R$ 299</span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-zinc-900/50 rounded-xl border border-white/5">
                <Info className="w-5 h-5 text-neon-purple" />
                <div>
                  <span className="text-[10px] font-black uppercase block text-zinc-500">Troca Fácil</span>
                  <span className="text-xs font-bold">Até 30 dias</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductModal;
