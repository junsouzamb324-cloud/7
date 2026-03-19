import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingCart, Trash2, Plus, Minus, CreditCard, Zap } from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, size: string, color: string, delta: number) => void;
  onRemoveItem: (id: string, size: string, color: string) => void;
  onCheckout: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, items, onUpdateQuantity, onRemoveItem, onCheckout }) => {
  const total = items.reduce((sum, item) => sum + (item.discountPrice || item.price) * item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 z-[160] w-full max-w-md h-full bg-zinc-950 border-l border-white/10 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-6 h-6 text-neon-purple" />
                <h2 className="text-2xl font-display font-black tracking-tighter uppercase italic">Seu <span className="text-neon-purple">Carrinho</span></h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-neon-purple hover:text-black rounded-full transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <ShoppingCart className="w-16 h-16 text-zinc-800 mb-6" />
                  <p className="text-zinc-500 text-lg font-medium italic mb-8">Seu carrinho está vazio.</p>
                  <button 
                    onClick={onClose}
                    className="px-8 py-4 bg-white text-black font-black uppercase tracking-widest hover:bg-neon-purple transition-all"
                  >
                    Explorar Coleção
                  </button>
                </div>
              ) : (
                items.map((item, idx) => (
                  <motion.div 
                    key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex gap-6 group"
                  >
                    <div className="w-24 h-32 bg-zinc-900 rounded-xl overflow-hidden flex-shrink-0">
                      <img 
                        src={item.images[0]} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between mb-1">
                        <h3 className="font-bold text-sm uppercase tracking-wider group-hover:text-neon-purple transition-colors">{item.name}</h3>
                        <button 
                          onClick={() => onRemoveItem(item.id, item.selectedSize, item.selectedColor)}
                          className="text-zinc-500 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex gap-2 mb-4">
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-zinc-900 border border-white/5 rounded-md text-zinc-400">Tam: {item.selectedSize}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-zinc-900 border border-white/5 rounded-md text-zinc-400">Cor: {item.selectedColor}</span>
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-3 bg-zinc-900 rounded-lg border border-white/5 p-1">
                          <button 
                            onClick={() => onUpdateQuantity(item.id, item.selectedSize, item.selectedColor, -1)}
                            className="p-1 hover:text-neon-purple transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateQuantity(item.id, item.selectedSize, item.selectedColor, 1)}
                            className="p-1 hover:text-neon-purple transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="font-black text-neon-green">R$ {((item.discountPrice || item.price) * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-8 border-t border-white/10 bg-zinc-950/80 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Subtotal</span>
                  <span className="text-2xl font-black">R$ {total.toFixed(2)}</span>
                </div>
                
                <div className="space-y-4">
                  <button 
                    onClick={onCheckout}
                    className="w-full py-5 bg-white text-black font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-neon-purple transition-all"
                  >
                    <CreditCard className="w-5 h-5" />
                    Finalizar Compra
                  </button>
                  <p className="text-[10px] text-center text-zinc-500 font-bold uppercase tracking-widest">
                    <Zap className="inline w-3 h-3 text-neon-purple mr-1" />
                    Entrega expressa disponível para sua região
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
