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

// ─────────────────────────────────────────────────────────────────────────────
// F1 — Student revenue path (catalog → checkout → learning → player → profile)
// Shapes mirror the backend services 1:1 (see the contract-gap note above). Money
// fields are paise-as-string; progressPct is a Decimal string; dates are ISO strings.
// ─────────────────────────────────────────────────────────────────────────────

/** A course row as returned by `GET /courses` (list) and the base of the detail tree. */
export interface Course {
  id: string;
  orgId: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  status: string;
  pricePaise: string;
  mrpPaise: string | null;
  currency: string;
  accessDays: number | null;
  totalLessons: number;
  totalDurationSec: number;
  publishedAt: string | null;
  createdAt: string;
}

/** A file/link attached to a course or lesson (§11.4). */
export interface ResourceItem {
  id: string;
  courseId: string | null;
  lessonId: string | null;
  title: string;
  type: string; // pdf | doc | link | image | archive | other
  url: string;
  sizeBytes: string | null;
  isDownloadable: boolean;
  sortOrder: number;
}

/**
 * A lesson node inside the student course tree. For a student the backend STRIPS
 * content/video on locked lessons: when `locked` is true, `description`, `contentHtml`,
 * `videoAssetId` and `resources` come back empty/null (enrollment or free-preview required).
 */
export interface LessonNode {
  id: string;
  title: string;
  durationSec: number;
  sortOrder: number;
  isFreePreview: boolean;
  availableAt: string | null;
  locked: boolean;
  description: string | null;
  contentHtml: string | null;
  videoAssetId: string | null;
  resources: ResourceItem[];
}

export interface SectionNode {
  id: string;
  title: string;
  sortOrder: number;
  lessons: LessonNode[];
}

/** `GET /courses/:id` for a student: the course + gated tree + course-level resources + enrolled flag. */
export interface CourseDetail extends Course {
  sections: SectionNode[];
  resources: ResourceItem[];
  enrolled: boolean;
}

/** `GET /me/enrollments` and `GET /enrollments/:id`. */
export interface Enrollment {
  id: string;
  orgId: string;
  studentId: string;
  courseId: string;
  orderId: string | null;
  counselorId: string | null;
  status: string; // active | cancelled | expired
  pricePaidPaise: string;
  accessStartsAt: string;
  accessEndsAt: string | null;
  progressPct: string;
  completedAt: string | null;
  createdAt: string;
  course: { id: string; title: string; slug: string; thumbnailUrl: string | null };
}

export interface OrderItem {
  id: string;
  orderId: string;
  courseId: string;
  unitPricePaise: string;
  quantity: number;
  totalPaise: string;
}

/** `POST /orders` and `GET /orders/:id`. */
export interface Order {
  id: string;
  status: string; // created | paid | refunded | partially_refunded | ...
  subtotalPaise: string;
  discountPaise: string;
  taxPaise: string;
  totalPaise: string;
  amountPaidPaise: string;
  currency: string;
  couponCode: string | null;
  referralCode: string | null;
  items: OrderItem[];
}

/** `POST /orders/:id/checkout` — the payload the browser hands to the Razorpay widget. */
export interface CheckoutPayload {
  orderId: string;
  gatewayOrderId: string;
  keyId: string;
  amountPaise: string;
  currency: string;
}

/** Our BFF `/api/checkout` response = a created order run straight through to checkout. */
export interface CheckoutResult extends CheckoutPayload {
  courseId: string;
  courseTitle: string;
}

/** `GET /lessons/:id/playback` — a signed, domain-locked HLS URL served by the video Worker. */
export interface PlaybackToken {
  masterUrl: string;
  poster: string;
  expiresIn: number;
}

/** `GET /lessons/:id/download` (video MP4) / `GET /resources/:id/download` (attachment). */
export interface DownloadLink {
  downloadUrl?: string;
  url?: string;
  expiresIn?: number;
  isDownloadable?: boolean;
}

export interface LiveClass {
  id: string;
  courseId: string;
  title: string;
  scheduledAt: string;
  durationMin: number | null;
  joinUrl: string | null;
  status: string;
}
