'use client';

// Nav inferior de la app — 4 secciones, mismos nombres/íconos que el carrusel de
// la landing ("La app por dentro") para que el usuario reconozca el producto que
// ya vio prometido. safe-area respetada, ícono activo con fill de acento (nunca
// tapado por su fondo — DESIGN-CORE §7 ítem 17).

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Rss, History, User } from 'lucide-react';

const ITEMS = [
  { href: '/app/buscar', label: 'Buscar', icon: Search },
  { href: '/app/feed', label: 'Feed', icon: Rss },
  { href: '/app/historial', label: 'Historial', icon: History },
  { href: '/app/cuenta', label: 'Cuenta', icon: User },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-[64px] items-center justify-around border-t border-[color-mix(in_oklab,var(--text-tertiary)_18%,transparent)] bg-[var(--surface)] px-2 pb-[env(safe-area-inset-bottom)]">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const activo = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className="flex min-w-14 flex-col items-center gap-1 py-1 [touch-action:manipulation]"
          >
            <Icon size={20} color={activo ? 'var(--accent)' : 'var(--text-tertiary)'} strokeWidth={activo ? 2.4 : 2} />
            <span
              className="text-[10px] font-semibold"
              style={{ color: activo ? 'var(--accent)' : 'var(--text-tertiary)' }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
