'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import styles from './login.module.css';

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
            options: { theme?: string; size?: string; text?: string; width?: number },
          ) => void;
        };
      };
    };
  }
}

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

  const signUpDivRef = useRef<HTMLDivElement>(null);
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
    if (signUpDivRef.current) {
      window.google.accounts.id.renderButton(signUpDivRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'signup_with',
        width: 240,
      });
    }
    if (signInDivRef.current) {
      window.google.accounts.id.renderButton(signInDivRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        width: 240,
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
        <div className={`${styles.floatCard} ${styles.fc1}`}>
          <div className={styles.fcBody}>
            <span className={`${styles.fcTag} ${styles.fcTagE}`}>DSA</span>
            <span className={styles.fcLine}>Two pointers</span>
            <span className={styles.fcMeta}>timed drill</span>
          </div>
        </div>
        <div className={`${styles.floatCard} ${styles.fc2}`}>
          <div className={styles.fcBody}>
            <span className={`${styles.fcTag} ${styles.fcTagC}`}>NEET</span>
            <span className={styles.fcLine}>Cell biology</span>
            <span className={styles.fcMeta}>9 min</span>
          </div>
        </div>
        <div className={`${styles.floatCard} ${styles.fc3}`}>
          <div className={styles.fcBody}>
            <span className={`${styles.fcTag} ${styles.fcTagI}`}>Aptitude</span>
            <span className={styles.fcLine}>Big-O basics</span>
            <span className={styles.fcMeta}>quick set</span>
          </div>
        </div>
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
              <div ref={signUpDivRef} />
              <div ref={signInDivRef} />
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
