'use client';

// LOGIN — Leval Ungate (50-DISENO-ONBOARDING-PAYWALL.md, bloque E)
// Sin contraseñas: método primario magic link + código de 6 dígitos en el MISMO correo
// (decisión Hotmart-first de 26-AUTH-MODERNO.md — el webhook de Hotmart crea usuarios
// passwordless; el comprador entra con el correo con el que compró). shouldCreateUser:false
// — esta pantalla NUNCA crea cuentas nuevas, solo entra a una ya creada por el pago.
// Anti-enumeración: el mismo mensaje de éxito se muestra exista o no la cuenta.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Lock } from 'lucide-react';
import { LogoGrande } from '@/components/landing/Logo';
import { createClient } from '@/lib/supabase/client';

type Estado = 'idle' | 'enviando' | 'enviado' | 'error';

export default function Login() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [estado, setEstado] = useState<Estado>('idle');
  const [countdown, setCountdown] = useState(0);
  const [codigo, setCodigo] = useState('');
  const [errorCodigo, setErrorCodigo] = useState('');
  const [verificando, setVerificando] = useState(false);
  const [avisoEnlace, setAvisoEnlace] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'enlace_invalido') {
      setAvisoEnlace('Ese enlace ya venció o no es válido — pide uno nuevo abajo.');
    }
  }, []);

  const iniciarCountdown = (): void => {
    setCountdown(60);
    const iv = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(iv);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const enviar = async (): Promise<void> => {
    if (!email.includes('@')) {
      setEstado('error');
      return;
    }
    setEstado('enviando');
    setAvisoEnlace('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth/callback?siguiente=/app/buscar`,
      },
    });
    // Anti-enumeración: si el correo no tiene cuenta, Supabase también devuelve error —
    // mostramos el MISMO estado de éxito para no revelar si la cuenta existe. Solo un error
    // real (límite de intentos, red caída) se muestra distinto.
    if (error && error.code === 'over_email_send_rate_limit') {
      setEstado('error');
      return;
    }
    setEstado('enviado');
    iniciarCountdown();
  };

  const confirmarCodigo = async (): Promise<void> => {
    if (codigo.trim().length < 6) {
      setErrorCodigo('El código tiene 6 dígitos.');
      return;
    }
    setVerificando(true);
    setErrorCodigo('');
    const { error } = await supabase.auth.verifyOtp({ email, token: codigo.trim(), type: 'email' });
    setVerificando(false);
    if (error) {
      setErrorCodigo('Código incorrecto o vencido — revisa el correo o pide uno nuevo.');
      return;
    }
    router.push('/app/buscar');
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-[var(--bg)] px-5 text-[var(--text-primary)] [font-family:var(--font-body)]">
      <div className="w-full max-w-[400px]">
        <a href="/" className="mb-8 flex items-center justify-center">
          <LogoGrande size={92} />
        </a>

        {estado !== 'enviado' ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <h1 className="text-center text-balance text-[26px] font-bold leading-[1.15] [font-family:var(--font-display)]">
              Entra a tu cuenta
            </h1>
            <p className="mt-2 text-center text-[14px] text-[var(--text-secondary)]">
              Para guardar tu historial y verlo en cualquier dispositivo.
            </p>

            {avisoEnlace && (
              <p className="mt-4 rounded-[12px] px-4 py-3 text-center text-[13px]" style={{ background: 'var(--chip-bg)' }}>
                {avisoEnlace}
              </p>
            )}

            <div className="mt-6">
              <input
                type="email"
                inputMode="email"
                autoFocus
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (estado === 'error') setEstado('idle');
                }}
                placeholder="tu@correo.com"
                className="h-14 w-full rounded-[var(--radius-button)] border px-4 text-[15px] outline-none"
                style={{
                  borderColor:
                    estado === 'error' ? 'var(--danger, #C1443B)' : 'color-mix(in oklab, var(--text-tertiary) 25%, transparent)',
                  background: 'var(--surface)',
                }}
              />
              {estado === 'error' && (
                <p className="mt-2 text-[13px] text-[#C1443B]">
                  No pudimos enviar el enlace. Espera un momento e intenta de nuevo.
                </p>
              )}
            </div>

            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={enviar}
              disabled={estado === 'enviando'}
              className="mt-4 flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--boton-bg)] text-[16px] font-semibold text-[var(--boton-texto)] shadow-[var(--boton-relieve)] disabled:opacity-60 [touch-action:manipulation]"
            >
              {estado === 'enviando' ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-[var(--bg)] border-t-transparent" />
                  Enviando…
                </span>
              ) : (
                'Enviarme mi enlace de acceso'
              )}
            </motion.button>

            <button
              type="button"
              className="mt-3 flex h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] border text-[15px] font-medium [touch-action:manipulation]"
              style={{ borderColor: 'color-mix(in oklab, var(--text-tertiary) 30%, transparent)' }}
            >
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62Z" />
                <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 0 0 9 18Z" />
                <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.03l2.97-2.33Z" />
                <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .98 4.97l2.97 2.33C4.66 5.17 6.65 3.58 9 3.58Z" />
              </svg>
              Continuar con Google
            </button>

            <p className="mt-4 flex items-center justify-center gap-1.5 text-[12.5px] text-[var(--text-tertiary)]">
              <Lock size={13} /> Sin contraseñas: te llegará un enlace de un solo uso
            </p>

            <p className="mt-6 text-center text-[12.5px] text-[var(--text-tertiary)]">
              ¿Ya pagaste y no te deja entrar?{' '}
              <a href="/comprar" className="font-medium text-[var(--accent)]">
                Escríbenos aquí
              </a>
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <h1 className="text-balance text-[24px] font-bold leading-[1.2] [font-family:var(--font-display)]">
              Revisa tu correo
            </h1>
            <p className="mt-2 text-[14.5px] text-[var(--text-secondary)]">
              Te enviamos un enlace a <span className="font-semibold text-[var(--text-primary)]">{email}</span> — o
              escribe aquí el código de 6 dígitos del mismo correo.
            </p>

            <div className="mt-6 text-left">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                autoFocus
                value={codigo}
                onChange={(e) => {
                  setCodigo(e.target.value.replace(/[^0-9]/g, ''));
                  if (errorCodigo) setErrorCodigo('');
                }}
                placeholder="000000"
                className="h-14 w-full rounded-[var(--radius-button)] border px-4 text-center text-[20px] tracking-[0.3em] tabular-nums outline-none"
                style={{
                  borderColor: errorCodigo ? 'var(--danger, #C1443B)' : 'color-mix(in oklab, var(--text-tertiary) 25%, transparent)',
                  background: 'var(--surface)',
                }}
              />
              {errorCodigo && <p className="mt-2 text-center text-[13px] text-[#C1443B]">{errorCodigo}</p>}
            </div>

            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={confirmarCodigo}
              disabled={verificando || codigo.length < 6}
              className="mt-4 flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--boton-bg)] text-[16px] font-semibold text-[var(--boton-texto)] shadow-[var(--boton-relieve)] disabled:opacity-60 [touch-action:manipulation]"
            >
              {verificando ? (
                <span className="flex items-center gap-2">
                  <span className="size-4 animate-spin rounded-full border-2 border-[var(--bg)] border-t-transparent" />
                  Verificando…
                </span>
              ) : (
                'Confirmar código'
              )}
            </motion.button>

            <button
              type="button"
              disabled={countdown > 0}
              onClick={enviar}
              className="mt-6 min-h-11 text-[14px] font-medium text-[var(--accent)] disabled:text-[var(--text-tertiary)] [touch-action:manipulation]"
            >
              {countdown > 0 ? `Reenviar en ${countdown}s` : 'Reenviar enlace y código'}
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
