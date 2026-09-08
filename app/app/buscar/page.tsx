'use client';

// BUSCAR — protagonista de la app: escanear un producto y ver el Sello de Cuenta.
// Datos semilla realistas (32 — "la app nunca se enseña vacía"): se muestra un
// resultado ya armado, como si el usuario acabara de escanear. La conexión real
// con Keepa + la extensión llega en la Sesión 6; hoy corre con datos de ejemplo
// que se sienten el producto real, no una demo aparte (distinto del onboarding,
// que sí se etiqueta "ejemplo" porque ahí el usuario aún no pagó ni tiene cuenta).

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Search, Check, X, AlertTriangle, Plus, ScanLine, Sun, Moon, Sparkles, RefreshCw } from 'lucide-react';
import { useTema } from '../ThemeProvider';

// Datos ya calculados de este resultado (ganancia/ROI/riesgo: semilla hoy, vendrán de Keepa —
// pendiente, en pausa por el usuario). El SEMÁFORO (autorizado/bloqueado) SÍ es real: se cruza
// la categoría contra lo que la extensión detectó de verdad en Seller Central (ver useEffect
// más abajo) — ya no es un valor inventado. La IA solo traduce a frase — nunca calcula (30).
const RESULTADO = {
  producto: 'Cargador Inalámbrico 15W — Anker',
  categoria: 'Electrónicos y accesorios',
  ganancia: '+$8.40',
  roi: '34%',
  velocidad: 'Rápida',
  riesgo: 'Bajo',
  competidores: '6 vendedores',
};

interface Restriccion {
  tipo: 'categoria' | 'marca';
  nombre: string;
  bloqueado: boolean;
  actualizado_en: string;
}

function haceCuanto(fechaIso: string): string {
  const minutos = Math.round((Date.now() - new Date(fechaIso).getTime()) / 60000);
  if (minutos < 1) return 'hace un momento';
  if (minutos < 60) return `hace ${minutos} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;
  const dias = Math.round(horas / 24);
  return `hace ${dias} día${dias === 1 ? '' : 's'}`;
}

// Cruza la categoría del producto contra lo que la extensión detectó como bloqueado — texto
// simple, sin depender de IDs de categoría de Amazon (que solo llegan con Keepa conectado).
function verificarSemaforo(categoria: string, restricciones: Restriccion[]) {
  const coincidencia = restricciones.find(
    (r) => r.bloqueado && categoria.toLowerCase().includes(r.nombre.toLowerCase())
  );
  return { bloqueado: Boolean(coincidencia), nombreBloqueo: coincidencia?.nombre };
}

function ExplicacionIA({ autorizado }: { autorizado: boolean }) {
  const [estado, setEstado] = useState<'cargando' | 'lista' | 'oculta'>('cargando');
  const [texto, setTexto] = useState('');

  useEffect(() => {
    let vivo = true;
    // El semáforo (autorizado) es el dato REAL cruzado con la extensión — la IA solo lo
    // traduce a frase, nunca lo decide (30-INTEGRACION-IA.md).
    fetch('/api/explicar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        producto: RESULTADO.producto,
        autorizado,
        ganancia: RESULTADO.ganancia,
        roi: RESULTADO.roi,
        velocidad: RESULTADO.velocidad,
        riesgo: RESULTADO.riesgo,
        competidores: RESULTADO.competidores,
      }),
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
  }, [autorizado]);

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
  const [restricciones, setRestricciones] = useState<Restriccion[] | null>(null);

  useEffect(() => {
    let vivo = true;
    fetch('/api/extension/sync')
      .then((r) => (r.ok ? r.json() : { restricciones: [] }))
      .then((data: { restricciones?: Restriccion[] }) => {
        if (vivo) setRestricciones(data.restricciones ?? []);
      })
      .catch(() => vivo && setRestricciones([]));
    return () => {
      vivo = false;
    };
  }, []);

  // Mientras no sabemos qué detectó la extensión, no afirmamos nada — ver abajo (estado "cargando").
  const { bloqueado, nombreBloqueo } = restricciones ? verificarSemaforo(RESULTADO.categoria, restricciones) : { bloqueado: false, nombreBloqueo: undefined };
  const ultimaSincronizacion = restricciones && restricciones.length > 0
    ? restricciones.reduce((mas, r) => (r.actualizado_en > mas ? r.actualizado_en : mas), restricciones[0].actualizado_en)
    : null;

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
        <p className="text-[14px] font-semibold leading-snug">{RESULTADO.producto}</p>
        <p className="text-[11.5px] text-[var(--text-tertiary)] tabular-nums">
          ASIN B08XQPLM2K · {RESULTADO.categoria}
        </p>

        {restricciones === null ? (
          <div className="mt-4 space-y-2 rounded-[16px] p-4" style={{ background: 'var(--surface-2)' }}>
            <div className="h-5 w-[70%] animate-pulse rounded-full" style={{ background: 'var(--chip-bg)' }} />
            <div className="h-8 w-[40%] animate-pulse rounded-full" style={{ background: 'var(--chip-bg)' }} />
          </div>
        ) : bloqueado ? (
          <div className="mt-4 rounded-[16px] p-4" style={{ background: 'var(--danger-bg)' }}>
            <span
              className="mb-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11.5px] font-bold"
              style={{
                background: 'var(--danger)',
                color: 'var(--danger-bg)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 2px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.18)',
              }}
            >
              <X size={12} strokeWidth={3} /> BLOQUEADO PARA TU CUENTA
            </span>
            <p className="mt-1 text-[15px] font-semibold" style={{ color: 'var(--danger)' }}>
              Necesitas autorización de Amazon
            </p>
            <p className="mt-1 text-[12.5px] text-[var(--text-secondary)]">
              Tu cuenta necesita autorización para vender en la categoría{' '}
              <strong>{nombreBloqueo}</strong> — comprar este producto no te conviene todavía.
            </p>
          </div>
        ) : (
          <div className="mt-4 rounded-[16px] p-4" style={{ background: 'var(--success-bg)' }}>
            <span
              className="mb-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11.5px] font-bold"
              style={{
                background: 'var(--success)',
                color: 'var(--success-bg)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 2px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.18)',
              }}
            >
              <Check size={12} strokeWidth={3} /> AUTORIZADO PARA TU CUENTA
            </span>
            <div className="text-[32px] font-bold leading-none tabular-nums [font-family:var(--font-display)]" style={{ color: 'var(--success)' }}>{RESULTADO.ganancia}</div>
            <p className="mt-1 text-[12.5px] text-[var(--text-secondary)]">
              ganancia neta por unidad, tarifas de Amazon ya descontadas
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                ['ROI', RESULTADO.roi],
                ['Buy Box', '$24.99'],
                ['Venta', RESULTADO.velocidad],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[12px] bg-[var(--surface-2)] px-2 py-2 text-center">
                  <div className="text-[9.5px] font-semibold uppercase tracking-[0.05em] text-[var(--text-tertiary)]">{label}</div>
                  <div className="text-[13.5px] font-bold tabular-nums">{value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fecha real de la última lectura de tu cuenta de Amazon (extensión) — nunca en vivo */}
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-[var(--text-tertiary)]">
          <RefreshCw size={11} />
          {ultimaSincronizacion
            ? `Datos de tu cuenta: ${haceCuanto(ultimaSincronizacion)}`
            : 'Conecta la extensión en Cuenta para verificar tu cuenta real'}
        </div>

        <div className="mt-3 flex items-center gap-3 rounded-[14px] bg-[var(--surface-2)] px-4 py-3">
          <AlertTriangle size={18} color="var(--accent)" className="shrink-0" />
          <div>
            <p className="text-[12.5px] font-semibold">Riesgo de desplome: Bajo</p>
            <p className="text-[11.5px] text-[var(--text-tertiary)]">6 vendedores compitiendo por el Buy Box</p>
          </div>
        </div>

        {restricciones !== null && <ExplicacionIA autorizado={!bloqueado} />}

        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] text-[14.5px] font-semibold [touch-action:manipulation]"
          style={{ background: 'var(--boton-bg)', color: 'var(--boton-texto)', boxShadow: 'var(--boton-relieve)' }}
        >
          <Plus size={16} strokeWidth={2.5} /> Agregar a mi lista
        </motion.button>
      </motion.div>
    </div>
  );
}
