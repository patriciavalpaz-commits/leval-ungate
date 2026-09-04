'use client';

// TOGGLE DE MODO — la app por defecto usa Modo Noche (decisión del usuario: la
// usa de noche y le cansa la luz), pero quien hace Retail Arbitrage escaneando
// en tiendas con luz fluorescente necesita Modo Día — se ofrece como cambio
// rápido, no como "configuración escondida" (feedback de usabilidad del
// usuario). Se recuerda por dispositivo con localStorage.

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Tema = 'noche' | 'dia';
const TemaContext = createContext<{ tema: Tema; alternar: () => void }>({
  tema: 'noche',
  alternar: () => {},
});

export function useTema() {
  return useContext(TemaContext);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [tema, setTema] = useState<Tema>('noche');
  const [listo, setListo] = useState(false);

  useEffect(() => {
    const guardado = window.localStorage.getItem('leval-tema');
    if (guardado === 'dia' || guardado === 'noche') setTema(guardado);
    setListo(true);
  }, []);

  const alternar = (): void => {
    setTema((t) => {
      const nuevo = t === 'noche' ? 'dia' : 'noche';
      window.localStorage.setItem('leval-tema', nuevo);
      return nuevo;
    });
  };

  return (
    <TemaContext.Provider value={{ tema, alternar }}>
      <div
        className={`flex min-h-dvh flex-col bg-[var(--bg)] text-[var(--text-primary)] [font-family:var(--font-body)] ${
          tema === 'noche' ? 'tema-noche' : ''
        }`}
        style={{ visibility: listo ? 'visible' : 'hidden' }}
      >
        {children}
      </div>
    </TemaContext.Provider>
  );
}
