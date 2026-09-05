// La extensión de navegador manda aquí lo que detectó en Seller Central. Se autentica con un
// token que la propia app web le entrega a la extensión (chrome.runtime.sendMessage) cuando el
// usuario hace clic en "Instalar y conectar" — los navegadores NO comparten cookies entre una
// extensión y un sitio web, así que ese token va en el header Authorization, no en cookies.

export const runtime = 'nodejs';

import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

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

async function usuarioDesdeRequest(request: NextRequest) {
  // La extensión no comparte cookies con el navegador (los navegadores lo bloquean entre un
  // origen "chrome-extension://" y la web, por diseño) — manda su propio token en el header.
  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (bearer) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser(bearer);
    return user;
  }
  // Llamadas normales del navegador (con cookies) — usado por la propia app web.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function POST(request: NextRequest) {
  const user = await usuarioDesdeRequest(request);

  if (!user) {
    return conCors(NextResponse.json({ error: 'sin sesión' }, { status: 401 }));
  }

  // La identidad ya quedó verificada arriba (por cookie o por el token de la extensión) — de
  // aquí en más se usa el cliente admin, siempre acotado a ESE user.id, nunca a uno que venga
  // del cuerpo de la petición (evita que alguien escriba en la fila de otra persona).
  const admin = createAdminClient();

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

  const { error } = await admin.from('restricciones_cuenta').upsert(filas, { onConflict: 'profile_id,tipo,nombre' });
  if (error) {
    return conCors(NextResponse.json({ error: 'no se pudo guardar' }, { status: 500 }));
  }

  return conCors(NextResponse.json({ ok: true, guardadas: filas.length }));
}

export async function GET(request: NextRequest) {
  const user = await usuarioDesdeRequest(request);

  if (!user) {
    return conCors(NextResponse.json({ error: 'sin sesión' }, { status: 401 }));
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('restricciones_cuenta')
    .select('tipo, nombre, bloqueado, actualizado_en')
    .eq('profile_id', user.id)
    .order('actualizado_en', { ascending: false });

  if (error) {
    return conCors(NextResponse.json({ error: 'no se pudo leer' }, { status: 500 }));
  }

  return conCors(NextResponse.json({ ok: true, restricciones: data, email: user.email }));
}
