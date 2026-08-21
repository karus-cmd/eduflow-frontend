'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './login.module.css';

const DEMOS = [
  { label: 'Admin', email: 'admin@eduflow.local', password: 'Admin@12345' },
  { label: 'Manager', email: 'manager1@demo.eduflow.local', password: 'Demo@12345' },
  { label: 'Student', email: 'student1@demo.eduflow.local', password: 'Demo@12345' },
];

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
      <div className={styles.bg} aria-hidden>
        <div className={styles.aurora} />
        <div className={styles.grid} />
        <div className={styles.vignette} />
      </div>

      <Link href="/" className={styles.back}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
        Back
      </Link>

      <div className={styles.card}>
        <span className={styles.brand}>
          <span className={styles.spark} /> EduFlow
        </span>
        <p className={styles.sub}>Sign in to your account</p>

        <form onSubmit={submit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              className={styles.input}
              type="email"
              autoComplete="username"
              placeholder="you@school.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">Password</label>
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
          {needTotp && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="totp">2FA code</label>
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
          )}
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className={styles.demos}>
          <p className={styles.demosLabel}>Demo logins · run the demo seed first</p>
          <div className={styles.demoRow}>
            {DEMOS.map((d) => (
              <button
                key={d.label}
                type="button"
                className={styles.chip}
                onClick={() => {
                  setEmail(d.email);
                  setPassword(d.password);
                  setNeedTotp(false);
                  setError('');
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
