// La extensión de navegador manda aquí lo que detectó en Seller Central. Se autentica con la
// MISMA sesión (cookies) que el usuario ya tiene abierta en la app — nunca pide contraseña
// aparte. CORS explícito porque la extensión llama desde el origen "chrome-extension://...".

export const runtime = 'nodejs';

import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Restringido a la extensión concreta — nunca '*': con credentials no se puede combinar con
// comodín, y no queremos que cualquier sitio web arbitrario pueda leer/escribir esta ruta.
const ORIGEN_EXTENSION = process.env.EXTENSION_ORIGIN ?? '';

function conCors(response: NextResponse): NextResponse {
  if (ORIGEN_EXTENSION) {
    response.headers.set('Access-Control-Allow-Origin', ORIGEN_EXTENSION);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  }
  return response;
}

export async function OPTIONS() {
  return conCors(new NextResponse(null, { status: 204 }));
}

interface RestriccionDetectada {
  tipo: 'categoria' | 'marca';
  nombre: string;
  bloqueado: boolean;
}

function esRestriccionValida(x: unknown): x is RestriccionDetectada {
  if (!x || typeof x !== 'object') return false;
  const r = x as Record<string, unknown>;
  return (
    (r.tipo === 'categoria' || r.tipo === 'marca') &&
    typeof r.nombre === 'string' &&
    r.nombre.length > 0 &&
    typeof r.bloqueado === 'boolean'
  );
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return conCors(NextResponse.json({ error: 'sin sesión' }, { status: 401 }));
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return conCors(NextResponse.json({ error: 'cuerpo inválido' }, { status: 400 }));
  }

  const restricciones = (body as { restricciones?: unknown[] })?.restricciones;
  if (!Array.isArray(restricciones) || restricciones.length === 0) {
    return conCors(NextResponse.json({ error: 'sin restricciones para guardar' }, { status: 400 }));
  }
  const validas = restricciones.filter(esRestriccionValida);
  if (validas.length === 0) {
    return conCors(NextResponse.json({ error: 'ninguna restricción con formato válido' }, { status: 400 }));
  }

  // upsert por (profile_id, tipo, nombre) — RLS ya garantiza que solo escribe SU propia fila.
  const filas = validas.map((r) => ({
    profile_id: user.id,
    tipo: r.tipo,
    nombre: r.nombre,
    bloqueado: r.bloqueado,
    actualizado_en: new Date().toISOString(),
  }));

  const { error } = await supabase.from('restricciones_cuenta').upsert(filas, { onConflict: 'profile_id,tipo,nombre' });
  if (error) {
    return conCors(NextResponse.json({ error: 'no se pudo guardar' }, { status: 500 }));
  }

  return conCors(NextResponse.json({ ok: true, guardadas: filas.length }));
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return conCors(NextResponse.json({ error: 'sin sesión' }, { status: 401 }));
  }

  const { data, error } = await supabase
    .from('restricciones_cuenta')
    .select('tipo, nombre, bloqueado, actualizado_en')
    .eq('profile_id', user.id)
    .order('actualizado_en', { ascending: false });

  if (error) {
    return conCors(NextResponse.json({ error: 'no se pudo leer' }, { status: 500 }));
  }

  return conCors(NextResponse.json({ ok: true, restricciones: data, email: user.email }));
}
