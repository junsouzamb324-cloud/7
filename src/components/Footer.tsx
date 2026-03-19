import React from 'react';
import { Instagram, Twitter, Youtube, Zap, MessageCircle, MapPin, Mail, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-zinc-950 border-t border-white/10 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          {/* Brand */}
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-1 group cursor-pointer">
              <span className="text-2xl font-black tracking-tighter uppercase">
                SHADOW<span className="text-white">.</span>
              </span>
              <div className="w-2 h-2 bg-neon-purple mt-2" />
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
              A SHADOW. é mais que uma loja, é um movimento. Trazemos a essência das ruas para o seu guarda-roupa com design premium e atitude.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="p-3 bg-zinc-900 rounded-xl border border-white/5 hover:bg-neon-purple hover:text-black transition-all">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-3 bg-zinc-900 rounded-xl border border-white/5 hover:bg-neon-purple hover:text-black transition-all">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-3 bg-zinc-900 rounded-xl border border-white/5 hover:bg-neon-purple hover:text-black transition-all">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-8">
            <h3 className="text-sm font-black uppercase tracking-widest text-neon-purple">Navegação</h3>
            <ul className="flex flex-col gap-4">
              <li><a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">Início</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">Coleções</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">Novidades</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">Outlet</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="flex flex-col gap-8">
            <h3 className="text-sm font-black uppercase tracking-widest text-neon-purple">Suporte</h3>
            <ul className="flex flex-col gap-4">
              <li><a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">Minha Conta</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">Rastrear Pedido</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">Trocas e Devoluções</a></li>
              <li><a href="#" className="text-zinc-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest">FAQ</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-8">
            <h3 className="text-sm font-black uppercase tracking-widest text-neon-purple">Contato</h3>
            <ul className="flex flex-col gap-6">
              <li className="flex items-center gap-4 text-zinc-400 group">
                <div className="p-3 bg-zinc-900 rounded-xl border border-white/5 group-hover:text-neon-purple transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold uppercase tracking-widest">WhatsApp: (11) 99999-9999</span>
              </li>
              <li className="flex items-center gap-4 text-zinc-400 group">
                <div className="p-3 bg-zinc-900 rounded-xl border border-white/5 group-hover:text-neon-purple transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold uppercase tracking-widest">contato@urbanzap.com</span>
              </li>
              <li className="flex items-center gap-4 text-zinc-400 group">
                <div className="p-3 bg-zinc-900 rounded-xl border border-white/5 group-hover:text-neon-purple transition-colors">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold uppercase tracking-widest">São Paulo, SP - Brasil</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
            © 2026 SHADOW. Streetwear. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-8">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" alt="Visa" className="h-4 opacity-30 grayscale hover:grayscale-0 transition-all" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" alt="Mastercard" className="h-6 opacity-30 grayscale hover:grayscale-0 transition-all" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_Pix.png/1200px-Logo_Pix.png" alt="Pix" className="h-6 opacity-30 grayscale hover:grayscale-0 transition-all" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
