// CUENTA — protagonista: el estado de la suscripción y la conexión de la
// extensión (lo que el usuario necesita saber sobre "su cuenta", no otra vez
// el producto). La conexión real de la extensión y el auto-cobro llegan en la
// Sesión 6 — hoy la pantalla existe completa, con el estado "no conectada".

'use client';

import { useEffect, useState } from 'react';
import { CreditCard, Puzzle, LogOut, HelpCircle, ChevronRight, Sun, Moon, Check } from 'lucide-react';
import { useTema } from '../ThemeProvider';
import { createClient } from '@/lib/supabase/client';

// ID de la extensión — fijo mientras se prueba sin publicar en la Chrome Web Store. Al
// publicarla, Chrome le asigna un ID definitivo: actualizar esta constante esa única vez.
const EXTENSION_ID = 'hdnfhcmiblkfdkgajppafbpdcgbchedd';

type EstadoExtension = 'revisando' | 'no_instalada' | 'conectada' | 'error';

// Mensajes de diagnóstico en simple, visibles en pantalla — para no depender de que el usuario
// abra las herramientas de desarrollador (regla del SO: nunca trasladar una tarea técnica a un
// usuario no técnico). Quitar esta línea de detalle cuando la conexión quede confirmada.
const DETALLE_DEBUG: Record<string, string> = {
  sin_runtime: 'Tu Chrome no detecta la extensión en esta página — revisa que esté instalada y con el permiso de este sitio activado.',
  sin_sesion_web: 'No se encontró tu sesión en la app — vuelve a iniciar sesión e intenta de nuevo.',
  sin_respuesta: 'La extensión no respondió — puede que necesite recargarse en chrome://extensions.',
  excepcion: 'Ocurrió un error inesperado al intentar conectar.',
};

declare global {
  interface Window {
    chrome?: {
      runtime?: {
        sendMessage: (
          extensionId: string,
          message: unknown,
          callback: (response?: { ok?: boolean }) => void
        ) => void;
        lastError?: { message?: string };
      };
    };
  }
}

export default function Cuenta() {
  const { tema, alternar } = useTema();
  const [estadoExtension, setEstadoExtension] = useState<EstadoExtension>('revisando');
  const [detalleDebug, setDetalleDebug] = useState<string | null>(null);

  useEffect(() => {
    setEstadoExtension('no_instalada'); // se confirma "conectada" recién cuando la extensión responde
  }, []);

  const conectarExtension = async (): Promise<void> => {
    setDetalleDebug(null);
    try {
      const runtime = window.chrome?.runtime;
      if (!runtime) {
        setEstadoExtension('error');
        setDetalleDebug(DETALLE_DEBUG.sin_runtime);
        return;
      }
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        setEstadoExtension('error');
        setDetalleDebug(DETALLE_DEBUG.sin_sesion_web);
        return;
      }

      runtime.sendMessage(
        EXTENSION_ID,
        { tipo: 'CONECTAR_SESION', accessToken: session.access_token, email: session.user.email },
        (respuesta) => {
          if (runtime.lastError) {
            setEstadoExtension('error');
            setDetalleDebug(`${DETALLE_DEBUG.sin_respuesta} (${runtime.lastError.message ?? 'sin detalle'})`);
            return;
          }
          if (!respuesta?.ok) {
            setEstadoExtension('error');
            setDetalleDebug(DETALLE_DEBUG.sin_respuesta);
            return;
          }
          setEstadoExtension('conectada');
        }
      );
    } catch (e) {
      setEstadoExtension('error');
      setDetalleDebug(`${DETALLE_DEBUG.excepcion} (${e instanceof Error ? e.message : String(e)})`);
    }
  };
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
            style={{
              background:
                estadoExtension === 'conectada' ? 'var(--success-bg)' : 'color-mix(in oklab, var(--text-tertiary) 16%, transparent)',
            }}
          >
            {estadoExtension === 'conectada' ? (
              <Check size={18} color="var(--success)" strokeWidth={3} />
            ) : (
              <Puzzle size={18} color="var(--text-secondary)" />
            )}
          </span>
          <div className="flex-1">
            <p className="text-[14.5px] font-semibold">Extensión del navegador</p>
            <p className="text-[12.5px] text-[var(--text-tertiary)]">
              {estadoExtension === 'conectada'
                ? 'Conectada — leyendo tu cuenta de Amazon'
                : estadoExtension === 'error'
                  ? 'No se pudo conectar — intenta de nuevo'
                  : 'No conectada — sin ella, el Sello usa solo datos de mercado'}
            </p>
          </div>
        </div>
        {estadoExtension !== 'conectada' && (
          <button
            type="button"
            onClick={conectarExtension}
            className="mt-4 flex h-11 w-full items-center justify-center rounded-[var(--radius-button)] text-[13.5px] font-semibold [touch-action:manipulation]"
            style={{ background: 'var(--accent)', color: 'var(--bg)' }}
          >
            Instalar y conectar
          </button>
        )}
        {detalleDebug && (
          <p className="mt-3 rounded-[10px] p-3 text-[12px] leading-snug" style={{ background: 'var(--chip-bg)' }}>
            {detalleDebug}
          </p>
        )}
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
