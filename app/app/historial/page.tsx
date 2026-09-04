// HISTORIAL — protagonista: la bitácora de todo lo que el usuario ya escaneó,
// con su veredicto (autorizado/bloqueado) — el dispositivo ownable "entrada
// numerada" vive aquí de forma natural. Datos semilla, nunca vacío.

import { Check, X } from 'lucide-react';

const ENTRADAS = [
  { n: 52, nombre: 'Cargador Inalámbrico 15W — Anker', fecha: 'Hoy, 9:41', estado: 'ok' as const, ganancia: '+$8.40' },
  { n: 51, nombre: 'Mochila antirrobo con USB', fecha: 'Ayer, 20:12', estado: 'bloqueado' as const, ganancia: null },
  { n: 50, nombre: 'Set de vasos térmicos (4 pzs)', fecha: 'Ayer, 19:58', estado: 'ok' as const, ganancia: '+$5.20' },
  { n: 49, nombre: 'Juguete de construcción magnética', fecha: 'Hace 2 días', estado: 'bloqueado' as const, ganancia: null },
  { n: 48, nombre: 'Organizador de cables de escritorio', fecha: 'Hace 3 días', estado: 'ok' as const, ganancia: '+$3.95' },
];

export default function Historial() {
  return (
    <div className="mx-auto w-full max-w-[480px] px-5 pb-8 pt-6">
      <h1 className="text-[22px] font-bold [font-family:var(--font-body)]">Historial</h1>
      <p className="mt-1 text-[13.5px] text-[var(--text-secondary)]">Tu bitácora completa de búsqueda.</p>

      <div className="mt-5 flex flex-col">
        {ENTRADAS.map((e, i) => (
          <div
            key={e.n}
            className={`flex items-center gap-3 py-3.5 ${i < ENTRADAS.length - 1 ? 'border-b border-[color-mix(in_oklab,var(--text-tertiary)_15%,transparent)]' : ''}`}
          >
            <span
              className="flex size-9 shrink-0 items-center justify-center rounded-full"
              style={{ background: e.estado === 'ok' ? 'var(--success-bg)' : 'var(--danger-bg)' }}
            >
              {e.estado === 'ok' ? (
                <Check size={15} strokeWidth={3} color="var(--success)" />
              ) : (
                <X size={15} strokeWidth={3} color="var(--danger)" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium leading-snug">{e.nombre}</p>
              <p className="text-[11px] text-[var(--text-tertiary)]">
                Entrada N.º {e.n} · {e.fecha}
              </p>
            </div>
            <span
              className="shrink-0 text-[13.5px] font-bold tabular-nums"
              style={{ color: e.estado === 'ok' ? 'var(--success)' : 'var(--danger)' }}
            >
              {e.ganancia ?? 'Bloqueado'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
