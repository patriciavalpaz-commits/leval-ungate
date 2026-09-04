'use client';

// BUSCAR — protagonista de la app: escanear un producto y ver el Sello de Cuenta.
// Datos semilla realistas (32 — "la app nunca se enseña vacía"): se muestra un
// resultado ya armado, como si el usuario acabara de escanear. La conexión real
// con Keepa + la extensión llega en la Sesión 6; hoy corre con datos de ejemplo
// que se sienten el producto real, no una demo aparte (distinto del onboarding,
// que sí se etiqueta "ejemplo" porque ahí el usuario aún no pagó ni tiene cuenta).

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Search, Check, AlertTriangle, Plus, ScanLine, Sun, Moon, Sparkles } from 'lucide-react';
import { useTema } from '../ThemeProvider';

// Datos ya calculados de este resultado (semilla hoy; vendrán de Keepa+extensión en la Sesión 6).
// La IA solo los traduce a una frase — nunca los genera ni los recalcula (30-INTEGRACION-IA.md).
const RESULTADO = {
  producto: 'Cargador Inalámbrico 15W — Anker',
  autorizado: true,
  ganancia: '+$8.40',
  roi: '34%',
  velocidad: 'Rápida',
  riesgo: 'Bajo',
  competidores: '6 vendedores',
};

function ExplicacionIA() {
  const [estado, setEstado] = useState<'cargando' | 'lista' | 'oculta'>('cargando');
  const [texto, setTexto] = useState('');

  useEffect(() => {
    let vivo = true;
    fetch('/api/explicar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(RESULTADO),
    })
      .then((r) => r.json())
      .then((data: { disponible: boolean; texto?: string }) => {
        if (!vivo) return;
        if (data.disponible && data.texto) {
          setTexto(data.texto);
          setEstado('lista');
        } else {
          setEstado('oculta'); // sin clave configurada o el proveedor falló: la app sigue sin la frase
        }
      })
      .catch(() => vivo && setEstado('oculta'));
    return () => {
      vivo = false;
    };
  }, []);

  if (estado === 'oculta') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-3 flex items-start gap-3 rounded-[14px] px-4 py-3"
      style={{ background: 'var(--chip-bg)' }}
    >
      <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full" style={{ background: 'var(--surface)' }}>
        <Sparkles size={13} color="var(--accent)" />
      </span>
      {estado === 'cargando' ? (
        <div className="flex-1 space-y-1.5 pt-1">
          <div className="h-3 w-[85%] animate-pulse rounded-full" style={{ background: 'var(--surface-2)' }} />
          <div className="h-3 w-[55%] animate-pulse rounded-full" style={{ background: 'var(--surface-2)' }} />
        </div>
      ) : (
        <p className="text-[13px] leading-relaxed text-[var(--text-primary)]">{texto}</p>
      )}
    </motion.div>
  );
}

export default function Buscar() {
  const [query, setQuery] = useState('');
  const { tema, alternar } = useTema();

  return (
    <div className="mx-auto w-full max-w-[480px] px-5 pb-8 pt-6">
      <div className="flex items-start justify-between">
        <h1 className="text-[22px] font-bold [font-family:var(--font-body)]">Buscar</h1>
        <button
          type="button"
          onClick={alternar}
          aria-label={tema === 'noche' ? 'Cambiar a modo día (para escanear en tienda)' : 'Cambiar a modo noche'}
          className="flex size-10 shrink-0 items-center justify-center rounded-full [touch-action:manipulation]"
          style={{ background: 'var(--chip-bg)' }}
        >
          {tema === 'noche' ? <Sun size={17} color="var(--accent)" /> : <Moon size={17} color="var(--accent)" />}
        </button>
      </div>
      <p className="mt-1 text-[13.5px] text-[var(--text-secondary)]">
        Pega un link o ASIN de Amazon o de la tienda.
      </p>

      <div className="mt-4 flex items-center gap-3 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--surface)] px-4">
        <Search size={18} color="var(--text-tertiary)" className="shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ej. B08XQPLM2K o un link de Walmart"
          className="h-14 w-full bg-transparent text-[15px] outline-none placeholder:text-[var(--text-tertiary)]"
        />
        <button
          type="button"
          className="flex size-9 shrink-0 items-center justify-center rounded-[10px]"
          style={{ background: 'var(--chip-bg)' }}
          aria-label="Escanear"
        >
          <ScanLine size={16} color="var(--accent)" />
        </button>
      </div>

      {/* Resultado — dato semilla: "Entrada N.º 052" de la bitácora (dispositivo ownable) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative mt-6 overflow-hidden rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_15%,transparent)] bg-[var(--surface)] p-5 shadow-[var(--shadow-2)]"
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
            Entrada N.º 052
          </span>
          <span className="text-[11px] text-[var(--text-tertiary)]">hace 2 minutos</span>
        </div>
        <p className="text-[14px] font-semibold leading-snug">Cargador Inalámbrico 15W — Anker</p>
        <p className="text-[11.5px] text-[var(--text-tertiary)] tabular-nums">ASIN B08XQPLM2K</p>

        <div className="mt-4 rounded-[16px] p-4" style={{ background: 'var(--success-bg)' }}>
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11.5px] font-bold" style={{ background: 'var(--success)', color: 'var(--success-bg)' }}>
            <Check size={12} strokeWidth={3} /> AUTORIZADO PARA TU CUENTA
          </span>
          <div className="text-[32px] font-bold leading-none tabular-nums [font-family:var(--font-display)]" style={{ color: 'var(--success)' }}>+$8.40</div>
          <p className="mt-1 text-[12.5px] text-[var(--text-secondary)]">
            ganancia neta por unidad, tarifas de Amazon ya descontadas
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              ['ROI', '34%'],
              ['Buy Box', '$24.99'],
              ['Venta', 'Rápida'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[12px] bg-[var(--surface-2)] px-2 py-2 text-center">
                <div className="text-[9.5px] font-semibold uppercase tracking-[0.05em] text-[var(--text-tertiary)]">{label}</div>
                <div className="text-[13.5px] font-bold tabular-nums">{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3 rounded-[14px] bg-[var(--surface-2)] px-4 py-3">
          <AlertTriangle size={18} color="var(--accent)" className="shrink-0" />
          <div>
            <p className="text-[12.5px] font-semibold">Riesgo de desplome: Bajo</p>
            <p className="text-[11.5px] text-[var(--text-tertiary)]">6 vendedores compitiendo por el Buy Box</p>
          </div>
        </div>

        <ExplicacionIA />

        <button
          type="button"
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] text-[14.5px] font-semibold [touch-action:manipulation]"
          style={{ background: 'var(--accent)', color: 'var(--bg)' }}
        >
          <Plus size={16} strokeWidth={2.5} /> Agregar a mi lista
        </button>
      </motion.div>
    </div>
  );
}
