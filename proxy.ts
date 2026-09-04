// Guardia de acceso: refresca la sesión en cada request y bloquea /app/* a quien no tiene
// sesión válida (26-AUTH-MODERNO — usar getUser(), NUNCA getSession(), para no confiar en un
// token que el cliente pudo alterar). Modelo 1 (hard paywall, ver ESTADO.md): todo lo público
// (landing, onboarding, paywall, login, comprar) es abierto; solo /app/* exige sesión.
// (Next.js 16 renombró "middleware" a "proxy" — misma API, este es el archivo vigente.)

import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  // Nunca getSession() en el servidor: no verifica la firma, un token manipulado la pasaría.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const esRutaProtegida = request.nextUrl.pathname.startsWith('/app');

  if (esRutaProtegida && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('siguiente', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|mp4)$).*)'],
};
