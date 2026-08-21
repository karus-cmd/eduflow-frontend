'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import styles from './landing.module.css';

const rupee = (n: number) => '₹' + n.toLocaleString('en-IN');

export function LandingPage() {
  return (
    <div className={styles.page}>
      <header className={styles.masthead}>
        <div className={styles.mastheadInner}>
          <span className={styles.wordmark}>
            EduFlow <span className={styles.regNo}>REGISTER Nº04</span>
          </span>
          <Link href="/login" className={`${styles.btn} ${styles.btnOnDark}`} style={{ height: 38 }}>
            Sign in
          </Link>
        </div>
      </header>

      <main>
        {/* ---- Hero: headline + the living register ---- */}
        <section className={styles.shell}>
          <div className={styles.hero}>
            <div>
              <h1 className={styles.headline}>
                Every student entered,
                <br />
                every rupee <em>reconciled</em>.
              </h1>
              <p className={styles.lede}>
                EduFlow keeps admissions, learning, and commission in one ruled record. From a first enquiry
                to a counsellor&rsquo;s payout, nothing goes unentered.
              </p>
              <div className={styles.heroActions}>
                <Link href="/login" className={`${styles.btn} ${styles.btnBrass}`}>
                  Open the register
                  <Arrow />
                </Link>
                <a href="#pipeline" className={`${styles.btn} ${styles.btnOutline}`}>
                  See the entries
                </a>
              </div>
              <div className={styles.heroFoot}>
                <span>
                  <b>Four roles</b> on one record
                </span>
                <span>
                  <b>Paise-precise</b> ledger
                </span>
                <span>
                  <b>Self-hosted</b> lessons
                </span>
              </div>
            </div>

            <RegisterSheet />
          </div>
        </section>

        {/* ---- The pipeline as ruled stages ---- */}
        <section id="pipeline" className={`${styles.shell} ${styles.section}`}>
          <div className={styles.sectionHead}>
            <div className={styles.sectionTop}>
              <h2 className={styles.sectionTitle}>One record, from enquiry to payout.</h2>
              <span className={styles.folio}>Sheet A</span>
            </div>
            <p className={styles.sectionText}>
              Most institutes keep four disconnected books. Here each stage posts to the next, so the enquiry
              your counsellor logged this morning is the payout Finance reconciles at month end.
            </p>
          </div>
          <div className={styles.stages}>
            {STAGES.map((s) => (
              <div key={s.name} className={styles.stageCol}>
                <div className={styles.stageColHead}>
                  <span className={styles.stageColNib}>{s.icon}</span>
                  <span className={styles.stageColName}>{s.name}</span>
                </div>
                <p className={styles.stageColText}>{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---- The three books, proven with real entries ---- */}
        <section className={`${styles.shell} ${styles.section}`}>
          <div className={styles.sectionHead}>
            <div className={styles.sectionTop}>
              <h2 className={styles.sectionTitle}>Three books that keep themselves.</h2>
              <span className={styles.folio}>Sheet B</span>
            </div>
          </div>
          <div className={styles.spread}>
            {/* Admissions register (wide) */}
            <div className={styles.block}>
              <div className={styles.blockHead}>
                <span className={styles.blockTitle}>Admissions register</span>
                <span className={styles.blockTag}>counsellor</span>
              </div>
              {ADMISSIONS.map((r) => (
                <div key={r.name} className={styles.miniRow}>
                  <span className={styles.k}>{r.name}</span>
                  <span className={styles.v}>{r.follow}</span>
                </div>
              ))}
            </div>

            <div className={styles.stack}>
              {/* Course register */}
              <div className={styles.block}>
                <div className={styles.blockHead}>
                  <span className={styles.blockTitle}>Course register</span>
                  <span className={styles.blockTag}>student</span>
                </div>
                {COURSES.map((c) => (
                  <div key={c.name} className={styles.miniRow}>
                    <span className={styles.k}>{c.name}</span>
                    <span className={styles.progressCell}>
                      <span className={styles.progressTrack}>
                        <span className={styles.progressFill} style={{ width: `${c.pct}%` }} />
                      </span>
                      <span className={styles.v}>{c.pct}%</span>
                    </span>
                  </div>
                ))}
              </div>

              {/* Commission ledger */}
              <div className={styles.block}>
                <div className={styles.blockHead}>
                  <span className={styles.blockTitle}>Commission ledger</span>
                  <span className={styles.blockTag}>finance</span>
                </div>
                {LEDGER.map((l) => (
                  <div key={l.label} className={styles.miniRow}>
                    <span className={styles.k}>{l.label}</span>
                    <span className={`${styles.v} ${l.debit ? styles.debit : styles.credit}`}>
                      {l.debit ? '−' : '+'}
                      {rupee(l.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ---- Roster: who signs the register ---- */}
        <section className={`${styles.shell} ${styles.section}`}>
          <div className={styles.sectionHead}>
            <div className={styles.sectionTop}>
              <h2 className={styles.sectionTitle}>Everyone works the same book.</h2>
              <span className={styles.folio}>Sheet C</span>
            </div>
          </div>
          <div className={styles.roster}>
            {ROLES.map((r) => (
              <div key={r.role} className={styles.rosterRow}>
                <span className={styles.stageColNib}>{r.icon}</span>
                <span>
                  <span className={styles.rName}>{r.name}</span>
                  <span className={styles.rRole}>{r.role}</span>
                </span>
                <span className={styles.rDesc}>{r.desc}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ---- Close ---- */}
        <section className={styles.shell}>
          <div className={styles.close}>
            <h2 className={styles.closeTitle}>Open the register.</h2>
            <p className={styles.closeText}>
              Sign in and land in your own sheet. Every book is already ruled and live, waiting for the next
              entry.
            </p>
            <div className={styles.closeActions}>
              <Link href="/login" className={`${styles.btn} ${styles.btnOnDark}`}>
                Sign in
                <Arrow />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.colophon}>
        <span>EDUFLOW · ENROLMENT CRM · LMS · COMMISSION LEDGER</span>
        <span>KEPT IN INK, RECONCILED TO THE PAISE</span>
      </footer>
    </div>
  );
}

/* ---------- The register sheet with the one authored motion ---------- */

function RegisterSheet() {
  const [posted, setPosted] = useState(false);
  const [tally, setTally] = useState(BASE_TALLY);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const post = () => {
      setPosted(true);
      if (reduce) {
        setTally(FINAL_TALLY);
        return;
      }
      // tick the tally up as the new entry lands — a ledger event, not a decorative counter
      const start = performance.now();
      const dur = 620;
      const from = BASE_TALLY;
      const to = FINAL_TALLY;
      const ease = (t: number) => 1 - Math.pow(1 - t, 3);
      const step = (now: number) => {
        const p = Math.min((now - start) / dur, 1);
        setTally(Math.round(from + (to - from) * ease(p)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          io.disconnect();
          const t = setTimeout(post, reduce ? 0 : 700);
          timers.push(t);
        }
      },
      { threshold: 0.5 },
    );
    const timers: ReturnType<typeof setTimeout>[] = [];
    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className={styles.sheet} ref={ref}>
      <div className={styles.sheetHead}>
        <span>Admissions &amp; Commission</span>
        <span>Aug 2026</span>
      </div>
      <table className={styles.ledger}>
        <thead>
          <tr>
            <th style={{ width: 56 }}>Entry</th>
            <th>Name</th>
            <th>Stage</th>
            <th className="num">Commission</th>
          </tr>
        </thead>
        <tbody>
          {ENTRIES.map((e) => (
            <tr key={e.no}>
              <td>
                <span className={styles.entryNo}>{e.no}</span>
              </td>
              <td>{e.name}</td>
              <td>
                <span className={`${styles.stage} ${e.stageClass}`}>{e.stage}</span>
              </td>
              <td className="num">
                {e.amount ? <span className={styles.amount}>{rupee(e.amount)}</span> : <span className={styles.pending}>—</span>}
              </td>
            </tr>
          ))}
          {posted && (
            <tr className={styles.posted}>
              <td>
                <span className={styles.entryNo}>0234</span>
              </td>
              <td>Kabir Anand</td>
              <td>
                <span className={`${styles.stage} ${styles.stageEnrolled}`}>Enrolled</span>
              </td>
              <td className="num">
                <span className={styles.amount}>{rupee(24990)}</span>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <div className={styles.tally}>
        <span className={styles.tallyLabel}>Posted this sheet</span>
        <span className={styles.tallyValue}>{rupee(tally)}</span>
      </div>
    </div>
  );
}

/* ---------- content ---------- */

const BASE_TALLY = 43490;
const FINAL_TALLY = 68480;

const ENTRIES = [
  { no: '0231', name: 'Priya Sharma', stage: 'Enrolled', stageClass: styles.stageEnrolled, amount: 24990 },
  { no: '0232', name: 'Arjun Mehta', stage: 'Learning', stageClass: styles.stageLearning, amount: 18500 },
  { no: '0233', name: 'Neha Rao', stage: 'Lead', stageClass: styles.stageLead, amount: 0 },
];

const STAGES = [
  { name: 'Lead', text: 'A referral or enquiry is entered against a counsellor.', icon: <IconUser /> },
  { name: 'Conversation', text: 'Every call is logged; the stage advances on contact.', icon: <IconPen /> },
  { name: 'Enrolment', text: 'Checkout captures payment and provisions access.', icon: <IconStamp /> },
  { name: 'Learning', text: 'Streamed lessons, resumable progress, live classes.', icon: <IconBook /> },
  { name: 'Commission', text: 'The ledger accrues, reconciles, and pays out.', icon: <IconCoin /> },
];

const ADMISSIONS = [
  { name: 'Priya Sharma', follow: 'Enrolled · Aug 18' },
  { name: 'Arjun Mehta', follow: 'Call back · Aug 22' },
  { name: 'Neha Rao', follow: 'Demo booked · Aug 24' },
  { name: 'Ishaan Gupta', follow: 'New lead · today' },
];

const COURSES = [
  { name: 'NEET Foundation', pct: 74 },
  { name: 'JEE Mains Crash', pct: 41 },
  { name: 'Class 11 Physics', pct: 12 },
];

const LEDGER = [
  { label: 'Enrolment · Priya S.', amount: 2499, debit: false },
  { label: 'Enrolment · Arjun M.', amount: 1850, debit: false },
  { label: 'Refund · cancelled', amount: 900, debit: true },
];

const ROLES = [
  { role: 'Student', name: 'Learn without friction', icon: <IconBook />, desc: 'Browse, enrol, and pick up any course where you left it — streamed video, live classes, a clear path.' },
  { role: 'Counsellor', name: 'Work a book that keeps pace', icon: <IconPen />, desc: 'Log a call and the stage moves itself. Watch commission accrue as your students enrol.' },
  { role: 'Admin', name: 'Author and orchestrate', icon: <IconStamp />, desc: 'Build courses, onboard managers, publish content, and run the studio from one desk.' },
  { role: 'Finance', name: 'Books that tie out', icon: <IconCoin />, desc: 'A paise-precise ledger, a payout queue by threshold, and reporting you can trust to the rupee.' },
];

/* ---------- drawn icons: single stroke, in-world ---------- */
function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
function IconUser() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.6 3.1-5.5 7-5.5s7 1.9 7 5.5" />
    </svg>
  );
}
function IconPen() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20h4L19 9a2 2 0 0 0-3-3L5 17z" /><path d="M14 7l3 3" />
    </svg>
  );
}
function IconStamp() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 9a3 3 0 1 1 6 0c0 2-1.5 2.5-1.5 4h-3C10.5 11 9 10.5 9 9Z" /><path d="M6 20h12M7 20v-2.5h10V20" />
    </svg>
  );
}
function IconBook() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 4h9a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z" /><path d="M16 6h3v14h-3M9 8h4M9 12h4" />
    </svg>
  );
}
function IconCoin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" /><path d="M9.5 9h4M9 12.5h6M11 15l2-5" />
    </svg>
  );
}
