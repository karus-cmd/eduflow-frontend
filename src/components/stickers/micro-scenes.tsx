import { MicroField, type MicroMark } from './micro-field';
import { BoardStructure, OrreryStructure, RackStructure } from './page-structure';

/**
 * The three student surfaces, composed.
 *
 * Each is a scene, not a scatter. Keeping the three side by side in one file makes an accidental
 * resemblance between them obvious while it is still cheap to fix.
 *
 * WHAT CHANGED, AND WHY. The first pass put sixteen marks of one size class at one opacity down
 * the two gutters, and it read as confetti — sixteen things scattered on a page, with nothing
 * saying they belonged together. Four things fix that, and all four are here:
 *
 *   1. STRUCTURE. Each scene now sits on an apparatus (page-structure.tsx) — orbital rings, a
 *      specimen board, an instrument rack. The marks stop being loose because they are ON
 *      something.
 *   2. FOUR SIZE TIERS instead of one. Large 30–48 in the voids, small 20–30, micro 13–20, and a
 *      nano tier at 7–12 that acts as punctuation. A single size class always reads as a texture.
 *   3. TEN NAMES PER SET instead of six, so no mark appears more than about twice.
 *   4. TWO MOTION CHARACTERS PER PAGE. The dissenters matter: when everything moves alike the eye
 *      reads one animated surface, and when a few move differently it reads as a population.
 *
 * WHERE THEY GO. The shell centres content in a 1152px column, leaving ~200px of gutter each side
 * on a desktop viewport, and every one of these pages ends short of the fold. Marks live in those
 * gutters AND in the open ground below the content — and a few sit under the content column on
 * purpose. Cards are opaque, so those are occluded until a gap exposes them, and occlusion is the
 * cheapest real depth there is.
 *
 * Mint is spent on exactly one idea per page. The rest alternate blue signal and neutral ink, with
 * `depth` pulling individual marks back so the field has a front and a back.
 */

/**
 * MY LEARNING — a mechanism running.
 *
 * Time, measurement and accumulation: gears and ratchets that only turn one way, hourglasses and
 * pendulums keeping time, spirals that get further out every turn, and the constellation held high
 * and out of reach, which is the point of the page. The hanging things — sprig, pendulum — sway
 * instead of orbiting, because a plumb line does not orbit.
 */
const ORRERY: MicroMark[] = [
  // large, in the corners and voids
  { name: 'gearPair', top: '2%', left: '2%', size: 46, tone: 'ink', depth: 0.9, rot: 3 },
  { name: 'sextant', top: '3%', right: '3%', size: 40, tone: 'signal', depth: 0.95 },
  { name: 'spiral', top: '33%', right: '5%', size: 42, tone: 'ink', depth: 0.7 },
  { name: 'ratchet', top: '81%', right: '1%', size: 40, tone: 'ink', depth: 0.55 },
  { name: 'constellation', top: '11%', right: '11%', size: 36, tone: 'signal', depth: 0.8 },
  // small
  { name: 'hourglass', top: '27%', left: '1%', size: 34, tone: 'ink', depth: 0.82 },
  { name: 'barsMini', top: '46%', left: '1%', size: 32, tone: 'ink', depth: 0.75 },
  { name: 'gearPair', top: '58%', right: '2%', size: 30, tone: 'signal', depth: 0.7, rot: 4 },
  { name: 'pendulum', top: '20%', right: '1%', size: 30, tone: 'ink', depth: 0.85, motion: 'sway', rot: 4 },
  { name: 'orbit', top: '88%', left: '4%', size: 28, tone: 'ink', depth: 0.6 },
  { name: 'sprig', top: '95%', left: '12%', size: 26, tone: 'mint', depth: 0.7, motion: 'sway', rot: 3 },
  { name: 'ratchet', top: '38%', left: '8%', size: 26, tone: 'signal', depth: 0.8 },
  // micro
  { name: 'gearPair', top: '8%', left: '9%', size: 22, tone: 'signal', depth: 1, rot: -4 },
  { name: 'spiral', top: '70%', left: '10%', size: 24, tone: 'ink', depth: 0.6 },
  { name: 'sprig', top: '17%', left: '5%', size: 20, tone: 'mint', depth: 1.1, motion: 'sway', rot: 5 },
  { name: 'sextant', top: '52%', right: '12%', size: 20, tone: 'ink', depth: 0.65 },
  { name: 'orbit', top: '44%', right: '4%', size: 18, tone: 'signal', depth: 0.9 },
  { name: 'pendulum', top: '62%', left: '6%', size: 18, tone: 'ink', depth: 0.9, motion: 'sway', rot: 6 },
  { name: 'hourglass', top: '78%', left: '2%', size: 16, tone: 'ink', depth: 0.85 },
  { name: 'barsMini', top: '92%', right: '14%', size: 22, tone: 'signal', depth: 0.6 },
  // under the content column — occluded by the cards, exposed in the gaps below them
  { name: 'spiral', top: '86%', left: '44%', size: 34, tone: 'ink', depth: 0.4 },
  { name: 'constellation', top: '93%', right: '36%', size: 26, tone: 'ink', depth: 0.38 },
  { name: 'sextant', top: '97%', left: '28%', size: 22, tone: 'ink', depth: 0.34 },
  // nano — punctuation
  { name: 'nanoNode', top: '6%', left: '16%', size: 11, tone: 'signal', depth: 0.7, motion: 'pulse' },
  { name: 'nanoRing', top: '14%', right: '17%', size: 10, tone: 'ink', depth: 0.6 },
  { name: 'nanoCross', top: '23%', left: '13%', size: 9, tone: 'ink', depth: 0.55 },
  { name: 'nanoArc', top: '31%', left: '4%', size: 12, tone: 'ink', depth: 0.5 },
  { name: 'nanoBar', top: '36%', right: '15%', size: 10, tone: 'signal', depth: 0.6 },
  { name: 'nanoChevron', top: '43%', left: '11%', size: 9, tone: 'ink', depth: 0.5 },
  { name: 'nanoNode', top: '50%', right: '2%', size: 12, tone: 'mint', depth: 0.55, motion: 'pulse' },
  { name: 'nanoRing', top: '57%', left: '3%', size: 8, tone: 'ink', depth: 0.6 },
  { name: 'nanoCross', top: '65%', right: '9%', size: 11, tone: 'ink', depth: 0.45 },
  { name: 'nanoBar', top: '73%', right: '3%', size: 9, tone: 'ink', depth: 0.55 },
  { name: 'nanoArc', top: '76%', left: '13%', size: 10, tone: 'signal', depth: 0.5 },
  { name: 'nanoChevron', top: '84%', right: '11%', size: 8, tone: 'ink', depth: 0.5 },
  { name: 'nanoNode', top: '90%', left: '17%', size: 10, tone: 'ink', depth: 0.42, motion: 'pulse' },
  { name: 'nanoRing', top: '98%', right: '6%', size: 12, tone: 'ink', depth: 0.4 },
];

/**
 * BROWSE — a specimen board.
 *
 * The least orderly of the three, because browsing is rummaging: mixed sizes at slightly wrong
 * intervals, pinned rather than placed. Tags and leaves hang from their pins and sway; lenses and
 * reticles hold still and breathe. The calipers appear twice at very different scales — one tool
 * measuring two different things.
 */
const FIELDGUIDE: MicroMark[] = [
  // large
  { name: 'magnifier', top: '2%', right: '3%', size: 44, tone: 'signal', depth: 1 },
  { name: 'compassRose', top: '21%', left: '1%', size: 42, tone: 'signal', depth: 0.8 },
  { name: 'calipers', top: '61%', right: '1%', size: 44, tone: 'ink', depth: 0.55 },
  { name: 'pressedLeaf', top: '44%', left: '2%', size: 40, tone: 'ink', depth: 0.6 },
  { name: 'crosshair', top: '78%', right: '4%', size: 38, tone: 'ink', depth: 0.5 },
  // small
  { name: 'tagPin', top: '5%', left: '2%', size: 32, tone: 'ink', depth: 0.85, motion: 'sway', rot: 5 },
  { name: 'scaleBalance', top: '13%', right: '10%', size: 30, tone: 'ink', depth: 0.7 },
  { name: 'swatchFan', top: '33%', right: '2%', size: 30, tone: 'mint', depth: 0.9 },
  { name: 'cardStack', top: '53%', left: '9%', size: 26, tone: 'signal', depth: 0.75 },
  { name: 'mapPin', top: '69%', left: '2%', size: 28, tone: 'ink', depth: 0.7 },
  { name: 'compassRose', top: '90%', left: '7%', size: 30, tone: 'ink', depth: 0.55 },
  { name: 'pressedLeaf', top: '96%', right: '8%', size: 26, tone: 'ink', depth: 0.5 },
  // micro
  { name: 'calipers', top: '11%', left: '9%', size: 17, tone: 'ink', depth: 1 },
  { name: 'cardStack', top: '16%', right: '17%', size: 20, tone: 'ink', depth: 0.7 },
  { name: 'tagPin', top: '35%', left: '8%', size: 18, tone: 'signal', depth: 0.95, motion: 'sway', rot: 7 },
  { name: 'magnifier', top: '42%', right: '7%', size: 17, tone: 'ink', depth: 1 },
  { name: 'crosshair', top: '55%', right: '13%', size: 19, tone: 'signal', depth: 0.8 },
  { name: 'swatchFan', top: '73%', left: '11%', size: 16, tone: 'ink', depth: 0.85, motion: 'sway', rot: 6 },
  { name: 'mapPin', top: '85%', right: '2%', size: 15, tone: 'ink', depth: 0.9 },
  { name: 'scaleBalance', top: '99%', left: '3%', size: 22, tone: 'ink', depth: 0.5 },
  // under the column
  { name: 'pressedLeaf', top: '88%', left: '41%', size: 32, tone: 'ink', depth: 0.36 },
  { name: 'crosshair', top: '94%', right: '30%', size: 24, tone: 'ink', depth: 0.34 },
  // nano
  { name: 'nanoCross', top: '8%', right: '15%', size: 9, tone: 'ink', depth: 0.55 },
  { name: 'nanoRing', top: '18%', left: '13%', size: 11, tone: 'signal', depth: 0.6, motion: 'pulse' },
  { name: 'nanoBar', top: '27%', right: '7%', size: 10, tone: 'ink', depth: 0.5 },
  { name: 'nanoChevron', top: '30%', left: '11%', size: 8, tone: 'ink', depth: 0.55 },
  { name: 'nanoNode', top: '38%', right: '15%', size: 12, tone: 'mint', depth: 0.5, motion: 'pulse' },
  { name: 'nanoArc', top: '48%', left: '14%', size: 10, tone: 'ink', depth: 0.5 },
  { name: 'nanoCross', top: '58%', left: '3%', size: 8, tone: 'ink', depth: 0.6 },
  { name: 'nanoRing', top: '64%', right: '9%', size: 10, tone: 'ink', depth: 0.45 },
  { name: 'nanoBar', top: '76%', right: '16%', size: 9, tone: 'signal', depth: 0.55 },
  { name: 'nanoArc', top: '81%', left: '5%', size: 12, tone: 'ink', depth: 0.42 },
  { name: 'nanoChevron', top: '92%', right: '13%', size: 9, tone: 'ink', depth: 0.5 },
  { name: 'nanoNode', top: '98%', left: '16%', size: 10, tone: 'ink', depth: 0.4, motion: 'pulse' },
];

/**
 * PROFILE — an instrument rack.
 *
 * The orderly one, at regular intervals, because this page is about control and a jumbled backdrop
 * would say the opposite. It also gets the most room: the settings card is half-column and stops
 * short, so the whole right-of-centre area and everything below the card are open, and the rack
 * extends into them rather than clinging to the frame. `tick` holds each mark dead still and then
 * snaps it — an instrument taking a reading — while the gauges breathe instead, because a needle
 * that never moves at all is a broken gauge.
 */
const WORKBENCH: MicroMark[] = [
  // large
  { name: 'lockDial', top: '3%', right: '4%', size: 40, tone: 'signal', depth: 0.95, rot: 4 },
  { name: 'sealRibbon', top: '29%', right: '23%', size: 40, tone: 'mint', depth: 0.75 },
  { name: 'fingerprint', top: '66%', left: '20%', size: 42, tone: 'ink', depth: 0.5 },
  { name: 'dialGauge', top: '46%', left: '1%', size: 38, tone: 'ink', depth: 0.7, motion: 'pulse' },
  { name: 'plugJack', top: '85%', right: '6%', size: 38, tone: 'ink', depth: 0.55 },
  // small
  { name: 'keyTiny', top: '9%', left: '2%', size: 30, tone: 'ink', depth: 0.85 },
  { name: 'slider', top: '19%', right: '13%', size: 30, tone: 'signal', depth: 0.8 },
  { name: 'shieldCheck', top: '37%', left: '9%', size: 26, tone: 'ink', depth: 0.9 },
  { name: 'toggleSw', top: '57%', right: '16%', size: 28, tone: 'signal', depth: 0.8 },
  { name: 'badgeStar', top: '74%', left: '3%', size: 30, tone: 'ink', depth: 0.6 },
  { name: 'dialGauge', top: '93%', left: '11%', size: 28, tone: 'ink', depth: 0.55, motion: 'pulse' },
  { name: 'sealRibbon', top: '98%', right: '15%', size: 26, tone: 'ink', depth: 0.5 },
  // micro
  { name: 'toggleSw', top: '22%', left: '8%', size: 18, tone: 'ink', depth: 1 },
  { name: 'lockDial', top: '43%', right: '6%', size: 17, tone: 'warning', depth: 0.95, rot: -5 },
  { name: 'keyTiny', top: '52%', left: '10%', size: 20, tone: 'ink', depth: 0.7 },
  { name: 'plugJack', top: '61%', left: '2%', size: 19, tone: 'ink', depth: 0.75 },
  { name: 'slider', top: '70%', right: '2%', size: 20, tone: 'ink', depth: 0.7 },
  { name: 'shieldCheck', top: '80%', right: '17%', size: 18, tone: 'signal', depth: 0.85 },
  { name: 'fingerprint', top: '88%', left: '8%', size: 16, tone: 'ink', depth: 0.8 },
  { name: 'badgeStar', top: '13%', right: '30%', size: 17, tone: 'ink', depth: 0.6 },
  // under the column
  { name: 'dialGauge', top: '77%', right: '38%', size: 32, tone: 'ink', depth: 0.36, motion: 'pulse' },
  { name: 'plugJack', top: '95%', left: '40%', size: 24, tone: 'ink', depth: 0.32 },
  // nano
  { name: 'nanoCross', top: '7%', left: '14%', size: 9, tone: 'ink', depth: 0.55 },
  { name: 'nanoRing', top: '15%', right: '2%', size: 11, tone: 'ink', depth: 0.6 },
  { name: 'nanoBar', top: '26%', left: '4%', size: 10, tone: 'signal', depth: 0.6 },
  { name: 'nanoNode', top: '33%', right: '8%', size: 12, tone: 'signal', depth: 0.55, motion: 'pulse' },
  { name: 'nanoChevron', top: '40%', left: '15%', size: 8, tone: 'ink', depth: 0.5 },
  { name: 'nanoArc', top: '49%', right: '11%', size: 11, tone: 'ink', depth: 0.5 },
  { name: 'nanoCross', top: '58%', left: '6%', size: 10, tone: 'ink', depth: 0.5 },
  { name: 'nanoRing', top: '67%', right: '4%', size: 9, tone: 'mint', depth: 0.55 },
  { name: 'nanoBar', top: '75%', left: '14%', size: 10, tone: 'ink', depth: 0.45 },
  { name: 'nanoArc', top: '84%', right: '13%', size: 12, tone: 'ink', depth: 0.42 },
  { name: 'nanoChevron', top: '91%', right: '3%', size: 9, tone: 'ink', depth: 0.5 },
  { name: 'nanoNode', top: '99%', left: '6%', size: 11, tone: 'ink', depth: 0.4, motion: 'pulse' },
];

export function OrreryField() {
  return (
    <>
      <OrreryStructure />
      <MicroField marks={ORRERY} motion="orbit" intensity={0.62} />
    </>
  );
}

export function FieldGuideField() {
  return (
    <>
      <BoardStructure />
      {/* The quietest of the three on purpose: it is the only one competing with a wall of cards. */}
      <MicroField marks={FIELDGUIDE} motion="bob" intensity={0.54} />
    </>
  );
}

export function WorkbenchField() {
  return (
    <>
      <RackStructure />
      {/* The loudest: this page has the least content, so the backdrop carries more of it, and
          `tick` leaves the marks at rest most of the time anyway. */}
      <MicroField marks={WORKBENCH} motion="tick" intensity={0.66} />
    </>
  );
}
