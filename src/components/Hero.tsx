import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Zap } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background with noise and gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black opacity-90" />
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-neon-purple/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-neon-green/10 blur-[120px] rounded-full" />
        <img 
          src="https://picsum.photos/seed/streetwear-hero/1920/1080?grayscale" 
          alt="Streetwear Hero" 
          className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <div className="flex items-center gap-2 mb-6 px-4 py-1 rounded-full border border-neon-purple/50 bg-neon-purple/10 backdrop-blur-md">
            <Zap className="w-4 h-4 text-neon-purple" />
            <span className="text-xs font-bold uppercase tracking-widest text-neon-purple">Nova Coleção Drop #01</span>
          </div>

          <h1 className="text-4xl md:text-9xl font-display font-black tracking-tighter uppercase italic leading-[0.85] mb-8 glitch-text">
            Defina seu <span className="text-neon-purple">Estilo</span>.<br />
            Domine as <span className="text-neon-green">Ruas</span>.
          </h1>

          <p className="max-w-2xl text-sm md:text-xl text-zinc-400 mb-10 font-medium leading-relaxed">
            A atitude urbana encontra o design premium. Exclusividade, conforto e estilo para quem não tem medo de se destacar.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button className="group relative px-8 py-4 md:px-10 md:py-5 bg-white text-black font-black uppercase tracking-widest rounded-none overflow-hidden transition-all hover:pr-14">
              <span className="relative z-10">Explorar Coleção</span>
              <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all" />
              <div className="absolute inset-0 bg-neon-purple translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
            </button>
            
            <button className="px-8 py-4 md:px-10 md:py-5 border-2 border-white/20 hover:border-neon-purple hover:text-neon-purple font-black uppercase tracking-widest transition-all">
              Ver Novidades
            </button>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50"
      >
        <span className="text-[10px] uppercase tracking-widest font-bold">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-white to-transparent" />
      </motion.div>
    </section>
  );
};

export default Hero;
