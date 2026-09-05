'use client';

// ONBOARDING — Leval Ungate (50-DISENO-ONBOARDING-PAYWALL.md, bloques A y B)
// v2: 3 preguntas de personalización REAL (cada una cambia algo del producto,
// no solo el tono) + pantalla de reconocimiento + producto a revisar + loading +
// resultado-demo con 2 ejemplos extra. Categoría intermedia entre "utilidad" y
// "personalizado" (02B) — se justifica porque las 3 preguntas SÍ cambian el
// filtro real de la app (marcas a evitar, extensión vs móvil, ganancia mínima).
//
// El resultado sigue siendo un DEMO honesto (mockups honestos, 19/50): usa el
// producto real que el usuario escribió, pero se etiqueta como ejemplo — la
// cuenta de Amazon todavía no está conectada (eso llega tras el pago + instalar
// la extensión, Sesión 6). NUNCA se presenta como una verificación real ya
// hecha contra su cuenta — eso sería inventar un resultado (ética del SO).

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ChevronLeft,
  Check,
  Sprout,
  TrendingUp,
  Trophy,
  Search,
  Laptop,
  Store,
  Shuffle,
  Coins,
  Banknote,
  Gem,
} from 'lucide-react';
import { Accent } from '@/components/landing/ui';
import { LogoMark } from '@/components/landing/Logo';

function BarraMarca() {
  return (
    <a href="/" className="flex h-14 items-center gap-2 text-[14px] font-semibold text-[var(--text-primary)]">
      <LogoMark size={26} />
      Leval Ungate
    </a>
  );
}

function BotonPrimario({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      whileTap={disabled ? undefined : { scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      className="flex h-[52px] w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--boton-bg)] px-8 text-[16px] font-semibold text-[var(--boton-texto)] shadow-[var(--boton-relieve)] transition-opacity duration-150 disabled:opacity-40 [touch-action:manipulation]"
    >
      {children}
    </motion.button>
  );
}

type Paso = 'bienvenida' | 'p1' | 'p2' | 'p3' | 'reconocimiento' | 'p4' | 'loading' | 'resultado';
type IconType = typeof Sprout;

const CUENTA_EDAD = [
  { id: 'nueva', label: 'Menos de 3 meses', eco: 'menos de 3 meses', icon: Sprout },
  { id: 'media', label: '3 a 12 meses', eco: '3 a 12 meses', icon: TrendingUp },
  { id: 'establecida', label: 'Más de 1 año', eco: 'más de 1 año', icon: Trophy },
] as const;

const ABASTECIMIENTO = [
  { id: 'online', label: 'Online (compro desde mi computadora)', eco: 'online', icon: Laptop },
  { id: 'fisico', label: 'Físico (recorro tiendas con mi celular)', eco: 'en tienda física', icon: Store },
  { id: 'ambos', label: 'Ambos', eco: 'de ambas formas', icon: Shuffle },
] as const;

const GANANCIA_META = [
  { id: 'baja', label: '$3 a $5 por producto', eco: '$3 a $5', icon: Coins, ejemploPrincipal: '+$4.20' },
  { id: 'media', label: '$5 a $10 por producto', eco: '$5 a $10', icon: Banknote, ejemploPrincipal: '+$8.40' },
  { id: 'alta', label: 'Más de $10 por producto', eco: 'más de $10', icon: Gem, ejemploPrincipal: '+$15.60' },
] as const;

const EJEMPLOS_EXTRA: Record<string, { nombre: string; ganancia: string }[]> = {
  baja: [
    { nombre: 'Set de brochas de maquillaje', ganancia: '+$3.80' },
    { nombre: 'Organizador de escritorio de bambú', ganancia: '+$4.60' },
  ],
  media: [
    { nombre: 'Auriculares Bluetooth deportivos', ganancia: '+$6.90' },
    { nombre: 'Lámpara LED de escritorio', ganancia: '+$9.10' },
  ],
  alta: [
    { nombre: 'Silla ergonómica plegable', ganancia: '+$14.50' },
    { nombre: 'Set de herramientas eléctricas', ganancia: '+$18.20' },
  ],
};

const SUGERENCIAS = ['Cargador inalámbrico 15W', 'Organizador de escritorio de bambú', 'Funda para laptop 14"'];

const PROGRESO: Record<Paso, number> = {
  bienvenida: 0,
  p1: 6,
  p2: 22,
  p3: 38,
  reconocimiento: 54,
  p4: 68,
  loading: 84,
  resultado: 100,
};

function BarraProgreso({ paso, onAtras }: { paso: Paso; onAtras?: () => void }) {
  return (
    <div className="flex items-center gap-3 pb-6 pt-2">
      {onAtras ? (
        <button
          type="button"
          onClick={onAtras}
          aria-label="Atrás"
          className="flex size-11 shrink-0 items-center justify-center [touch-action:manipulation]"
        >
          <ChevronLeft size={22} color="var(--text-secondary)" />
        </button>
      ) : (
        <div className="size-11 shrink-0" aria-hidden="true" />
      )}
      <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--text-tertiary)_15%,transparent)]">
        <motion.div
          className="h-full rounded-full bg-[var(--accent)]"
          initial={false}
          animate={{ width: `${PROGRESO[paso]}%` }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <span className="w-9 shrink-0 text-right text-[11px] font-semibold tabular-nums text-[var(--text-tertiary)]">
        {PROGRESO[paso]}%
      </span>
    </div>
  );
}

function Chip({
  label,
  Icon,
  seleccionado,
  onClick,
}: {
  label: string;
  Icon: IconType;
  seleccionado: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`flex h-16 w-full items-center gap-3 rounded-[var(--radius-button)] border px-4 text-left transition-colors duration-150 [touch-action:manipulation] ${
        seleccionado
          ? 'border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_10%,transparent)]'
          : 'border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--surface)]'
      }`}
      style={seleccionado ? { borderWidth: '1.5px' } : undefined}
    >
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-[calc(var(--radius-button)-4px)]"
        style={{ background: 'var(--chip-bg)' }}
      >
        <Icon size={18} color="var(--accent)" />
      </span>
      <span className="flex-1 text-[15px] font-medium text-[var(--text-primary)]">{label}</span>
      {seleccionado && (
        <motion.span
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.2, type: 'spring', bounce: 0.35 }}
          className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]"
        >
          <Check size={12} strokeWidth={3} color="var(--bg)" />
        </motion.span>
      )}
    </motion.button>
  );
}

function LineaEstado({ estado, texto }: { estado: 'hecha' | 'activa' | 'pendiente'; texto: string }) {
  return (
    <div className={`flex items-start gap-3 ${estado === 'pendiente' ? 'opacity-40' : 'opacity-100'}`}>
      {estado === 'hecha' ? (
        <motion.span
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.4, duration: 0.3 }}
          className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]"
        >
          <Check size={12} strokeWidth={3} color="var(--bg)" />
        </motion.span>
      ) : estado === 'activa' ? (
        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center">
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="size-2.5 rounded-full bg-[var(--accent)]"
          />
        </span>
      ) : (
        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-[var(--text-tertiary)]" />
      )}
      <span className="text-[15px] leading-snug text-[var(--text-primary)]">{texto}</span>
    </div>
  );
}

export default function Onboarding() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [paso, setPaso] = useState<Paso>('bienvenida');
  const [cuenta, setCuenta] = useState<(typeof CUENTA_EDAD)[number] | null>(null);
  const [abastecimiento, setAbastecimiento] = useState<(typeof ABASTECIMIENTO)[number] | null>(null);
  const [ganancia, setGanancia] = useState<(typeof GANANCIA_META)[number] | null>(null);
  const [producto, setProducto] = useState('');
  const [lineaActiva, setLineaActiva] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    if (paso !== 'loading') return;
    setLineaActiva(0);
    const delays = reduce ? [50, 100, 150, 200] : [200, 900, 1700, 2500];
    delays.forEach((ms, i) => {
      timers.current.push(setTimeout(() => setLineaActiva(i + 1), ms));
    });
    timers.current.push(setTimeout(() => setPaso('resultado'), reduce ? 300 : 4200));
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [paso, reduce]);

  const elegirCuenta = (s: (typeof CUENTA_EDAD)[number]): void => {
    setCuenta(s);
    setTimeout(() => setPaso('p2'), 320);
  };
  const elegirAbastecimiento = (s: (typeof ABASTECIMIENTO)[number]): void => {
    setAbastecimiento(s);
    setTimeout(() => setPaso('p3'), 320);
  };
  const elegirGanancia = (s: (typeof GANANCIA_META)[number]): void => {
    setGanancia(s);
    setTimeout(() => setPaso('reconocimiento'), 320);
  };

  const irADemo = (): void => {
    if (!producto.trim()) return;
    setPaso('loading');
  };

  const irAlPaywall = (): void => {
    const params = new URLSearchParams({
      producto: producto.trim(),
      cuenta: cuenta?.id ?? 'nueva',
      abastecimiento: abastecimiento?.id ?? 'online',
      ganancia: ganancia?.id ?? 'media',
    });
    router.push(`/paywall?${params.toString()}`);
  };

  const dirVariants = {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -24 },
  };

  const tier = ganancia?.id ?? 'media';
  const ejemplosExtra = EJEMPLOS_EXTRA[tier];
  const gananciaPrincipal = GANANCIA_META.find((g) => g.id === tier)?.ejemploPrincipal ?? '+$8.40';

  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--text-primary)] [font-family:var(--font-body)]">
      <div className="mx-auto w-full max-w-[480px] px-5 pb-16">
        <BarraMarca />

        {paso !== 'bienvenida' && (
          <BarraProgreso
            paso={paso}
            onAtras={
              paso === 'p2'
                ? () => setPaso('p1')
                : paso === 'p3'
                  ? () => setPaso('p2')
                  : paso === 'p4'
                    ? () => setPaso('reconocimiento')
                    : undefined
            }
          />
        )}

        <AnimatePresence mode="wait">
          {paso === 'bienvenida' && (
            <motion.div
              key="bienvenida"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center pt-10 text-center"
            >
              <motion.div
                animate={reduce ? undefined : { y: [0, -10, 0] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                className="mb-2"
              >
                <Image src="/mascota.png" alt="" width={220} height={220} priority className="h-auto w-[220px]" />
              </motion.div>
              <h1 className="text-balance text-[26px] font-bold leading-[1.15] [font-family:var(--font-display)]">
                ¡Hola! Vamos a armar tu <Accent>Sello de Cuenta</Accent>
              </h1>
              <p className="mt-2 max-w-[320px] text-[14px] leading-relaxed text-[var(--text-secondary)]">
                Te toma menos de un minuto — y vas a ver un ejemplo real de cuánto podrías ganar.
              </p>
              <div className="mt-8 w-full">
                <BotonPrimario onClick={() => setPaso('p1')}>Comenzar</BotonPrimario>
              </div>
            </motion.div>
          )}

          {paso === 'p1' && (
            <motion.div key="p1" {...dirVariants} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
              <h1 className="text-balance text-[26px] font-bold leading-[1.15] tracking-[-0.01em] [font-family:var(--font-display)]">
                ¿Cuánto tiempo tiene tu cuenta de Amazon Seller Central?
              </h1>
              <p className="mt-2 text-[14px] text-[var(--text-secondary)]">
                Así evitamos mostrarte marcas que tu cuenta todavía no puede desbloquear.
              </p>
              <div className="mt-8 flex flex-col gap-3">
                {CUENTA_EDAD.map((s) => (
                  <Chip key={s.id} label={s.label} Icon={s.icon} seleccionado={cuenta?.id === s.id} onClick={() => elegirCuenta(s)} />
                ))}
              </div>
            </motion.div>
          )}

          {paso === 'p2' && (
            <motion.div key="p2" {...dirVariants} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
              <h1 className="text-balance text-[26px] font-bold leading-[1.15] tracking-[-0.01em] [font-family:var(--font-display)]">
                ¿Cómo buscas tus productos?
              </h1>
              <p className="mt-2 text-[14px] text-[var(--text-secondary)]">
                Así te mostramos la herramienta que más te conviene.
              </p>
              <div className="mt-8 flex flex-col gap-3">
                {ABASTECIMIENTO.map((s) => (
                  <Chip
                    key={s.id}
                    label={s.label}
                    Icon={s.icon}
                    seleccionado={abastecimiento?.id === s.id}
                    onClick={() => elegirAbastecimiento(s)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {paso === 'p3' && (
            <motion.div key="p3" {...dirVariants} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
              <h1 className="text-balance text-[26px] font-bold leading-[1.15] tracking-[-0.01em] [font-family:var(--font-display)]">
                ¿Cuál es tu ganancia mínima por producto?
              </h1>
              <p className="mt-2 text-[14px] text-[var(--text-secondary)]">
                Nunca te vamos a mostrar algo que no llegue a esto.
              </p>
              <div className="mt-8 flex flex-col gap-3">
                {GANANCIA_META.map((s) => (
                  <Chip
                    key={s.id}
                    label={s.label}
                    Icon={s.icon}
                    seleccionado={ganancia?.id === s.id}
                    onClick={() => elegirGanancia(s)}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {paso === 'reconocimiento' && cuenta && abastecimiento && ganancia && (
            <motion.div key="reconocimiento" {...dirVariants} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
              <h1 className="text-balance text-[26px] font-bold leading-[1.15] [font-family:var(--font-display)]">
                Leval Ungate ya se ajustó a ti
              </h1>
              <div className="mt-7 space-y-4">
                <LineaEstado estado="hecha" texto={`Cuenta de ${cuenta.eco} → evitamos marcas que seguro rebotan`} />
                <LineaEstado estado="hecha" texto={`Compras ${abastecimiento.eco} → te guiamos con la herramienta correcta`} />
                {/* eco ya no lleva el verbo repetido: "online" / "en tienda física" / "de ambas formas" */}
                <LineaEstado estado="hecha" texto={`Ganancia mínima: ${ganancia.eco} por producto → tu feed nunca baja de eso`} />
              </div>
              <div className="mt-8">
                <BotonPrimario onClick={() => setPaso('p4')}>Ver un ejemplo real</BotonPrimario>
              </div>
            </motion.div>
          )}

          {paso === 'p4' && (
            <motion.div key="p4" {...dirVariants} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
              <h1 className="text-balance text-[26px] font-bold leading-[1.15] tracking-[-0.01em] [font-family:var(--font-display)]">
                ¿Qué producto quieres revisar primero?
              </h1>
              <p className="mt-2 text-[14px] text-[var(--text-secondary)]">
                Escribe el nombre, o pega el link/ASIN de Amazon.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {SUGERENCIAS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setProducto(s)}
                    className="rounded-full border border-[color-mix(in_oklab,var(--accent)_30%,transparent)] bg-[var(--chip-bg)] px-3 py-1.5 text-[13px] font-medium text-[var(--accent)] [touch-action:manipulation]"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[12px] text-[var(--text-tertiary)]">
                Elige una sugerencia para completar el campo, o escribe la tuya.
              </p>

              <div className="mt-4 flex items-center gap-3 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] bg-[var(--surface)] px-4">
                <Search size={18} color="var(--text-tertiary)" className="shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={producto}
                  onChange={(e) => setProducto(e.target.value)}
                  placeholder="Ej. Cargador inalámbrico 15W"
                  className="h-14 w-full bg-transparent text-[15px] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-tertiary)]"
                />
              </div>

              <div className="mt-6">
                <BotonPrimario onClick={irADemo} disabled={!producto.trim()}>
                  Ver mi Sello de Cuenta
                </BotonPrimario>
              </div>
            </motion.div>
          )}

          {paso === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center pt-6"
              aria-live="polite"
              aria-busy="true"
            >
              <div className="relative mb-8 flex size-28 items-center justify-center">
                <svg viewBox="0 0 100 100" className="size-28 -rotate-90">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="var(--surface-2)" strokeWidth="9" />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 42}
                    initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - lineaActiva / 4) }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                  />
                </svg>
                <span className="absolute text-[22px] font-bold tabular-nums [font-family:var(--font-display)]">
                  {Math.round((lineaActiva / 4) * 100)}%
                </span>
              </div>
              <h1 className="mb-6 text-[22px] font-bold [font-family:var(--font-display)]">
                Armando tu Sello de Cuenta…
              </h1>
              <div className="w-full max-w-[320px] space-y-4">
                <LineaEstado
                  estado={lineaActiva > 0 ? 'hecha' : 'activa'}
                  texto={`Filtrando marcas para cuenta de ${cuenta?.eco ?? ''}`}
                />
                <LineaEstado
                  estado={lineaActiva > 1 ? 'hecha' : lineaActiva === 1 ? 'activa' : 'pendiente'}
                  texto={`Buscando: “${producto}”`}
                />
                <LineaEstado
                  estado={lineaActiva > 2 ? 'hecha' : lineaActiva === 2 ? 'activa' : 'pendiente'}
                  texto="Cruzando con datos del mercado"
                />
                <LineaEstado
                  estado={lineaActiva > 3 ? 'hecha' : lineaActiva === 3 ? 'activa' : 'pendiente'}
                  texto={`Aplicando tu mínimo de ${ganancia?.eco ?? '$5 a $10'} sin gastos ocultos`}
                />
              </div>
            </motion.div>
          )}

          {paso === 'resultado' && (
            <motion.div
              key="resultado"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="pt-2"
            >
              <span className="mb-3 inline-block rounded-full bg-[var(--surface-2)] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
                Ejemplo — así funciona
              </span>
              <h1 className="text-balance text-[24px] font-bold leading-[1.15] [font-family:var(--font-display)]">
                Así se ve tu <Accent>Sello de Cuenta</Accent>
              </h1>
              <p className="mt-2 text-[14px] leading-relaxed text-[var(--text-secondary)]">
                Ejemplo con datos reales del mercado para “{producto}”. Cuando conectes tu cuenta, el
                semáforo se ajusta a lo que TÚ puedes vender.
              </p>

              <div className="mt-5 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_15%,transparent)] bg-[var(--surface)] p-5 shadow-[var(--shadow-2)]">
                <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_oklab,var(--accent)_14%,transparent)] px-3 py-1.5 text-[12px] font-bold text-[var(--accent)]">
                  <Check size={13} strokeWidth={3} /> AUTORIZADO (ejemplo)
                </span>
                <div className="text-[34px] font-bold leading-none tabular-nums [font-family:var(--font-display)]">
                  {gananciaPrincipal}
                </div>
                <p className="mt-1.5 text-[13px] text-[var(--text-secondary)]">
                  ganancia neta por unidad, tarifas de Amazon ya descontadas
                </p>
              </div>

              <p className="mb-2 mt-5 text-[12px] font-semibold uppercase tracking-[0.06em] text-[var(--text-tertiary)]">
                Así se vería tu feed diario (ejemplos)
              </p>
              <div className="flex flex-col gap-2">
                {ejemplosExtra.map((e) => (
                  <div
                    key={e.nombre}
                    className="flex items-center justify-between rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_15%,transparent)] bg-[var(--surface)] px-4 py-3"
                  >
                    <span className="text-[13.5px] font-medium">{e.nombre}</span>
                    <span className="text-[14px] font-bold tabular-nums text-[var(--accent)]">{e.ganancia}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <BotonPrimario onClick={irAlPaywall}>Desbloquear mi cuenta</BotonPrimario>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
