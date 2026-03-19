import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LogIn, LogOut, User, MapPin, History, Zap, Mail, ShieldCheck, ChevronRight, Package, Calendar, CreditCard, Plus, Heart } from 'lucide-react';
import { UserProfile, Order, Address } from '../types';
import { db, collection, query, where, onSnapshot, OperationType, handleFirestoreError } from '../firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onLogin: () => void;
  onLogout: () => void;
  onOpenAdmin: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, user, onLogin, onLogout, onOpenAdmin }) => {
  const [view, setView] = useState<'profile' | 'orders' | 'addresses' | 'wishlist'>('profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);

  useEffect(() => {
    if (!user || !isOpen) return;

    const ordersQuery = query(collection(db, 'orders'), where('userId', '==', user.uid));
    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'orders'));

    const addressesQuery = query(collection(db, 'addresses'), where('userId', '==', user.uid));
    const unsubscribeAddresses = onSnapshot(addressesQuery, (snapshot) => {
      setAddresses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Address)));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'addresses'));

    return () => {
      unsubscribeOrders();
      unsubscribeAddresses();
    };
  }, [user, isOpen]);

  const renderProfile = () => (
    <div className="space-y-8">
      <div className="flex items-center gap-6 p-6 bg-zinc-900 rounded-2xl border border-white/5">
        <img src={user?.photoURL} alt={user?.displayName} className="w-20 h-20 rounded-full border-2 border-neon-purple" />
        <div>
          <h3 className="text-xl font-bold uppercase tracking-tight">{user?.displayName}</h3>
          <p className="text-zinc-500 text-sm flex items-center gap-2">
            <Mail className="w-3 h-3" />
            {user?.email}
          </p>
          <div className="mt-2 flex items-center gap-2 px-2 py-1 bg-neon-purple/10 border border-neon-purple/30 rounded-md w-fit">
            <ShieldCheck className="w-3 h-3 text-neon-purple" />
            <span className="text-[10px] font-black uppercase tracking-widest text-neon-purple">{user?.role}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <button 
          onClick={() => setView('orders')}
          className="flex items-center gap-4 p-5 bg-zinc-900/50 hover:bg-zinc-900 rounded-xl border border-white/5 transition-all text-left group"
        >
          <div className="p-3 bg-zinc-950 rounded-lg group-hover:text-neon-purple transition-colors">
            <History className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <span className="text-sm font-bold uppercase tracking-widest block">Histórico de Pedidos</span>
            <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Acompanhe suas compras</span>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-neon-purple" />
        </button>
        
        <button 
          onClick={() => setView('addresses')}
          className="flex items-center gap-4 p-5 bg-zinc-900/50 hover:bg-zinc-900 rounded-xl border border-white/5 transition-all text-left group"
        >
          <div className="p-3 bg-zinc-950 rounded-lg group-hover:text-neon-purple transition-colors">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <span className="text-sm font-bold uppercase tracking-widest block">Meus Endereços</span>
            <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Gerencie sua entrega</span>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-neon-purple" />
        </button>

        <button 
          onClick={() => setView('wishlist')}
          className="flex items-center gap-4 p-5 bg-zinc-900/50 hover:bg-zinc-900 rounded-xl border border-white/5 transition-all text-left group"
        >
          <div className="p-3 bg-zinc-950 rounded-lg group-hover:text-neon-purple transition-colors">
            <Heart className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <span className="text-sm font-bold uppercase tracking-widest block">Meus Favoritos</span>
            <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Suas peças desejadas</span>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-neon-purple" />
        </button>

        {(user?.role === 'admin' || user?.email === 'junsouzamb324@gmail.com') && (
          <button 
            onClick={() => {
              onOpenAdmin();
              onClose();
            }}
            className="flex items-center gap-4 p-5 bg-neon-purple/10 hover:bg-neon-purple/20 rounded-xl border border-neon-purple/30 transition-all text-left group"
          >
            <div className="p-3 bg-zinc-950 rounded-lg text-neon-purple">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <span className="text-sm font-black uppercase tracking-widest block text-neon-purple">Painel Administrativo</span>
              <span className="text-[10px] text-neon-purple/70 font-bold uppercase tracking-widest">Gerenciar produtos e estoque</span>
            </div>
            <ChevronRight className="w-4 h-4 text-neon-purple" />
          </button>
        )}
      </div>

      <button 
        onClick={onLogout}
        className="w-full py-5 border-2 border-red-500 text-red-500 font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white transition-all"
      >
        <LogOut className="w-5 h-5" />
        Sair da Conta
      </button>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-4">
      <button 
        onClick={() => setView('profile')}
        className="text-xs font-black uppercase tracking-widest text-neon-purple mb-4 flex items-center gap-2"
      >
        <ChevronRight className="w-4 h-4 rotate-180" />
        Voltar ao Perfil
      </button>
      
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900/30 rounded-2xl border border-dashed border-white/10">
          <Package className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Nenhum pedido encontrado</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {orders.map(order => (
            <div key={order.id} className="p-4 bg-zinc-900 rounded-xl border border-white/5 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">Pedido #{order.id.slice(-6)}</span>
                  <div className="flex items-center gap-2 text-xs font-bold mt-1">
                    <Calendar className="w-3 h-3 text-neon-purple" />
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                  order.status === 'delivered' ? 'bg-green-500/10 text-green-500' : 
                  order.status === 'processing' ? 'bg-neon-purple/10 text-neon-purple' : 'bg-zinc-800 text-zinc-400'
                }`}>
                  {order.status}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-3 h-3 text-zinc-500" />
                  <span className="text-xs font-bold uppercase">R$ {order.total.toFixed(2)}</span>
                </div>
                <span className="text-[10px] font-bold text-zinc-500 uppercase">{order.items.length} itens</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderAddresses = () => (
    <div className="space-y-4">
      <button 
        onClick={() => setView('profile')}
        className="text-xs font-black uppercase tracking-widest text-neon-purple mb-4 flex items-center gap-2"
      >
        <ChevronRight className="w-4 h-4 rotate-180" />
        Voltar ao Perfil
      </button>

      {addresses.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900/30 rounded-2xl border border-dashed border-white/10">
          <MapPin className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Nenhum endereço salvo</p>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map(addr => (
            <div key={addr.id} className="p-4 bg-zinc-900 rounded-xl border border-white/5">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-black uppercase tracking-widest text-neon-purple">{addr.type}</span>
                {addr.isDefault && <span className="text-[10px] font-black uppercase tracking-widest bg-white text-black px-2 py-0.5 rounded">Padrão</span>}
              </div>
              <p className="text-sm font-bold">{addr.street}, {addr.number}</p>
              <p className="text-xs text-zinc-500">{addr.neighborhood} - {addr.city}/{addr.state}</p>
              <p className="text-xs text-zinc-500 mt-1">CEP: {addr.zipCode}</p>
            </div>
          ))}
        </div>
      )}
      
      <button className="w-full py-4 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-black uppercase tracking-widest rounded-xl border border-white/5 transition-all flex items-center justify-center gap-2">
        <Plus className="w-4 h-4" />
        Adicionar Endereço
      </button>
    </div>
  );

  const renderWishlist = () => (
    <div className="space-y-4">
      <button 
        onClick={() => setView('profile')}
        className="text-xs font-black uppercase tracking-widest text-neon-purple mb-4 flex items-center gap-2"
      >
        <ChevronRight className="w-4 h-4 rotate-180" />
        Voltar ao Perfil
      </button>

      {!user?.wishlist || user.wishlist.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900/30 rounded-2xl border border-dashed border-white/10">
          <Heart className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Sua lista está vazia</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Você tem {user.wishlist.length} itens salvos</p>
          <div className="grid grid-cols-1 gap-4">
            {user.wishlist.map(id => (
              <div key={id} className="flex items-center gap-4 p-3 bg-zinc-900 rounded-xl border border-white/5">
                <div className="w-16 h-16 bg-zinc-950 rounded-lg overflow-hidden">
                  <img src={`https://picsum.photos/seed/${id}/200/200`} alt="Produto" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold uppercase tracking-widest block">ID: #{id.slice(-6)}</span>
                  <span className="text-[10px] text-neon-purple font-black uppercase tracking-widest">Ver na loja</span>
                </div>
                <Heart className="w-4 h-4 text-neon-purple fill-neon-purple" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const handleClose = () => {
    setView('profile');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className="relative max-w-md w-full bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-neon-purple/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-8 border-b border-white/10 flex items-center justify-between bg-zinc-900/50">
              <div className="flex items-center gap-3">
                {view === 'profile' ? <User className="w-6 h-6 text-neon-purple" /> : 
                 view === 'orders' ? <History className="w-6 h-6 text-neon-purple" /> : 
                 view === 'addresses' ? <MapPin className="w-6 h-6 text-neon-purple" /> :
                 <Heart className="w-6 h-6 text-neon-purple" />}
                <h2 className="text-2xl font-display font-black tracking-tighter uppercase italic">
                  {user ? (
                    view === 'profile' ? <>Sua <span className="text-neon-purple">Conta</span></> : 
                    view === 'orders' ? <>Seus <span className="text-neon-purple">Pedidos</span></> : 
                    view === 'addresses' ? <>Seus <span className="text-neon-purple">Endereços</span></> :
                    <>Meus <span className="text-neon-purple">Favoritos</span></>
                  ) : (
                    <>Acesse sua <span className="text-neon-purple">Conta</span></>
                  )}
                </h2>
              </div>
              <button 
                onClick={handleClose}
                className="p-2 hover:bg-neon-purple hover:text-black rounded-full transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8">
              {user ? (
                view === 'profile' ? renderProfile() : 
                view === 'orders' ? renderOrders() : 
                view === 'addresses' ? renderAddresses() :
                renderWishlist()
              ) : (
                <div className="text-center">
                  <div className="mb-10 flex flex-col items-center">
                    <div className="w-20 h-20 bg-neon-purple/10 border border-neon-purple/30 rounded-full flex items-center justify-center mb-6">
                      <Zap className="w-10 h-10 text-neon-purple" />
                    </div>
                    <h3 className="text-2xl font-bold uppercase tracking-tight mb-4">Bem-vindo à UrbanZap</h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">
                      Faça login para salvar seus pedidos, endereços e ter acesso a coleções exclusivas.
                    </p>
                  </div>

                  <button 
                    onClick={onLogin}
                    className="w-full py-5 bg-white text-black font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-neon-purple transition-all"
                  >
                    <LogIn className="w-5 h-5" />
                    Entrar com Google
                  </button>
                  
                  <p className="mt-8 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                    Ao entrar, você concorda com nossos <br />
                    <span className="text-zinc-400 underline cursor-pointer">Termos de Uso</span> e <span className="text-zinc-400 underline cursor-pointer">Privacidade</span>
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
