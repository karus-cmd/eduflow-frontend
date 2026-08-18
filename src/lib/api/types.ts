/**
 * Response types for the endpoints F0 uses.
 *
 * The backend's OpenAPI spec types every REQUEST body (from the DTOs) but NOT response bodies —
 * controllers return plain service objects the swagger plugin can't infer, so every operation shows
 * `200` with no schema. (Reported as a contract gap; the fix is to add typed @ApiOkResponse DTOs on
 * the backend.) Until then these hand-written types mirror the backend services 1:1. Money fields are
 * strings (paise); progressPct is a Decimal string.
 */
import type { components } from './schema';

/** Request bodies ARE typed by the spec — reuse them so the client stays in sync with the DTOs. */
export type LoginBody = components['schemas']['LoginDto'];

export type Role = 'admin' | 'counselor' | 'student' | 'finance' | 'team_lead';

export interface AuthUserPublic {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  role: Role;
  status: string;
}
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
export interface LoginResponse {
  user: AuthUserPublic;
  tokens: TokenPair;
}

export interface MeResponse {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  role: Role;
  status: string;
  orgId: string;
  lastLoginAt: string | null;
  permissions: string[];
}

export interface AdminDashboard {
  stats: {
    counselors: number;
    students: number;
    leads: number;
    conversationsToday: number;
    enrollments: number;
    revenuePaise: string;
  };
}

export interface CounselorDashboard {
  balance: { earnedPaise: string; paidPaise: string; pendingPaise: string };
  stats: { studentsEnrolled: number; conversationsToday: number; openLeads: number };
  recentConversations: { id: string; leadId: string; disposition: string; occurredAt: string }[];
}

export interface StudentDashboard {
  enrollments: {
    id: string;
    course: { id: string; title: string; slug: string; thumbnailUrl: string | null };
    status: string;
    progressPct: string;
    accessEndsAt: string | null;
    completedAt: string | null;
  }[];
  nextClass: { id: string; courseId: string; title: string; scheduledAt: string; joinUrl: string | null } | null;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
}
export interface Paginated<T> {
  data: T[];
  meta: PageMeta;
}

export interface CounselorListItem {
  id: string;
  fullName: string;
  email: string | null;
  status: string;
  employeeCode: string | null;
  isAcceptingLeads: boolean | null;
  stats: {
    students: number;
    conversations: number;
    earnedPaise: string;
    paidPaise: string;
    pendingPaise: string;
  };
}
