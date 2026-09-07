import React, { useState } from 'react';
import { Crown, Disc } from 'lucide-react';

export function Avatar({ src, name = 'DJ', size = 'md', isSuperAdmin = false, className = '' }) {
  const [hasError, setHasError] = useState(false);

  // Dimensiones según tamaño
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-20 h-20 text-xl',
  }[size] || 'w-10 h-10 text-sm';

  // Obtener iniciales limpias
  const initials = (name || 'DJ')
    .trim()
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();

  const borderClass = isSuperAdmin
    ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-dark-950'
    : 'ring-1 ring-white/15';

  return (
    <div className={`relative inline-flex flex-shrink-0 items-center justify-center rounded-full overflow-hidden select-none ${sizeClasses} ${borderClass} ${className}`}>
      {src && !hasError ? (
        <img
          src={src}
          alt={name}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover rounded-full"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-full rounded-full flex items-center justify-center font-bold bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 text-white shadow-inner">
          {initials || <Disc className="w-1/2 h-1/2 animate-spin-slow" />}
        </div>
      )}

      {isSuperAdmin && size !== 'xs' && (
        <div className="absolute -top-1 -right-1 bg-amber-500 text-black rounded-full p-0.5 shadow-md">
          <Crown className="w-2.5 h-2.5 text-dark-950" />
        </div>
      )}
    </div>
  );
}
