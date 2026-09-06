'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import styles from './landing.module.css';
import { Sticker } from '@/components/stickers/sticker';
import { ThemeToggle } from '@/components/theme-toggle';
import { PricingPlans } from '@/components/pricing/pricing-plans';
import type { LandingCatalog, TrackKey } from '@/lib/catalog';

/**
 * STEIN-X landing — the Signal direction.
 *
 * Every number on this page is real and traceable to the seeded courses (82 and
 * 83 lessons, 18 sections each, 365 days of access, two enforced tiers). The
 * page deliberately does NOT claim video lessons, live classes, a question bank,
 * timed in-app mocks or spaced repetition, because none of those exist yet — the
 * old copy advertised roughly twenty subjects against a single real course.
 *
 * The one gap that matters to a buyer, video, is stated outright in `candid`
 * rather than buried: saying it first is worth more than the sale it might cost,
 * and it converts as a founding-member reason to buy now.
 */

export function LandingPage({ catalog }: { catalog: LandingCatalog }) {
  const [stuck, setStuck] = useState(false);

  // Editorial copy has no backend field, so it stays here and is merged onto the live figures by
  // key. Every NUMBER below comes from the catalogue; nothing numeric is written in this file.
  const tracks = TRACK_COPY.map((copy) => ({
    ...copy,
    figures: catalog.tracks.find((t) => t.key === copy.key),
  }));

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={styles.page}>
      <nav className={styles.nav} {...(stuck ? { 'data-stuck': '' } : {})}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.wordmark}>
            <span className={styles.mark} aria-hidden="true">
              <IconSpark />
            </span>
            STEIN-X
          </Link>
          <div className={styles.navLinks}>
            <a className={styles.navLink} href="#tracks">Tracks</a>
            <a className={styles.navLink} href="#included">What you get</a>
            <a className={styles.navLink} href="#pricing">Pricing</a>
            <a className={styles.navLink} href="#faq">FAQ</a>
          </div>
          <div className={styles.navRight}>
            <ThemeToggle className={styles.iconBtn} />
            <Link href="/login" className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}>
              Sign in
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* ---------------- hero ---------------- */}
        <section className={styles.shell}>
          <div className={styles.hero}>
            <Sticker name="tree" size={38} drift={14} spin={-5} tone="signal" opacity={0.3} style={{ top: 30, right: '4%' }} />
            <Sticker name="neuron" size={34} drift={-11} spin={4} tone="mint" opacity={0.28} style={{ top: 210, right: '17%' }} />
            <Sticker name="complexity" size={30} drift={9} tone="ink" opacity={0.3} style={{ top: 340, right: '2%' }} />
            <Sticker name="brackets" size={26} drift={-8} tone="ink" opacity={0.22} style={{ top: 120, left: '-2%' }} />

            <Reveal>
              <span className={styles.eyebrow}>
                <span className={styles.eyebrowDot} aria-hidden="true" />
                Two tracks · built for engineering roles
              </span>
              <h1 className={styles.headline}>
                Stop grinding random problems.
                <br />
                <span className={styles.hl}>Learn the patterns.</span>
              </h1>
              <p className={styles.lede}>
                STEIN-X is one structured path per track — ordered so each idea lands on the one before
                it, with a mentor and real mock rounds when self-study stops being enough.
              </p>
              <div className={styles.heroActions}>
                <a href="#tracks" className={styles.btn}>
                  See the tracks <IconArrow />
                </a>
                <a href="#pricing" className={`${styles.btn} ${styles.btnGhost}`}>
                  View pricing
                </a>
              </div>

              <div className={styles.heroMeta}>
                <div className={styles.metaItem}>
                  <span className={styles.metaNum}>{catalog.totals.lessons}</span>
                  <span className={styles.metaLabel}>lessons written</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaNum}>{catalog.totals.sections}</span>
                  <span className={styles.metaLabel}>sections</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaNum}>
                    {catalog.totals.accessDays}
                    <span>d</span>
                  </span>
                  <span className={styles.metaLabel}>access</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaNum}>{catalog.totals.trackCount}</span>
                  <span className={styles.metaLabel}>tracks at launch</span>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------------- tracks ---------------- */}
        <section id="tracks" className={styles.shell}>
          <div className={styles.section}>
            <Reveal className={styles.sectionHead}>
              <span className={styles.eyebrow}>
                <span className={styles.eyebrowDot} aria-hidden="true" />
                The tracks
              </span>
              <h2 className={styles.h2}>Two tracks. Both end in an interview.</h2>
              <p className={styles.sub}>
                Each one is a single ordered path, split into a core tier and an advanced tier. The
                advanced modules are genuinely locked until you own them — not a marketing line.
              </p>
            </Reveal>

            <div className={styles.tracks}>
              {tracks.map((t, i) => (
                <Reveal key={t.code} style={{ ['--i' as string]: String(i) }}>
                  <article className={styles.track}>
                    <Sticker
                      name={t.sticker}
                      size={30}
                      drift={t.drift}
                      spin={3}
                      tone={t.tone}
                      opacity={0.26}
                      style={{ top: 20, right: 20 }}
                    />
                    <span className={styles.trackCode}>{t.code}</span>
                    <h3 className={styles.trackName}>{t.name}</h3>
                    <p className={styles.trackDesc}>{t.desc}</p>

                    <ul className={styles.trackList}>
                      {t.core.map((c) => (
                        <li key={c} className={styles.chip}>
                          {c}
                        </li>
                      ))}
                      {t.advanced.map((c) => (
                        <li key={c} className={`${styles.chip} ${styles.chipLocked}`}>
                          {c}
                        </li>
                      ))}
                    </ul>

                    <div className={styles.trackStats}>
                      <span className={styles.trackStat}>
                        <b>{t.figures?.totalLessons ?? 0}</b> lessons
                      </span>
                      <span className={styles.trackStat}>
                        <b>{t.figures?.sections ?? 0}</b> sections
                      </span>
                      {t.figures ? (
                        <span className={styles.trackStat}>
                          from{' '}
                          <span className={styles.trackPrice}>
                            ₹{t.figures.standard.price.toLocaleString('en-IN')}
                          </span>
                        </span>
                      ) : null}
                    </div>

                    <div className={styles.trackFoot}>
                      <a href="#pricing" className={`${styles.btn} ${styles.btnGhost} ${styles.btnSm}`}>
                        See plans <IconArrow />
                      </a>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- what you actually get ---------------- */}
        <section id="included" className={styles.shell}>
          <div className={styles.section}>
            <Sticker name="stopwatch" size={30} drift={12} tone="signal" opacity={0.22} style={{ top: 44, right: '3%' }} />
            <Reveal className={styles.sectionHead}>
              <span className={styles.eyebrow}>
                <span className={styles.eyebrowDot} aria-hidden="true" />
                What you actually get
              </span>
              <h2 className={styles.h2}>No filler. Just the things that move an offer closer.</h2>
              <p className={styles.sub}>
                We would rather list four real things than twenty imaginary ones.
              </p>
            </Reveal>

            <div className={styles.gets}>
              {GETS.map((g, i) => (
                <Reveal key={g.title} style={{ ['--i' as string]: String(i) }}>
                  <div className={styles.get}>
                    <span className={styles.getIcon}>{g.icon}</span>
                    <h3 className={styles.getTitle}>{g.title}</h3>
                    <p className={styles.getText}>{g.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal>
              <div className={styles.candid}>
                <span className={styles.candidTag}>Straight up</span>
                <p>
                  Every lesson is written and ordered today. <b>Video is still in production.</b> We
                  would rather say that than let you find out after paying — so anyone who joins now
                  gets every video free as it lands, at the price they paid today.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------------- pricing ---------------- */}
        <section id="pricing">
          <div className={styles.section}>
            <div className={styles.shell}>
              <Reveal className={styles.sectionHead}>
                <span className={styles.eyebrow}>
                  <span className={styles.eyebrowDot} aria-hidden="true" />
                  Pricing
                </span>
                <h2 className={styles.h2}>Pick how much help you want.</h2>
                <p className={styles.sub}>
                  The curriculum is the same path in every plan. What changes is how far it goes, and
                  whether there is a person on the other end of it.
                </p>
              </Reveal>
            </div>
            <PricingPlans tracks={catalog.tracks} />
          </div>
        </section>

        {/* ---------------- faq ---------------- */}
        <section id="faq" className={styles.shell}>
          <div className={styles.section}>
            <Reveal className={styles.sectionHead}>
              <span className={styles.eyebrow}>
                <span className={styles.eyebrowDot} aria-hidden="true" />
                Questions
              </span>
              <h2 className={styles.h2}>The things people actually ask.</h2>
            </Reveal>
            <div className={styles.faq}>
              {FAQ.map((f, i) => (
                <Faq key={f.q} q={f.q} a={f.a} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- close ---------------- */}
        <section className={styles.shell}>
          <Reveal>
            <div className={styles.close}>
              <Sticker name="spark" size={26} drift={10} tone="signal" opacity={0.3} style={{ top: 26, left: '8%' }} />
              <Sticker name="flame" size={24} drift={-9} tone="warning" opacity={0.24} style={{ bottom: 26, right: '9%' }} />
              <h2 className={styles.closeTitle}>Start the first section tonight.</h2>
              <p className={styles.closeSub}>
                Pick a track, work the path in order, and let someone check your thinking before the
                interview does.
              </p>
              <div className={styles.closeActions}>
                <a href="#pricing" className={styles.btn}>
                  Choose your plan <IconArrow />
                </a>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className={styles.footer}>
        <span className={styles.wordmark} style={{ fontSize: 15 }}>
          <span className={styles.mark} style={{ width: 21, height: 21 }} aria-hidden="true">
            <IconSpark />
          </span>
          STEIN-X
        </span>
        <span>DSA patterns · Machine learning · Mentorship · Mock interviews</span>
      </footer>
    </div>
  );
}

/* ---------------- reveal ---------------- */

function Reveal({
  children,
  className,
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -70px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} data-reveal="" {...(seen ? { 'data-in': '' } : {})} className={className} style={style}>
      {children}
    </div>
  );
}

/* ---------------- faq item ---------------- */

function Faq({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(index === 0);
  return (
    <div className={styles.faqItem}>
      <button
        type="button"
        className={styles.faqQ}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {q}
        <svg
          className={styles.faqSign}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
      {open ? <p className={styles.faqA}>{a}</p> : null}
    </div>
  );
}

/* ---------------- content (all figures traceable to the seeded courses) ------ */

/**
 * Editorial copy only. Lesson counts, section counts and prices used to live here too and drifted
 * from the database the moment anyone edited a course — they now come from the public catalogue
 * and are merged onto this by `key`. Nothing numeric belongs in this array.
 */
const TRACK_COPY: {
  key: TrackKey;
  code: string;
  name: string;
  desc: string;
  core: string[];
  advanced: string[];
  sticker: 'stack' | 'loss';
  tone: 'signal' | 'mint';
  drift: number;
}[] = [
  {
    key: 'patterns',
    code: 'PATTERNS',
    name: 'DSA for software-engineer roles',
    desc: 'The recurring shapes behind interview problems — arrays and two pointers through dynamic programming, then trees and graphs.',
    core: ['Arrays', 'Binary search', 'Recursion', 'Sliding window', 'Stacks & queues', 'DP'],
    advanced: ['Trees', 'Tries', 'Graphs', 'Backtracking'],
    sticker: 'stack',
    tone: 'signal',
    drift: 12,
  },
  {
    key: 'gradient',
    code: 'GRADIENT',
    name: 'Machine learning for engineers',
    desc: 'From the maths you actually need to a model you can deploy — regression and trees first, then neural networks and shipping.',
    core: ['Python & pandas', 'Regression', 'Classification', 'Trees & ensembles', 'Feature work'],
    advanced: ['Neural nets', 'PyTorch', 'NLP', 'MLOps', 'Capstones'],
    sticker: 'loss',
    tone: 'mint',
    drift: -12,
  },
];

const GETS = [
  {
    title: 'One ordered path',
    text: 'Not a library to get lost in. Each section assumes the one before it, so you always know what comes next.',
    icon: <IconPath />,
  },
  {
    title: 'A mentor, on the paid plans',
    text: 'The part self-study cannot give you: someone who reads your approach and tells you what an interviewer would think.',
    icon: <IconChat />,
  },
  {
    title: 'Timed mock rounds',
    text: 'Real practice interviews with written feedback, run by people who take these rounds for a living.',
    icon: <IconStopwatch />,
  },
  {
    title: 'Advanced modules that unlock',
    text: 'Trees, graphs, deep learning and MLOps sit behind the Complete tier — and the lock is enforced by the server, not the page.',
    icon: <IconLock />,
  },
  {
    title: 'Progress that persists',
    text: 'Resume exactly where you stopped, with completion tracked per lesson and a streak that notices when you show up.',
    icon: <IconTrend />,
  },
  {
    title: '365 days of access',
    text: 'One payment. A full year on the track, long enough for a placement season and the one after it.',
    icon: <IconCalendar />,
  },
];

const FAQ = [
  {
    q: 'Are there video lessons?',
    a: 'Not yet — and we would rather tell you here than after you pay. Every lesson is written, ordered and available today; video is being produced now. If you buy at launch, you get every video free as it lands, at the price you paid.',
  },
  {
    q: 'What is the difference between Self-Paced and Mentored?',
    a: 'Two things. Mentored unlocks the advanced sections — Trees, Tries, Graphs and Backtracking on PATTERNS; deep learning, NLP, MLOps and the capstones on GRADIENT. And it adds the human part: a month of mentor support, two timed mock interviews with written feedback, and a resume and LinkedIn review.',
  },
  {
    q: 'Why is Placement by application?',
    a: 'Because it is delivered by people, not software. Mock rounds with working engineers and job-application support take real mentor hours, so we only take as many people as we can genuinely support. You apply, we talk, and we tell you honestly whether it is worth it for you.',
  },
  {
    q: 'Can I start on Self-Paced and upgrade later?',
    a: 'Yes. Buying the Complete tier at any point unlocks the advanced sections on your existing enrollment and keeps all your progress.',
  },
  {
    q: 'How long do I keep access?',
    a: '365 days from purchase, on one payment. There is no subscription and no renewal charge.',
  },
  {
    q: 'Is this for beginners?',
    a: 'PATTERNS assumes you can already write code in one language and starts from the fundamentals of data structures. GRADIENT starts from the maths and Python you need, so you do not need prior ML — but you do need to be comfortable programming.',
  },
];

/* ---------------- icons ---------------- */

function IconArrow() {
  return (
    <svg className={styles.arrow} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
function IconSpark() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3v6M12 15v6M3 12h6M15 12h6" />
    </svg>
  );
}
function IconPath() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="6" cy="5.5" r="2.5" /><circle cx="18" cy="12" r="2.5" /><circle cx="6" cy="18.5" r="2.5" />
      <path d="M8.5 5.5h4a3 3 0 0 1 3 3v.5M15.5 14.5v.5a3 3 0 0 1-3 3h-4" />
    </svg>
  );
}
function IconChat() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.5A8 8 0 1 1 21 12Z" />
    </svg>
  );
}
function IconStopwatch() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 2.5h4M12 2.5v2.4" /><circle cx="12" cy="13.5" r="7.5" /><path d="M12 13.5V9.8" />
    </svg>
  );
}
function IconLock() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.2" /><path d="M8.2 10.5V7.8a3.8 3.8 0 0 1 7.6 0v2.7" />
    </svg>
  );
}
function IconTrend() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 15l5-5 4 4 7-8M15 3h6v6" />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.2" /><path d="M3.5 10h17M8 3.2v3.4M16 3.2v3.4" />
    </svg>
  );
}
