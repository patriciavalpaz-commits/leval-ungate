'use client';

// Página de ventas de Leval Ungate — 10 secciones canónicas (19-PAGINA-DE-VENTAS.md).
// Copy trazado a FICHA-AVATAR.md, marcado en docs/copy/landing.md. Modelo 1 (hard paywall):
// el CTA primario lleva a /comprar (placeholder hasta tener el link real de Hotmart, Sesión 6).

import Image from 'next/image';
import { Lock, Activity, PackageX, TrendingDown, Search, ShieldCheck, Rss, History } from 'lucide-react';
import { Hero } from '@/components/landing/Hero';
import { LogoMark } from '@/components/landing/Logo';
import { Problema } from '@/components/landing/Problema';
import { Agitacion } from '@/components/landing/Agitacion';
import { Solucion } from '@/components/landing/Solucion';
import { AppPorDentro } from '@/components/landing/AppPorDentro';
import { VideoDemo } from '@/components/landing/VideoDemo';
import { Oferta } from '@/components/landing/Oferta';
import { Garantia } from '@/components/landing/Garantia';
import { Faq } from '@/components/landing/Faq';
import { CtaFinal } from '@/components/landing/CtaFinal';
import { FooterLegal } from '@/components/landing/FooterLegal';
import { StickyCtaMobile } from '@/components/landing/ui';

// Modelo 1 (hard paywall, B2B — decidido en ESTADO.md): el CTA lleva directo al checkout.
const CTA_HREF = '/comprar';
const CTA_LABEL = 'Empezar mis 7 días gratis';

export default function LandingLevalUngate() {
  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--text-primary)] [font-family:var(--font-body)]">
      {/* 1. HERO */}
      <Hero
        appName="Leval Ungate"
        logo={<LogoMark size={30} />}
        loginHref="/login"
        h1Marked="Un escaneo te dice si [acento]tu cuenta puede vender esto[/acento]"
        subtitleMarked="El Sello de Cuenta calcula tu ganancia real [b]sin gastos ocultos[/b]."
        ctaLabel={CTA_LABEL}
        ctaHref={CTA_HREF}
        socialProof={<span>Garantía Hotmart de 7 días — sin preguntas</span>}
        visual={
          <Image
            src="/hero.webp"
            alt="Leval Ungate escaneando un producto: cuenta aprobada, ganancia neta y margen calculados al instante"
            width={1200}
            height={800}
            priority
            className="h-auto w-full"
          />
        }
      />

      {/* 2. PROBLEMA */}
      <Problema
        titulo="¿Te suena?"
        preguntas={[
          { icon: Lock, textoMarked: '¿Encuentras un producto bueno y Amazon dice que estás bloqueado?' },
          { icon: Activity, textoMarked: '¿Las gráficas de precios se sienten un electrocardiograma que no entiendes?' },
          { icon: PackageX, textoMarked: '¿Te da miedo comprar mercancía que después no puedas vender?' },
          { icon: TrendingDown, textoMarked: '¿Encuentras algo rentable y en días el precio se desploma?' },
        ]}
      />

      {/* 3. AGITACIÓN */}
      <Agitacion
        frases={[
          'Cada noche pierdes horas [b]buscando productos que después no puedes vender[/b].',
          'En un mes son [acento]60 horas[/acento] perdidas revisando bloqueos, no vendiendo.',
          'Otra suscripción de gráficos no arregla esto: [b]más datos no es más certeza[/b].',
        ]}
        contraste={{
          labelHoy: 'Hoy',
          hoy: '3 a 5 horas buscando productos, sin saber cuáles puedes vender.',
          labelFuturo: 'En 6 meses, si nada cambia',
          futuro: 'El mismo caos — con seis meses menos y la misma cuenta bloqueada.',
        }}
      />

      {/* 4. SOLUCIÓN */}
      <Solucion
        tituloMarked="Compra con [acento]luz verde[/acento], no con miedo"
        mecanismo="El Sello de Cuenta"
        bigIdeaMarked="No te faltan horas: te falta saber si tu cuenta puede vender. [b]El Sello de Cuenta lo confirma antes de que gastes un minuto más[/b]."
        pasos={[
          { titulo: 'Pegas el producto', detalle: 'Copias el link o el ASIN de Amazon o de la tienda.' },
          { titulo: 'El Sello decide', detalle: 'Cruza tu cuenta real con datos actualizados del mercado.' },
          { titulo: 'Ves tu ganancia', detalle: 'Verde y el monto neto, o rojo y ahorras la compra.' },
        ]}
        antesDespues={{
          labelAntes: 'Antes',
          antes: 'Compras a ciegas y descubres el bloqueo cuando ya es tarde.',
          labelDespues: 'Después',
          despues: 'Sabes antes de comprar si tu cuenta puede vender, y cuánto ganas.',
        }}
        imagen={
          <Image
            src="/mecanismo.webp"
            alt="El Sello de Cuenta: cuenta aprobada, sin restricciones, marca desbloqueada"
            width={1200}
            height={800}
            className="h-auto w-full"
          />
        }
      />

      {/* 5. LA APP POR DENTRO — placeholders honestos (app interna aún no construida) */}
      <AppPorDentro
        tituloMarked="Tu [acento]bitácora de caza[/acento] de productos"
        frames={[
          {
            label: 'El Sello de Cuenta, en vivo',
            media: (
              <VideoDemo
                src="/mecanismo-video.mp4"
                poster="/mecanismo-video-poster.jpg"
                posterAlt="Cuenta aprobada, margen y ganancia neta apareciendo sobre el producto"
              />
            ),
          },
          { label: 'Escaneas cualquier producto', nombrePantalla: 'Buscador', icon: Search },
          { label: 'El Sello de Cuenta decide', nombrePantalla: 'Resultado del escaneo', icon: ShieldCheck },
          { label: 'Tu feed de productos ya autorizados', nombrePantalla: 'Feed diario', icon: Rss },
          { label: 'Cada entrada de tu bitácora', nombrePantalla: 'Historial', icon: History },
        ]}
        ctaLabel={CTA_LABEL}
        ctaHref={CTA_HREF}
      />

      {/* 6. OFERTA */}
      <Oferta
        tituloMarked="Empieza gratis. Sigue por [acento]$0.55 al día[/acento]"
        trialDias={7}
        stack={{
          lineas: [
            { resultado: 'Leval Ungate Pro con el Sello de Cuenta (12 meses)', valor: '$300' },
            { resultado: 'Base de marcas/categorías seguras para cuentas nuevas', valor: '$150' },
            { resultado: 'Calculadora de tarifas FBA sin sorpresas', valor: '$47' },
          ],
          totalTachado: '$497',
          nota: 'Hoy: $16.58/mes (se cobra $199.00/año)',
        }}
        anual={{
          nombre: 'Anual',
          badge: 'MÁS POPULAR',
          precioMes: '$16.58',
          totalAnual: 'Se cobra $199.00/año',
          ahorro: '4 meses gratis (≈31%)',
          descomposicionDia: 'menos de $0.55 al día',
          ctaLabel: CTA_LABEL,
          ctaHref: CTA_HREF,
          features: [
            'Escaneos ilimitados con el Sello de Cuenta',
            'Calculadora de ganancia neta sin gastos ocultos',
            'Feed diario de productos ya autorizados para ti',
            'Historial completo de tu bitácora de búsqueda',
          ],
        }}
        mensual={{
          nombre: 'Mensual',
          precioMes: '$24.00',
          ctaLabel: 'Elegir mensual',
          ctaHref: CTA_HREF,
          features: [
            'Escaneos ilimitados con el Sello de Cuenta',
            'Calculadora de ganancia neta sin gastos ocultos',
            'Feed diario de productos ya autorizados para ti',
            'Cancelas cuando quieras',
          ],
        }}
      />

      {/* 7. GARANTÍA */}
      <Garantia
        nombre="La Garantía del Primer Sello Verde"
        condicionMarked="Si en tus primeros 7 días el Sello de Cuenta no te muestra [b]al menos un producto autorizado con ganancia real[/b], escribes un correo y te devolvemos todo."
        pisoLegal="Respaldada por la garantía Hotmart de 7 días"
      />

      {/* 8. FAQ */}
      <Faq
        items={[
          {
            pregunta: '¿Cómo sabe la app qué puede vender MI cuenta?',
            respuestaMarked:
              'El Sello de Cuenta usa tu propia sesión de Amazon, ya conectada en tu navegador — [b]nunca pedimos ni guardamos tu contraseña[/b].',
          },
          {
            pregunta: '¿Ya pago otra herramienta de análisis, para qué cambiar?',
            respuestaMarked:
              'Esas herramientas te muestran datos; [b]el Sello te dice si TU cuenta puede vender hoy[/b], sin buscar producto por producto.',
          },
          {
            pregunta: '¿Y si compro algo y el precio baja después?',
            respuestaMarked:
              'Cada resultado incluye el riesgo de desplome de precio, no solo la ganancia de hoy.',
          },
          {
            pregunta: 'Apenas estoy empezando, ¿vale la pena otra mensualidad?',
            respuestaMarked:
              'Una sola compra bloqueada te cuesta $300 en promedio; [b]la app se paga sola evitando un solo error[/b].',
          },
          {
            pregunta: '¿Cuánto tardo en ver un resultado?',
            respuestaMarked: 'Tu primer escaneo lo tienes apenas conectas tu cuenta, sin pasos extra.',
          },
        ]}
      />

      {/* 9. CTA FINAL */}
      <CtaFinal
        h2Marked="Deja de comprar [acento]a ciegas[/acento]"
        futurePacingMarked="Escaneas, ves el Sello en verde, y compras sabiendo [b]exactamente cuánto vas a ganar[/b] — antes de gastar un centavo."
        ctaLabel={CTA_LABEL}
        ctaHref={CTA_HREF}
        recap="Garantía del Primer Sello Verde · 7 días gratis"
        psMarked="PS: Leval Ungate te dice con un escaneo si tu cuenta puede vender un producto y cuánto ganarías, sin gastos ocultos, con el Sello de Cuenta. Hoy entras con 7 días gratis y la Garantía del Primer Sello Verde: si no ves un resultado real, te devolvemos todo."
      />

      {/* 10. FOOTER LEGAL */}
      <FooterLegal
        appName="Leval Ungate"
        logo={<LogoMark size={20} />}
        soporteEmail="soporte@levalungate.com"
        enlaces={[
          { label: 'Privacidad', href: '/privacidad' },
          { label: 'Términos y Condiciones', href: '/terminos' },
          { label: 'Reembolsos', href: '/reembolsos' },
          { label: 'Aviso de IA', href: '/aviso-ia' },
        ]}
      />

      <StickyCtaMobile labelComercial={CTA_LABEL} href={CTA_HREF} />
    </div>
  );
}
