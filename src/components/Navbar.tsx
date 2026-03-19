import React, { useState } from 'react';
import { ShoppingCart, User, Search, Menu, X, Zap, ShieldCheck, Settings, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile | null;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
  cartCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ user, onOpenCart, onOpenAuth, onOpenAdmin, onLogout, cartCount }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 glass backdrop-blur-2xl border-b border-white/5">
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Left Section: Logo + Nav Links */}
        <div className="flex items-center gap-10">
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 hover:text-neon-purple transition-colors lg:hidden"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Logo */}
          <div className="flex items-center gap-1 group cursor-pointer shrink-0">
            <span className="text-xl font-black tracking-tighter uppercase">
              SHADOW<span className="text-white">.</span>
            </span>
            <div className="w-2 h-2 bg-neon-purple mt-1" />
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            <a href="#" className="text-[11px] font-black uppercase tracking-widest hover:text-neon-purple transition-colors">Lançamentos</a>
            <a href="#" className="text-[11px] font-black uppercase tracking-widest hover:text-neon-purple transition-colors">Mais Vendidos</a>
            <a href="#" className="text-[11px] font-black uppercase tracking-widest text-neon-purple hover:text-white transition-colors">Drop Exclusivo</a>
          </div>
        </div>

        {/* Middle/Right Section: Search + Actions */}
        <div className="flex-1 flex items-center justify-end gap-6">
          {/* Search Bar */}
          <div className="hidden md:flex items-center relative max-w-xs w-full">
            <Search className="w-4 h-4 absolute left-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Buscar..."
              className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-11 pr-4 text-xs outline-none focus:border-neon-purple/50 transition-all"
            />
          </div>

          {/* Admin Gear + PAINEL */}
          {(user?.role === 'admin' || user?.email === 'junsouzamb324@gmail.com') && (
            <button 
              onClick={onOpenAdmin}
              className="flex items-center gap-2 text-neon-purple hover:text-white transition-all group"
            >
              <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
              <span className="text-[10px] font-black uppercase tracking-widest hidden xl:block">Painel</span>
            </button>
          )}

          {/* Cart */}
          <button 
            onClick={onOpenCart}
            className="p-2 hover:text-neon-purple transition-colors relative"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-neon-purple text-black text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Section */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden sm:flex flex-col items-end leading-none">
                  <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Olá,</span>
                  <span className="text-[10px] font-black uppercase tracking-tight">{user.displayName.split(' ')[0]}</span>
                </div>
                <button 
                  onClick={onLogout}
                  className="p-2 hover:text-neon-purple transition-colors"
                  title="Sair"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button 
                onClick={onOpenAuth}
                className="p-2 hover:text-neon-purple transition-colors"
              >
                <User className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-16 left-0 w-full bg-zinc-950 border-b border-white/10 p-4 flex flex-col gap-4"
          >
            <a href="#" className="text-lg font-bold uppercase tracking-widest py-2 border-b border-white/5">Novidades</a>
            <a href="#" className="text-lg font-bold uppercase tracking-widest py-2 border-b border-white/5">Coleções</a>
            <a href="#" className="text-lg font-bold uppercase tracking-widest py-2 border-b border-white/5">Outlet</a>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
