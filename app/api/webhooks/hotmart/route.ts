// El aviso automático que Hotmart le manda a esta app cuando alguien paga, cancela o le
// devuelven el dinero. Crea/activa/cancela la cuenta del comprador (18-VENTA-HOTMART.md).
// 4 defensas en orden: autenticidad (hottok) → frescura (anti-replay) → idempotencia →
// autorización (la máquina de estados, dentro de la RPC atómica).

export const runtime = 'nodejs';

import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { hottokValido, eventoFresco } from '@/lib/hotmart/verify';
import { statusForEvent, otorgaAcceso } from '@/lib/hotmart/fsm';

interface PayloadHotmart {
  id?: string;
  creation_date?: number;
  event?: string;
  data?: {
    buyer?: { email?: string };
    purchase?: {
      transaction?: string;
      price?: { value?: number; currency_value?: string };
    };
    subscription?: { subscriber?: { code?: string } };
  };
}

async function registrarLog(
  admin: ReturnType<typeof createAdminClient>,
  campos: { event_type?: string; event_id?: string; status: string; detail?: string }
) {
  await admin.from('webhook_log').insert(campos);
}

export async function POST(request: NextRequest) {
  const admin = createAdminClient();
  const raw = await request.text();
  const hottokRecibido = request.headers.get('x-hotmart-hottok');

  // 1. Autenticidad — sin esto, cualquiera podría fingir un pago o una cancelación.
  if (!hottokValido(hottokRecibido)) {
    await registrarLog(admin, { status: 'invalid_signature' });
    return NextResponse.json({ error: 'firma inválida' }, { status: 401 });
  }

  let payload: PayloadHotmart;
  try {
    payload = JSON.parse(raw);
  } catch {
    await registrarLog(admin, { status: 'error', detail: 'cuerpo no es JSON válido' });
    return NextResponse.json({ error: 'cuerpo inválido' }, { status: 400 });
  }

  // 2. Frescura — un aviso viejo capturado y reenviado por un atacante se rechaza.
  if (!eventoFresco(payload.creation_date)) {
    await registrarLog(admin, { event_type: payload.event, status: 'stale', detail: 'fuera de la ventana de 5 min' });
    return NextResponse.json({ error: 'evento fuera de ventana' }, { status: 401 });
  }

  const eventType = payload.event ?? 'DESCONOCIDO';
  const email = payload.data?.buyer?.email ?? null;
  const subscriberCode = payload.data?.subscription?.subscriber?.code ?? null;
  const transaction = payload.data?.purchase?.transaction ?? null;
  const precio = payload.data?.purchase?.price?.value;
  const amountMinor = typeof precio === 'number' ? Math.round(precio * 100) : null;
  const currency = payload.data?.purchase?.price?.currency_value ?? null;
  const eventId = payload.id ?? `${eventType}:${transaction ?? 'sin_transaccion'}`;

  const nuevoStatus = statusForEvent(eventType, amountMinor);

  if (nuevoStatus === undefined) {
    // Evento real de Hotmart que no nos interesa (o uno nuevo que no mapeamos todavía) —
    // 200 para que Hotmart no reintente, pero queda en la bitácora para revisarlo.
    await registrarLog(admin, { event_type: eventType, status: 'unhandled_event' });
    return NextResponse.json({ ok: true, resultado: 'evento no manejado' });
  }

  // Resolver a qué perfil pertenece este evento — por código de suscriptor primero (más
  // estable), por correo después, y recién se crea una cuenta nueva si el evento SÍ da acceso.
  let profileId: string | null = null;
  if (subscriberCode) {
    const { data } = await admin.from('profiles').select('id').eq('hotmart_subscriber_code', subscriberCode).maybeSingle();
    profileId = data?.id ?? null;
  }
  if (!profileId && email) {
    const { data } = await admin.from('profiles').select('id').eq('email', email).maybeSingle();
    profileId = data?.id ?? null;
  }

  if (!profileId && otorgaAcceso(nuevoStatus) && email) {
    const { data: nuevoUsuario, error: errorAuth } = await admin.auth.admin.createUser({ email, email_confirm: true });
    if (errorAuth || !nuevoUsuario?.user) {
      await registrarLog(admin, {
        event_type: eventType,
        event_id: eventId,
        status: 'error',
        detail: `no se pudo crear la cuenta: ${errorAuth?.message ?? 'sin usuario'}`,
      });
      return NextResponse.json({ error: 'no se pudo crear la cuenta' }, { status: 500 });
    }
    const { error: errorPerfil } = await admin.from('profiles').insert({
      id: nuevoUsuario.user.id,
      email,
      status: nuevoStatus,
      hotmart_subscriber_code: subscriberCode,
    });
    if (errorPerfil) {
      await registrarLog(admin, {
        event_type: eventType,
        event_id: eventId,
        status: 'error',
        detail: `no se pudo crear el perfil: ${errorPerfil.message}`,
      });
      return NextResponse.json({ error: 'no se pudo crear el perfil' }, { status: 500 });
    }
    profileId = nuevoUsuario.user.id;
  }

  if (!profileId) {
    // Cancelación/reembolso de alguien que no tenemos registrado — no hay nada que cambiar.
    await registrarLog(admin, { event_type: eventType, event_id: eventId, status: 'profile_not_found' });
    return NextResponse.json({ ok: true, resultado: 'perfil no encontrado' });
  }

  // 3. Idempotencia + 4. Autorización (máquina de estados) — atómico dentro de la RPC.
  const { data: resultado, error: errorRpc } = await admin.rpc('apply_hotmart_event', {
    p_event_id: eventId,
    p_event_type: eventType,
    p_profile_id: profileId,
    p_new_status: nuevoStatus,
    p_hotmart_subscriber_code: subscriberCode,
    p_hotmart_transaction: transaction,
    p_amount_minor: amountMinor,
    p_currency: currency,
    p_raw_payload: payload,
  });

  if (errorRpc) {
    return NextResponse.json({ error: 'error al procesar el evento' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, resultado });
}
