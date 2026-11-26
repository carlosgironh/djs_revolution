import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { Check, Sparkles } from 'lucide-react';

const ToastContext = createContext({
  showToast: () => {},
});

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const showToast = useCallback((title, subtitle = '') => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ title, subtitle, id: Date.now() });
    timerRef.current = setTimeout(() => {
      setToast(null);
    }, 3600);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Sleek Studio Toast Notification */}
      <div
        aria-live="polite"
        className={`fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-[300] flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-violet-500/45 bg-[#0b0e1a]/95 backdrop-blur-xl shadow-[0_22px_50px_rgba(0,0,0,0.65)] max-w-sm transition-all duration-300 ${
          toast ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-24 opacity-0 pointer-events-none'
        }`}
      >
        <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center bg-violet-500/20 text-violet-300 border border-violet-400/30">
          {toast?.subtitle ? <Check className="w-4 h-4 stroke-[2.6]" /> : <Sparkles className="w-4 h-4" />}
        </div>
        <div className="min-w-0">
          <b className="block text-[13px] font-bold text-[#f2f4fc] truncate">{toast?.title}</b>
          {toast?.subtitle && (
            <small className="block text-[11.5px] text-[#8f96b3] leading-snug">{toast.subtitle}</small>
          )}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
