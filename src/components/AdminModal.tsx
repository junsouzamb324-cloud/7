import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Plus, Trash2, Zap, Package, ShoppingBag, ArrowLeft, History, TrendingUp, TrendingDown } from 'lucide-react';
import { storage, ref, uploadBytes, getDownloadURL, db, doc, setDoc, deleteDoc, updateDoc, OperationType, handleFirestoreError, collection, getDocs, query, orderBy, limit, addDoc, Timestamp } from '../firebase';
import { Product, StockMovement } from '../types';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
}

const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, products }) => {
  const [view, setView] = useState<'list' | 'form' | 'stock' | 'history'>('list');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saleAmount, setSaleAmount] = useState<Record<string, number>>({});
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    category: 'Camisetas',
    sizes: ['P', 'M', 'G', 'GG'],
    colors: ['Preto', 'Branco'],
    images: [],
    stock: 10,
    rating: 5.0,
    reviews: []
  });

  useEffect(() => {
    if (view === 'history' && isOpen) {
      fetchMovements();
    }
  }, [view, isOpen]);

  const fetchMovements = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'stock_movements'), orderBy('createdAt', 'desc'), limit(50));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
      })) as StockMovement[];
      setMovements(docs);
    } catch (error) {
      console.error('Error fetching movements:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: 'Camisetas',
      sizes: ['P', 'M', 'G', 'GG'],
      colors: ['Preto', 'Branco'],
      images: [],
      stock: 10,
      rating: 5.0,
      reviews: []
    });
    setEditingId(null);
  };

  const handleEdit = (product: Product) => {
    setFormData(product);
    setEditingId(product.id);
    setView('form');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'products', id));
      alert('Produto excluído com sucesso!');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setLoading(true);
    try {
      const file = e.target.files[0];
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFormData(prev => ({ ...prev, images: [...(prev.images || []), url] }));
    } catch (error) {
      console.error('Upload Error:', error);
      alert('Erro ao subir imagem.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || (formData.images?.length || 0) === 0) {
      alert('Preencha todos os campos obrigatórios e adicione pelo menos uma imagem.');
      return;
    }
    
    setLoading(true);
    try {
      const productId = editingId || Date.now().toString();
      const product: Product = {
        ...formData,
        id: productId,
        price: Number(formData.price),
        stock: Number(formData.stock),
        rating: formData.rating || 5.0,
        reviews: formData.reviews || [],
        images: formData.images || [],
        sizes: formData.sizes || ['P', 'M', 'G', 'GG'],
        colors: formData.colors || ['Preto', 'Branco'],
      } as Product;

      await setDoc(doc(db, 'products', productId), product);

      // Record entry if it's a new product or stock was increased
      if (!editingId || (formData.stock || 0) > 0) {
        const existingProduct = products.find(p => p.id === productId);
        const stockDiff = existingProduct ? (product.stock - existingProduct.stock) : product.stock;
        
        if (stockDiff > 0) {
          await addDoc(collection(db, 'stock_movements'), {
            productId,
            productName: product.name,
            type: 'entry',
            quantity: stockDiff,
            value: 0, // Cost of entry could be added here if needed
            reason: editingId ? 'Ajuste de estoque' : 'Novo produto',
            createdAt: Timestamp.now()
          });
        }
      }

      alert(editingId ? 'Produto atualizado!' : 'Produto adicionado!');
      setView('list');
      resetForm();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'products');
    } finally {
      setLoading(false);
    }
  };

  const handleInPersonSale = async (productId: string) => {
    const amount = saleAmount[productId] || 1;
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    if (product.stock < amount) {
      alert('Estoque insuficiente para esta venda!');
      return;
    }

    setLoading(true);
    try {
      await updateDoc(doc(db, 'products', productId), {
        stock: product.stock - amount
      });

      // Record exit movement
      await addDoc(collection(db, 'stock_movements'), {
        productId,
        productName: product.name,
        type: 'exit',
        quantity: amount,
        value: product.price * amount,
        reason: 'Venda Presencial',
        createdAt: Timestamp.now()
      });

      alert('Venda presencial registrada com sucesso!');
      setSaleAmount(prev => ({ ...prev, [productId]: 0 }));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `products/${productId}`);
    } finally {
      setLoading(false);
    }
  };

  const renderHistory = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500">Histórico de Movimentações</h3>
        <button 
          onClick={() => setView('list')}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white font-bold uppercase text-[10px] rounded-lg hover:bg-white hover:text-black transition-all w-full sm:w-auto justify-center"
        >
          <ArrowLeft className="w-3 h-3" />
          Voltar
        </button>
      </div>

      <div className="space-y-3 max-h-[60vh] sm:max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {movements.length === 0 && !loading && (
          <div className="text-center py-10 text-zinc-500">
            <History className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-xs font-bold uppercase tracking-widest">Nenhuma movimentação encontrada</p>
          </div>
        )}
        {movements.map(movement => (
          <div key={movement.id} className="p-4 bg-zinc-900 rounded-2xl border border-white/5 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${movement.type === 'entry' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {movement.type === 'entry' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <h4 className="text-xs font-bold uppercase tracking-tight truncate">{movement.productName}</h4>
                <span className="text-[10px] font-black text-zinc-500">
                  {new Date(movement.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-medium text-zinc-400">
                  {movement.type === 'entry' ? 'Entrada' : 'Saída'}: {movement.quantity} un.
                  {movement.reason && ` • ${movement.reason}`}
                </p>
                {movement.value > 0 && (
                  <span className="text-[10px] font-black text-neon-green">
                    + R$ {movement.value.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStock = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-500">Gestão de Estoque & Vendas</h3>
        <button 
          onClick={() => setView('list')}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 text-white font-bold uppercase text-[10px] rounded-lg hover:bg-white hover:text-black transition-all w-full sm:w-auto justify-center"
        >
          <ArrowLeft className="w-3 h-3" />
          Voltar
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 max-h-[60vh] sm:max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {products.map(product => (
          <div key={product.id} className="p-4 sm:p-5 bg-zinc-900 rounded-2xl border border-white/5">
            <div className="flex items-center gap-4 mb-4">
              <img src={product.images[0]} alt={product.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover" />
              <div className="flex-1">
                <h4 className="text-xs sm:text-sm font-bold uppercase tracking-tight line-clamp-1">{product.name}</h4>
                <p className="text-[9px] sm:text-[10px] font-black text-neon-purple uppercase mt-1">
                  Estoque: <span className={product.stock <= 5 ? 'text-red-500' : 'text-neon-purple'}>{product.stock}</span>
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-white/5">
              <div className="flex-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">Qtd. Vendida Presencial</label>
                <input 
                  type="number" 
                  min="1"
                  max={product.stock}
                  value={saleAmount[product.id] || ''}
                  onChange={e => setSaleAmount(prev => ({ ...prev, [product.id]: parseInt(e.target.value) }))}
                  placeholder="Ex: 1"
                  className="w-full px-3 py-2 bg-zinc-950 border border-white/10 rounded-lg focus:border-neon-purple outline-none text-xs"
                />
              </div>
              <button 
                onClick={() => handleInPersonSale(product.id)}
                disabled={loading || !saleAmount[product.id]}
                className="px-4 py-3 sm:py-2 bg-neon-purple text-black font-black uppercase text-[10px] rounded-lg hover:bg-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-3 h-3" />
                Registrar Venda
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderList = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 bg-zinc-900/50 p-1 rounded-xl overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setView('list')}
            className={`flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'list' ? 'bg-neon-purple text-black' : 'text-zinc-500 hover:text-white'}`}
          >
            Produtos
          </button>
          <button 
            onClick={() => setView('stock')}
            className={`flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'stock' ? 'bg-neon-purple text-black' : 'text-zinc-500 hover:text-white'}`}
          >
            Estoque
          </button>
          <button 
            onClick={() => setView('history')}
            className={`flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'history' ? 'bg-neon-purple text-black' : 'text-zinc-500 hover:text-white'}`}
          >
            Histórico
          </button>
        </div>
        <button 
          onClick={() => {
            resetForm();
            setView('form');
          }}
          className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-neon-purple text-black font-bold uppercase text-[10px] rounded-lg hover:bg-white transition-all"
        >
          <Plus className="w-3 h-3" />
          Novo Produto
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 max-h-[60vh] sm:max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {products.map(product => (
          <div key={product.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-zinc-900 rounded-2xl border border-white/5 group">
            <img src={product.images[0]} alt={product.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover" />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-tight truncate">{product.name}</h4>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[9px] sm:text-[10px] font-black text-neon-purple uppercase">R$ {product.price.toFixed(2)}</span>
                <span className="text-[9px] sm:text-[10px] font-bold text-zinc-500 uppercase">Estoque: {product.stock}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <button 
                onClick={() => handleEdit(product)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-400 hover:text-white"
              >
                <Upload className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleDelete(product.id)}
                className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-zinc-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <button 
        type="button"
        onClick={() => setView('list')}
        className="text-[10px] font-black uppercase tracking-widest text-neon-purple mb-4 flex items-center gap-2"
      >
        Voltar para Lista
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2 block">Nome do Produto</label>
          <input 
            type="text" 
            required
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl focus:border-neon-purple outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2 block">Categoria</label>
          <select 
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl focus:border-neon-purple outline-none"
          >
            <option>Camisetas</option>
            <option>Calças</option>
            <option>Moletons</option>
            <option>Acessórios</option>
            <option>Jaquetas</option>
            <option>Calçados</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2 block">Descrição</label>
        <textarea 
          rows={3}
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl focus:border-neon-purple outline-none resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2 block">Preço (R$)</label>
          <input 
            type="number" 
            step="0.01"
            required
            value={formData.price ?? ''}
            onChange={e => {
              const val = e.target.value;
              setFormData({ ...formData, price: val === '' ? undefined : parseFloat(val) });
            }}
            className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl focus:border-neon-purple outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2 block">Estoque</label>
          <input 
            type="number" 
            value={formData.stock ?? ''}
            onChange={e => {
              const val = e.target.value;
              setFormData({ ...formData, stock: val === '' ? undefined : parseInt(val) });
            }}
            className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-xl focus:border-neon-purple outline-none"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-2 block">Imagens</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          {formData.images?.map((url, i) => (
            <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-white/10">
              <img src={url} alt="Preview" className="w-full h-full object-cover" />
              <button 
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, images: prev.images?.filter((_, idx) => idx !== i) }))}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          <label className="aspect-square rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-neon-purple transition-all">
            {loading ? <div className="w-6 h-6 border-2 border-neon-purple border-t-transparent rounded-full animate-spin" /> : <Plus className="w-6 h-6 text-zinc-500" />}
            <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
          </label>
        </div>
      </div>

      <button 
        type="submit"
        disabled={loading}
        className="w-full py-5 bg-white text-black font-black uppercase tracking-widest hover:bg-neon-purple transition-all disabled:opacity-50"
      >
        {editingId ? 'Atualizar Produto' : 'Salvar Produto'}
      </button>
    </form>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className="relative max-w-2xl w-full h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto bg-zinc-950 border-x sm:border border-white/10 sm:rounded-3xl p-4 sm:p-8 shadow-2xl shadow-neon-purple/20"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 hover:bg-neon-purple hover:text-black rounded-full transition-all z-10 bg-black/50 sm:bg-transparent">
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div className="flex items-center gap-3 mb-6 sm:mb-8 text-neon-purple">
              <Zap className="w-6 h-6 sm:w-8 sm:h-8" />
              <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tighter uppercase italic">
                Painel <span className="text-neon-purple">Admin</span>
              </h2>
            </div>

            {view === 'list' ? renderList() : view === 'form' ? renderForm() : view === 'stock' ? renderStock() : renderHistory()}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdminModal;
