// API — Explicación con IA del resultado del Sello de Cuenta (30-INTEGRACION-IA.md)
//
// QUÉ HACE Y QUÉ NO: la IA NUNCA calcula ni inventa números — solo traduce a lenguaje humano
// los datos que YA calculamos nosotros (determinismo). Recibe los hechos, devuelve 1-2 frases.
// Si la IA fallara o no estuviera configurada, la app sigue funcionando perfecto sin ella: el
// semáforo y la ganancia son el producto real, la frase es un extra.
//
// SÍNCRONO (30 → "patrón decisor"): texto corto, el usuario lo espera ver ya, <15s. Modelo Haiku
// 4.5 (barato y rápido — es narración corta, no razonamiento complejo).
//
// CIRCUIT-BREAKER: la versión completa (tope diario/mensual leído de una tabla `ai_calls`) requiere
// base de datos — se implementa en la Sesión 6 cuando se conecte Supabase. HOY, la única red de
// seguridad es la Capa 0 del sistema: el tope de gasto que el dueño configura en su propia cuenta
// de Anthropic (console.anthropic.com → Settings → Limits) — eso protege aunque este código falle.
// Mientras tanto: max_tokens muy bajo (200) mantiene cada llamada barata (fracciones de centavo).

import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const runtime = 'nodejs';

interface ResultadoProducto {
  producto: string;
  autorizado: boolean;
  ganancia: string;
  roi: string;
  velocidad: string;
  riesgo: string;
  competidores: string;
}

function esResultadoProducto(v: unknown): v is ResultadoProducto {
  if (typeof v !== 'object' || v === null) return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.producto === 'string' &&
    typeof r.autorizado === 'boolean' &&
    typeof r.ganancia === 'string' &&
    typeof r.roi === 'string' &&
    typeof r.velocidad === 'string' &&
    typeof r.riesgo === 'string' &&
    typeof r.competidores === 'string'
  );
}

const SYSTEM_PROMPT = `Eres la voz de Leval Ungate, una app que ayuda a vendedores novatos de Amazon a decidir si comprar un producto para revenderlo. Tu único trabajo es traducir a lenguaje humano los datos que te dan — NUNCA inventes cifras, marcas, competidores ni datos que no estén en el bloque de datos.

Tono: experto sobrio con calidez — directo, sin relleno, sin emojis, sin exclamaciones. Español latino neutro (tuteo: "tú tienes", "puedes" — nunca voseo, nunca modismos de un solo país).

Reglas duras:
- Máximo 2 frases cortas.
- Si "autorizado" es falso, tu frase explica que NO conviene comprarlo con esta cuenta todavía — nunca animar a comprarlo igual.
- Si el riesgo es alto o hay muchos competidores, adviértelo con calma, sin alarmismo.
- Si todo se ve bien, dalo con confianza tranquila, no con euforia.
- Responde SOLO con las 1-2 frases, sin saludos ni prefacios ("Aquí tienes...", "Basado en los datos...").`;

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Honesto: sin clave configurada, no hay explicación con IA — la app sigue funcionando sin ella.
    return NextResponse.json({ disponible: false, motivo: 'sin_clave' }, { status: 200 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }
  if (!esResultadoProducto(body)) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  }
  const datos = body;

  const bloqueDatos = [
    `Producto: ${datos.producto}`,
    `Autorizado para vender con esta cuenta: ${datos.autorizado ? 'sí' : 'no'}`,
    `Ganancia neta por unidad: ${datos.ganancia}`,
    `ROI: ${datos.roi}`,
    `Velocidad de venta estimada: ${datos.velocidad}`,
    `Riesgo de desplome de precio: ${datos.riesgo}`,
    `Competidores en el Buy Box: ${datos.competidores}`,
  ].join('\n');

  try {
    const client = new Anthropic({ apiKey });
    const res = await client.messages.create({
      model: process.env.AI_MODEL || 'claude-haiku-4-5',
      max_tokens: 200,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Estos son los datos ya calculados de un escaneo (no los inventes, no los cambies, solo tradúcelos a una explicación breve):\n\n${bloqueDatos}`,
        },
      ],
    });

    const texto = res.content.find((b): b is Anthropic.TextBlock => b.type === 'text')?.text?.trim();
    if (!texto) {
      return NextResponse.json({ disponible: false, motivo: 'sin_respuesta' }, { status: 200 });
    }
    return NextResponse.json({ disponible: true, texto });
  } catch (err) {
    console.error('[api/explicar] error llamando a Anthropic:', err);
    // Degradar con gracia: la app sigue viva sin la frase de IA (30 → "resiliencia").
    return NextResponse.json({ disponible: false, motivo: 'error_proveedor' }, { status: 200 });
  }
}
