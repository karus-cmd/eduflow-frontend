'use client';

import { useMemo } from 'react';
import { Particles, ParticlesProvider, type ParticlesPluginRegistrar } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { ISourceOptions } from '@tsparticles/engine';

const initEngine: ParticlesPluginRegistrar = async (engine) => {
  await loadSlim(engine);
};

// Solid only in the outer margins, fading to nothing well before the middle band where the
// max-w-6xl content column sits — a CSS mask rather than per-particle DOM collision, same
// reasoning as the z-index/background layering below: no canvas library can see where your
// text is, but it doesn't need to if it's simply never drawn there in the first place.
// Deliberately conservative: solid only in the outer 15%, fully hidden across the middle 60% —
// a screenshot showed a link line reaching the edge of a content card, so this trades a narrower
// visible strip for a wide, unambiguous safety margin instead of a boundary tuned to the edge.
const SIDE_MASK =
  'linear-gradient(to right, black 0%, black 15%, transparent 24%, transparent 76%, black 85%, black 100%)';

/**
 * An ambient particle field confined to the page's side margins, scrolling with the page rather
 * than pinned to the viewport (`absolute`, not `fixed` — it's sized to and positioned within
 * AppShell's own `relative` wrapper, which grows to the page's full content height, so it covers
 * the whole scroll range and moves with everything else as you scroll). Real DOM-collision-based
 * "become translucent when touching text" isn't something a canvas particle library can do (it
 * has no awareness of DOM element boxes) — so this gets the same practical result two simpler,
 * more robust ways: a CSS mask keeps particles out of the middle content column entirely (see
 * SIDE_MASK above), and the canvas itself sits behind every card/header/footer on the page, all
 * of which have solid (opaque) backgrounds — so even a particle that strayed into that band would
 * be fully covered by real content, from ordinary DOM stacking.
 */
export function ParticlesBackground() {
  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: { color: { value: 'transparent' } },
      fpsLimit: 60,
      detectRetina: true,
      particles: {
        number: { value: 50, density: { enable: true, width: 1440, height: 900 } },
        color: { value: '#1D4ED8' }, // the app's real Chrome Machine accent
        opacity: { value: 1 },
        size: { value: 4 },
        links: { enable: true, distance: 90, color: '#1D4ED8', opacity: 0.55, width: 1.5 },
        move: { enable: true, speed: 0.7, outModes: { default: 'out' } },
      },
    }),
    [],
  );

  return (
    <ParticlesProvider init={initEngine}>
      <Particles
        id="tsparticles-bg"
        options={options}
        className="pointer-events-none absolute inset-0 z-0"
        style={{ maskImage: SIDE_MASK, WebkitMaskImage: SIDE_MASK }}
      />
    </ParticlesProvider>
  );
}
