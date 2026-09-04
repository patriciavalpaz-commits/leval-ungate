// CUENTA — protagonista: el estado de la suscripción y la conexión de la
// extensión (lo que el usuario necesita saber sobre "su cuenta", no otra vez
// el producto). La conexión real de la extensión y el auto-cobro llegan en la
// Sesión 6 — hoy la pantalla existe completa, con el estado "no conectada".

'use client';

import { CreditCard, Puzzle, LogOut, HelpCircle, ChevronRight, Sun, Moon } from 'lucide-react';
import { useTema } from '../ThemeProvider';

export default function Cuenta() {
  const { tema, alternar } = useTema();
  return (
    <div className="mx-auto w-full max-w-[480px] px-5 pb-8 pt-6">
      <h1 className="text-[22px] font-bold [font-family:var(--font-body)]">Cuenta</h1>

      <div className="mt-5 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_15%,transparent)] bg-[var(--surface)] p-5">
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--chip-bg)' }}>
            <CreditCard size={18} color="var(--accent)" />
          </span>
          <div>
            <p className="text-[14.5px] font-semibold">Plan Anual</p>
            <p className="text-[12.5px] text-[var(--text-tertiary)]">$16.58/mes · próxima renovación 28 sep 2026</p>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_15%,transparent)] bg-[var(--surface)] p-5">
        <div className="flex items-center gap-3">
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-full"
            style={{ background: 'color-mix(in oklab, var(--text-tertiary) 16%, transparent)' }}
          >
            <Puzzle size={18} color="var(--text-secondary)" />
          </span>
          <div className="flex-1">
            <p className="text-[14.5px] font-semibold">Extensión del navegador</p>
            <p className="text-[12.5px] text-[var(--text-tertiary)]">No conectada — sin ella, el Sello usa solo datos de mercado</p>
          </div>
        </div>
        <button
          type="button"
          className="mt-4 flex h-11 w-full items-center justify-center rounded-[var(--radius-button)] text-[13.5px] font-semibold [touch-action:manipulation]"
          style={{ background: 'var(--accent)', color: 'var(--bg)' }}
        >
          Instalar y conectar
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_15%,transparent)] bg-[var(--surface)] p-5">
        <div className="flex items-center gap-3">
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-full"
            style={{ background: 'var(--chip-bg)' }}
          >
            {tema === 'noche' ? <Moon size={17} color="var(--accent)" /> : <Sun size={17} color="var(--accent)" />}
          </span>
          <div>
            <p className="text-[14.5px] font-semibold">Apariencia</p>
            <p className="text-[12.5px] text-[var(--text-tertiary)]">
              {tema === 'noche' ? 'Modo noche — para usarla de noche' : 'Modo día — mejor luz para escanear en tienda'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={alternar}
          aria-label="Cambiar apariencia"
          className="relative h-8 w-14 shrink-0 rounded-full transition-colors [touch-action:manipulation]"
          style={{ background: tema === 'noche' ? 'var(--accent)' : 'var(--surface-2)' }}
        >
          <span
            className="absolute top-1 size-6 rounded-full bg-[var(--bg)] transition-all"
            style={{ left: tema === 'noche' ? '28px' : '4px' }}
          />
        </button>
      </div>

      <div className="mt-5 flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_15%,transparent)]">
        {[
          { label: 'Soporte', icon: HelpCircle },
          { label: 'Términos y privacidad', icon: HelpCircle },
        ].map(({ label, icon: Icon }, i, arr) => (
          <button
            key={label}
            type="button"
            className={`flex h-14 w-full items-center gap-3 bg-[var(--surface)] px-4 text-left [touch-action:manipulation] ${
              i < arr.length - 1 ? 'border-b border-[color-mix(in_oklab,var(--text-tertiary)_15%,transparent)]' : ''
            }`}
          >
            <Icon size={17} color="var(--text-tertiary)" />
            <span className="flex-1 text-[14px]">{label}</span>
            <ChevronRight size={16} color="var(--text-tertiary)" />
          </button>
        ))}
      </div>

      <button
        type="button"
        className="mt-5 flex h-12 w-full items-center justify-center gap-2 text-[14px] font-medium [touch-action:manipulation]"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <LogOut size={16} /> Cerrar sesión
      </button>
    </div>
  );
}
