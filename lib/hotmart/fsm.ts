// Máquina de estados: qué status de perfil corresponde a cada evento de Hotmart
// (18-VENTA-HOTMART.md). 'trialing' y 'active' dan acceso completo a la app — se
// mantienen separados solo para poder medir la conversión trial→pago.

export type MembershipStatus = 'trialing' | 'active' | 'past_due' | 'cancelled' | 'expired' | 'refunded' | 'chargeback';

// SUBSCRIPTION_TRIAL_START es un nombre de evento de PLACEHOLDER — 18-VENTA-HOTMART.md advierte
// que es igual de probable que Hotmart avise el inicio del trial como un PURCHASE_APPROVED con
// price.value = 0 (en vez de un evento propio). Por eso statusForEvent recibe el monto: un
// PURCHASE_APPROVED/COMPLETE con monto 0 se trata como 'trialing', NUNCA como 'active' — si no,
// el trial fijaría first_paid_at en el día 0 y la métrica trial→pago quedaría rota en silencio.
// VERIFICAR con una compra sandbox real (capturar el JSON) antes de confiar en cuál de los dos
// casos realmente usa esta cuenta de Hotmart — pendiente anotado en ESTADO.md.
const EVENTO_A_STATUS: Record<string, MembershipStatus | null> = {
  SUBSCRIPTION_TRIAL_START: 'trialing',
  PURCHASE_APPROVED: 'active',
  PURCHASE_COMPLETE: 'active',
  PURCHASE_DELAYED: 'past_due',
  SUBSCRIPTION_CANCELLATION: 'cancelled',
  PURCHASE_REFUNDED: 'refunded',
  PURCHASE_CHARGEBACK: 'chargeback',
  SWITCH_PLAN: null, // cambia el plan, no el status — no se maneja todavía (un solo plan real)
};

export const EVENTOS_SOPORTADOS = Object.keys(EVENTO_A_STATUS);

/**
 * null = evento reconocido que no cambia el status (se loguea, no se aplica).
 * amountMinor: el monto del cobro en centavos, si el evento trae uno — decide si un
 * PURCHASE_APPROVED/COMPLETE es el inicio del trial (monto 0) o un cobro real (monto > 0).
 */
export function statusForEvent(eventType: string, amountMinor: number | null): MembershipStatus | null | undefined {
  if (!(eventType in EVENTO_A_STATUS)) return undefined; // evento desconocido
  const status = EVENTO_A_STATUS[eventType];
  if (status === 'active' && amountMinor === 0) return 'trialing';
  return status;
}

/** Eventos que dan acceso — si no hay perfil todavía, hay que crear la cuenta. */
export function otorgaAcceso(status: MembershipStatus | null): boolean {
  return status === 'trialing' || status === 'active';
}
