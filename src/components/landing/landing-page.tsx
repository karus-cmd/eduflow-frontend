'use client';

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import Link from 'next/link';
import styles from './landing.module.css';
import { Reveal } from './reveal';
import { HeroStage } from './hero-stage';
import { FlowPipeline } from './flow-pipeline';
import { CountUp } from './count-up';

export function LandingPage() {
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={styles.landing}>
      {/* ambient background */}
      <div className={styles.bg} aria-hidden>
        <div className={styles.aurora} />
        <div className={styles.grid} />
        <div className={styles.grain} />
        <div className={styles.vignette} />
      </div>

      {/* nav */}
      <nav className={styles.nav} {...(stuck ? { 'data-stuck': '' } : {})}>
        <span className={styles.wordmark}>
          <span className={styles.spark} /> EduFlow
        </span>
        <Link href="/login" className={`${styles.btn} ${styles.btnGhost}`}>
          Sign in
        </Link>
      </nav>

      {/* hero */}
      <header className={styles.shell}>
        <div className={styles.hero}>
          <Reveal className={styles.stagger}>
            <span className={`${styles.eyebrow} ${styles.stagItem}`} style={cssVar(0)}>
              <span className={styles.eyebrowDot} /> Enrollment CRM · LMS · Commission engine
            </span>
            <h1 className={`${styles.display} ${styles.stagItem}`} style={cssVar(1)}>
              Every enrollment,
              <br />
              in one continuous <span className={styles.gradientText}>flow</span>.
            </h1>
            <p className={`${styles.lede} ${styles.stagItem}`} style={cssVar(2)}>
              EduFlow unifies your admissions pipeline, learning platform, and commission ledger — so a lead
              becomes a student, a student becomes revenue, and nothing slips between the two.
            </p>
            <div className={`${styles.heroCtas} ${styles.stagItem}`} style={cssVar(3)}>
              <Link href="/login" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLg}`}>
                Sign in <Arrow />
              </Link>
              <a href="#flow" className={`${styles.btn} ${styles.btnGhost} ${styles.btnLg}`}>
                See how it flows
              </a>
            </div>
            <div className={`${styles.heroMeta} ${styles.stagItem}`} style={cssVar(4)}>
              <Meta num="4 roles" lbl="one platform, one login" />
              <Meta num="Paise-precise" lbl="ledger — never a float" />
              <Meta num="Self-hosted" lbl="adaptive video streaming" />
            </div>
          </Reveal>

          <HeroStage />
        </div>
      </header>

      {/* the flow */}
      <section id="flow" className={`${styles.shell} ${styles.flow}`}>
        <Reveal className={styles.flowHead}>
          <span className={styles.eyebrow}>
            <span className={styles.eyebrowDot} /> The flow
          </span>
          <h2 className={styles.sectionTitle} style={{ marginTop: 14 }}>
            From first hello to final payout — <br className="hidden sm:inline" />
            one unbroken line.
          </h2>
          <p className={styles.sectionKicker}>
            Most schools stitch this together from four disconnected tools. EduFlow makes it a single motion,
            where each step hands cleanly to the next.
          </p>
        </Reveal>
        <Reveal margin="-40px">
          <FlowPipeline />
        </Reveal>
      </section>

      {/* features */}
      <section className={styles.shell}>
        <Reveal className={styles.features}>
          <Feature
            accent="var(--a-blue)"
            icon={<IconRoute />}
            title="Admissions CRM"
            body="Every conversation captured, every follow-up queued. The pipeline advances itself as your team works."
            items={['Stages that advance on contact', 'Today’s follow-up queue', 'Referral codes tied to payout']}
          />
          <Feature
            accent="var(--a-violet)"
            icon={<IconPlayCircle />}
            title="Learning platform"
            body="Lessons that stream and progress that sticks. Self-hosted adaptive video, live classes, and drip release."
            items={['Adaptive HLS streaming', 'Resume exactly where they left', 'Live classes + resources']}
          />
          <Feature
            accent="var(--a-coral)"
            icon={<IconLedger />}
            title="Commission ledger"
            body="Money that reconciles itself. Paise-precise, webhook-driven, and payable on your schedule."
            items={['Paise-precise — never floats', 'Webhook-provisioned access', 'Manual or verified auto-payout']}
          />
        </Reveal>
      </section>

      {/* proof band */}
      <section className={styles.shell}>
        <Reveal className={styles.proof}>
          <Stat num={<CountUp value={5} />} lbl="stages from hello to payout" />
          <Stat num={<CountUp value={4} />} lbl="roles served end to end" />
          <Stat num={<><CountUp value={100} /><span className={styles.statSuffix}>%</span></>} lbl="revenue via the webhook" />
          <Stat num={<CountUp value={3} />} lbl="products, one platform" />
        </Reveal>
      </section>

      {/* roles */}
      <section className={`${styles.shell} ${styles.roles}`}>
        <Reveal>
          <span className={styles.eyebrow}>
            <span className={styles.eyebrowDot} /> Built for everyone in the building
          </span>
          <h2 className={styles.sectionTitle} style={{ marginTop: 14 }}>
            One platform. Four homes.
          </h2>
        </Reveal>
        <Reveal className={styles.roleGrid} margin="-40px">
          <Role accent="var(--a-blue)" tag="Student" name="Learn without friction" desc="Browse, enroll, and pick up any course exactly where you left — video, live classes, and a clear path through." />
          <Role accent="var(--a-violet)" tag="Counselor" name="A pipeline that works with you" desc="Log a call and the stage moves itself. Watch commission accrue in real time as your students enroll." />
          <Role accent="var(--a-coral)" tag="Admin" name="Author and orchestrate" desc="Build courses, onboard managers, publish content, and run the whole studio from one console." />
          <Role accent="var(--a-blue)" tag="Finance" name="Books that always tie out" desc="A paise-precise ledger, a payout queue by threshold, and reporting you can trust to the rupee." />
        </Reveal>
      </section>

      {/* final CTA */}
      <section className={styles.shell}>
        <Reveal className={styles.cta}>
          <h2 className={styles.ctaTitle}>Start the flow.</h2>
          <p className={styles.ctaSub}>
            Sign in and land straight in your role’s home. The whole platform is already live — pick up
            wherever the work is.
          </p>
          <div className={styles.ctaBtns}>
            <Link href="/login" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLg}`}>
              Sign in <Arrow />
            </Link>
          </div>
        </Reveal>
      </section>

      <footer className={styles.footer}>
        <span className={styles.wordmark} style={{ fontSize: 15 }}>
          <span className={styles.spark} /> EduFlow
        </span>
        <span>Enrollment CRM · LMS · Commission engine</span>
      </footer>
    </div>
  );
}

/* ---- small building blocks ---- */

function cssVar(i: number) {
  return { ['--_i' as string]: i } as CSSProperties;
}

function Meta({ num, lbl }: { num: string; lbl: string }) {
  return (
    <div className={styles.heroMetaItem}>
      <span className={styles.heroMetaNum}>{num}</span>
      <span className={styles.heroMetaLbl}>{lbl}</span>
    </div>
  );
}

function Feature({
  accent,
  icon,
  title,
  body,
  items,
}: {
  accent: string;
  icon: ReactNode;
  title: string;
  body: string;
  items: string[];
}) {
  return (
    <div className={styles.card} style={{ ['--_accent' as string]: accent } as CSSProperties}>
      <div className={styles.cardIcon}>{icon}</div>
      <h3 className={styles.cardTitle}>{title}</h3>
      <p className={styles.cardBody}>{body}</p>
      <div className={styles.cardList}>
        {items.map((it) => (
          <span key={it} className={styles.cardListItem}>
            <Tick /> {it}
          </span>
        ))}
      </div>
    </div>
  );
}

function Stat({ num, lbl }: { num: ReactNode; lbl: string }) {
  return (
    <div className={styles.stat}>
      <div className={styles.statNum}>{num}</div>
      <div className={styles.statLbl}>{lbl}</div>
    </div>
  );
}

function Role({ accent, tag, name, desc }: { accent: string; tag: string; name: string; desc: string }) {
  return (
    <div className={styles.role} style={{ ['--_accent' as string]: accent } as CSSProperties}>
      <span className={styles.roleTag}>{tag}</span>
      <div className={styles.roleName}>{name}</div>
      <div className={styles.roleDesc}>{desc}</div>
    </div>
  );
}

/* ---- icons ---- */
function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
function Tick() {
  return (
    <svg className={styles.tick} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m4 12 5 5L20 6" />
    </svg>
  );
}
function IconRoute() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="19" r="2.5" /><circle cx="18" cy="5" r="2.5" /><path d="M8.5 19H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5" />
    </svg>
  );
}
function IconPlayCircle() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><path d="M10 8.5 16 12l-6 3.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconLedger() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}
