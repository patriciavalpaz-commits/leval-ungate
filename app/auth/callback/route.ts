// El enlace del correo de acceso apunta aquí. Intercambia el código de un solo uso por una
// sesión real (cookies httpOnly) y manda al usuario a la app.

import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const siguiente = searchParams.get('siguiente') ?? '/app/buscar';

  if (tokenHash && type === 'email') {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'email' });
    if (!error) {
      return NextResponse.redirect(`${origin}${siguiente}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=enlace_invalido`);
}
