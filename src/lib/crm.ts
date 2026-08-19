/** CRM enum values + display helpers, mirrored from the backend Prisma enums (§11.3). */

export const LEAD_STAGES = [
  'new',
  'contacted',
  'qualified',
  'interested',
  'negotiation',
  'enrolled',
  'lost',
  'junk',
] as const;
export type LeadStage = (typeof LEAD_STAGES)[number];

/** Stages that count as an open/working lead (matches the backend dashboard's openLeads filter). */
export const OPEN_STAGES: LeadStage[] = ['new', 'contacted', 'qualified', 'interested', 'negotiation'];

export const CONVO_CHANNELS = ['call', 'whatsapp', 'sms', 'email', 'in_person', 'video_call'] as const;

export const CONVO_DISPOSITIONS = [
  'connected',
  'not_answered',
  'busy',
  'callback',
  'interested',
  'not_interested',
  'wrong_number',
  'enrolled',
  'lost',
] as const;

export const LEAD_SOURCES = ['website', 'referral', 'ad_campaign', 'walk_in', 'import', 'api', 'other'] as const;

/** Title-case a snake_case enum value, e.g. "not_interested" → "Not interested". */
export function labelize(value: string): string {
  const s = value.replace(/_/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive';

/** A badge variant per stage so the pipeline reads at a glance (status-ish, not a data series). */
export function stageBadge(stage: string): BadgeVariant {
  if (stage === 'enrolled') return 'default';
  if (stage === 'lost' || stage === 'junk') return 'destructive';
  if (stage === 'new') return 'outline';
  return 'secondary';
}
