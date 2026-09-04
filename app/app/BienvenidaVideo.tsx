'use client';

// Video de bienvenida: se muestra UNA sola vez, la primera vez que alguien entra a su cuenta
// real (nunca en el onboarding — ahí sigue la mascota fija). Se recuerda en profiles.welcomed_at,
// no en localStorage, para que no vuelva a aparecer aunque entre desde otro dispositivo.
// Autoplay MUTEADO por defecto (los navegadores bloquean autoplay con sonido sin un clic fresco
// justo antes) con botón para activar el sonido — nunca se fuerza al usuario a verlo completo.

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Volume2, VolumeX, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export function BienvenidaVideo() {
  const [visible, setVisible] = useState(false);
  const [conSonido, setConSonido] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    let vivo = true;
    const supabase = createClient();
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !vivo) return;
      const { data: perfil } = await supabase.from('profiles').select('welcomed_at').eq('id', user.id).maybeSingle();
      if (!vivo) return;
      if (perfil && !perfil.welcomed_at) {
        userIdRef.current = user.id;
        setVisible(true);
      }
    })();
    return () => {
      vivo = false;
    };
  }, []);

  const cerrar = async (): Promise<void> => {
    setVisible(false);
    if (!userIdRef.current) return;
    const supabase = createClient();
    await supabase.from('profiles').update({ welcomed_at: new Date().toISOString() }).eq('id', userIdRef.current);
  };

  const alternarSonido = (): void => {
    if (videoRef.current) videoRef.current.muted = conSonido;
    setConSonido((s) => !s);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-6"
        >
          <button
            type="button"
            onClick={cerrar}
            aria-label="Cerrar bienvenida"
            className="absolute right-5 top-[max(20px,env(safe-area-inset-top))] flex size-10 items-center justify-center rounded-full bg-white/10 text-white [touch-action:manipulation]"
          >
            <X size={18} />
          </button>

          <motion.div
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="relative w-full max-w-[340px] overflow-hidden rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
          >
            <video
              ref={videoRef}
              src="/video-bienvenida.mp4"
              autoPlay
              muted
              playsInline
              onEnded={cerrar}
              className="h-auto w-full"
            />
            <button
              type="button"
              onClick={alternarSonido}
              aria-label={conSonido ? 'Silenciar' : 'Activar sonido'}
              className="absolute bottom-3 right-3 flex size-9 items-center justify-center rounded-full bg-black/50 text-white [touch-action:manipulation]"
            >
              {conSonido ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </motion.div>

          <button
            type="button"
            onClick={cerrar}
            className="absolute bottom-[max(24px,env(safe-area-inset-bottom))] text-[13px] font-medium text-white/70 [touch-action:manipulation]"
          >
            Saltar
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
