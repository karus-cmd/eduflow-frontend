'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import styles from './login.module.css';
import { STICKER_ART } from '@/components/stickers/sticker-art';

// Empty until a real Google Cloud OAuth Client ID is provisioned — see .env.example. The Google
// buttons below simply don't render while this is unset (graceful degradation, not a crash).
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';

interface GoogleCredentialResponse {
  credential: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: string;
              size?: string;
              text?: string;
              width?: number;
              shape?: string;
              logo_alignment?: string;
            },
          ) => void;
        };
      };
    };
  }
}

/**
 * The ambient scene. Titles and section numbers are taken from the real seeded curricula, so the
 * page shows a genuine glimpse of the courses rather than invented filler.
 *
 * `pos` also selects the drift: each position class binds a different keyframe at a different
 * duration, so with eight cards on screen no two ever move in step.
 */
const FLOATERS = [
  { pos: 'fc1', tag: 'fcTagE', badge: 'DSA', title: 'Two pointers', meta: 'PATTERNS · §3' },
  { pos: 'fc2', tag: 'fcTagC', badge: 'ML', title: 'Gradient descent', meta: 'GRADIENT · §5' },
  { pos: 'fc3', tag: 'fcTagI', badge: 'DSA', title: 'Sliding window', meta: 'PATTERNS · §10' },
  { pos: 'fc4', tag: 'fcTagE', badge: 'ML', title: 'Backpropagation', meta: 'GRADIENT · §12' },
  { pos: 'fc5', tag: 'fcTagI', badge: 'DSA', title: 'Binary search on answer', meta: 'PATTERNS · §5' },
  { pos: 'fc6', tag: 'fcTagC', badge: 'ML', title: 'Attention', meta: 'GRADIENT · §15' },
  { pos: 'fc7', tag: 'fcTagI', badge: 'DSA', title: 'Backtracking', meta: 'PATTERNS · §18' },
  { pos: 'fc8', tag: 'fcTagE', badge: 'ML', title: 'Random forests', meta: 'GRADIENT · §8' },
] as const;

/** Line-art marks from each subject's own vocabulary — transparent by construction, no cutout. */
const STICKERS = [
  { pos: 'st1', name: 'tree' },
  { pos: 'st2', name: 'neuron' },
  { pos: 'st3', name: 'terminal' },
  { pos: 'st4', name: 'loss' },
  { pos: 'st5', name: 'branch' },
  { pos: 'st6', name: 'target' },
  { pos: 'st7', name: 'brackets' },
] as const;

function homeFor(role: string) {
  if (role === 'admin' || role === 'finance') return '/admin';
  if (role === 'counselor' || role === 'team_lead') return '/counselor';
  return '/student';
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totp, setTotp] = useState('');
  const [needTotp, setNeedTotp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleError, setGoogleError] = useState('');

  const signInDivRef = useRef<HTMLDivElement>(null);
  const googleInitialized = useRef(false);

  async function handleGoogleCredential(response: GoogleCredentialResponse) {
    setGoogleError('');
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: response.credential }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setGoogleError(data?.error?.message ?? 'Google sign-in failed.');
      return;
    }
    router.push(homeFor(data.role));
    router.refresh();
  }

  function onGoogleScriptLoad() {
    if (!GOOGLE_CLIENT_ID || googleInitialized.current || !window.google) return;
    googleInitialized.current = true;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
    });
    // ONE button. There were previously two — a `signup_with` and a `signin_with` — but Google
    // replaces the label with a personalised pill ("Sign in as …") for anyone already logged into
    // a Google account, so both rendered identically and read as a duplicate bug. Google sign-in
    // provisions a new account server-side anyway, so sign-up and sign-in are the same action here.
    if (signInDivRef.current) {
      const dark = document.documentElement.classList.contains('dark');
      window.google.accounts.id.renderButton(signInDivRef.current, {
        theme: dark ? 'filled_black' : 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'center',
        // GSI only accepts a fixed pixel width, so match the form field width to keep the
        // button flush with the inputs below it rather than floating narrower than them.
        width: Math.min(signInDivRef.current.offsetWidth || 360, 400),
      });
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, ...(totp ? { totp } : {}) }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      if (data?.error?.details?.twoFactorRequired) {
        setNeedTotp(true);
        setError('Two-factor code required.');
      } else {
        setError(data?.error?.message ?? 'Login failed.');
      }
      return;
    }
    router.push(homeFor(data.role));
    router.refresh();
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.scene} aria-hidden>
        <div className={styles.aura} />

        {/* Every card below is a REAL chapter from the seeded curricula, with its true section
            number — the scene doubles as a peek at what is actually inside. Each carries its own
            drift on a deliberately non-matching duration so the set never falls into step. */}
        {FLOATERS.map((f) => (
          <div key={f.title} className={`${styles.floatCard} ${styles[f.pos]}`}>
            <div className={styles.fcBody}>
              <span className={`${styles.fcTag} ${styles[f.tag]}`}>{f.badge}</span>
              <span className={styles.fcLine}>{f.title}</span>
              <span className={styles.fcMeta}>{f.meta}</span>
            </div>
          </div>
        ))}

        {STICKERS.map((s) => (
          <span key={s.pos} className={`${styles.sticker} ${styles[s.pos]}`}>
            <svg viewBox="0 0 32 32" width="100%" height="100%" role="presentation" focusable="false">
              {STICKER_ART[s.name]}
            </svg>
          </span>
        ))}

        <span className={styles.sparkle}>✦</span>
      </div>

      <Link href="/" className={styles.back}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
        Back to home
      </Link>

      <div className={styles.card}>
        <span className={styles.brand}>
          <span className={styles.mark}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
            </svg>
          </span>
          STEIN-X
        </span>
        <h1 className={styles.title}>Welcome back</h1>
        <p className={styles.sub}>Sign in to pick up where you left off.</p>

        {GOOGLE_CLIENT_ID && (
          <>
            <Script
              src="https://accounts.google.com/gsi/client"
              strategy="afterInteractive"
              onLoad={onGoogleScriptLoad}
            />
            <div className={styles.google}>
              <div ref={signInDivRef} className={styles.googleBtn} />
              {googleError && <p className={styles.error}>{googleError}</p>}
            </div>
            <div className={styles.divider}>or continue with email</div>
          </>
        )}

        <form onSubmit={submit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email</label>
            <div className={styles.inputBox}>
              <input
                id="email"
                className={styles.input}
                type="email"
                autoComplete="username"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Password</label>
            <div className={styles.inputBox}>
              <input
                id="password"
                className={styles.input}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          {needTotp && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="totp">2FA code</label>
              <div className={styles.inputBox}>
                <input
                  id="totp"
                  className={styles.input}
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  placeholder="123456"
                  value={totp}
                  onChange={(e) => setTotp(e.target.value)}
                />
              </div>
            </div>
          )}
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
