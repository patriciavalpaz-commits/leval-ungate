// Cliente de Supabase para COMPONENTES DE NAVEGADOR ('use client'). Usa la clave "anon"
// (pública por diseño — la protección real es RLS, no el secreto de esta clave).

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
