// SHELL DE LA APP INTERNA — Leval Ungate (Sesión 5)
// Modo Noche por defecto (FICHA-ARTE.md — decisión del usuario), con cambio
// rápido a Modo Día para escanear en tiendas con luz fuerte (ThemeProvider).
// min-h-dvh + flex-col + nav al fondo (DESIGN-CORE §2).

import { ThemeProvider } from './ThemeProvider';
import { BottomNav } from './BottomNav';
import { BienvenidaVideo } from './BienvenidaVideo';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <div className="flex-1 overflow-y-auto pb-20">{children}</div>
      <BottomNav />
      <BienvenidaVideo />
    </ThemeProvider>
  );
}
