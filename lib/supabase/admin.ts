// Cliente ADMIN de Supabase — usa la clave secreta "service_role", que se salta la seguridad
// de fila (RLS) a propósito. SOLO se importa desde código que corre en el servidor y que ya
// verificó su propia autorización (el webhook de Hotmart verifica el hottok antes de tocar
// esto). Prohibido importar este archivo desde cualquier componente 'use client'.

import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error('Faltan las variables de Supabase (URL o SUPABASE_SERVICE_ROLE_KEY) en el servidor.');
  }
  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
