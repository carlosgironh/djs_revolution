import React from 'react';
import { X, Heart, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';
import { PAYPAL_HOSTED_BUTTON_ID } from '../../lib/supabase';

export function DonationModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const paypalDonateUrl = `https://www.paypal.com/donate/?hosted_button_id=${PAYPAL_HOSTED_BUTTON_ID}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-dark-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl shadow-amber-900/30 z-10 animate-in zoom-in-95 duration-200">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="relative w-16 h-16 mx-auto mb-3">
            <img 
              src="/logo_emblem.png" 
              alt="DJ's Revolution" 
              className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-dark-950 flex items-center justify-center shadow-md">
              <Heart className="w-3.5 h-3.5 fill-dark-950" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            Sembrar en el Ministerio 🕊️
          </h3>
          <p className="text-xs text-amber-300 font-medium">
            Apoyo a Servidores de Audio y Video de DJ's Revolution
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-center mb-5">
          <p className="text-xs text-zinc-300 italic leading-relaxed">
            "Cada uno dé como propuso en su corazón: no con tristeza, ni por necesidad, porque Dios ama al dador alegre."
          </p>
          <span className="text-[10px] text-zinc-500 font-semibold block mt-1">
            — 2 Corintios 9:7
          </span>
        </div>

        <div className="space-y-2 text-xs text-zinc-300 mb-6">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Pasarela oficial, segura y encriptada por PayPal.</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span>Sostiene los costos de servidores de streaming HD y ancho de banda.</span>
          </div>
        </div>

        {/* Botón Oficial de PayPal Limpio (Sin script problemático) */}
        <a
          href={paypalDonateUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="w-full py-3 px-4 rounded-2xl font-bold text-sm text-dark-950 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 shadow-xl shadow-amber-900/40 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Heart className="w-4 h-4 fill-dark-950" />
          <span>Ofrendar Ahora con PayPal</span>
          <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
        </a>

        <p className="text-[10px] text-zinc-500 text-center mt-3">
          ID de donación registrado: {PAYPAL_HOSTED_BUTTON_ID}
        </p>

      </div>
    </div>
  );
}
