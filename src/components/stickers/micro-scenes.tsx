import { MicroField, type MicroMark } from './micro-field';

/**
 * The three student surfaces, composed.
 *
 * Each is a scene, not a scatter. The set of instruments, where they sit, how big they are, which
 * ones carry colour and which sink into the page — all of it is chosen against what that page is
 * FOR. Keeping the three side by side in one file makes an accidental resemblance between them
 * obvious while it is still cheap to fix.
 *
 * WHERE THEY GO. The shell centres content in a 1152px column, so on a desktop viewport there is
 * roughly 200px of dead gutter down each side, and every one of these pages ends well short of the
 * fold. That empty ground is what the student was actually looking at, and it is where the scene
 * belongs — not pinned to the very edge, which just reads as a border. Each page declares its own
 * usable bands, because the clear ground differs: the catalogue grid fills the whole column, while
 * the profile card is half its width and leaves the right side wide open.
 *
 * HOW STRONG. The sign-in scene runs its marks at full opacity, and that is the presence the
 * student is being asked to recognise here. A faint wash on --ink-faint vanishes on the dark
 * ground. These sit high enough to read as drawn line art, with `depth` pulling individual marks
 * back so the field still has a front and a back.
 *
 * Mint is spent on exactly one mark per page. The rest alternate blue signal and neutral ink.
 */

/**
 * MY LEARNING — a mechanism running.
 *
 * A diagonal, top-left to bottom-right: gears at the head (the work), the hourglass through the
 * middle (what it costs), bars at the foot (what accumulates), and the constellation held high on
 * the right, out of reach, which is the point of the page. The hub fills the full column, so this
 * one keeps to the gutters and to the open ground past the last section.
 */
const ORRERY: MicroMark[] = [
  { name: 'gearPair', top: '2%', left: '2%', size: 46, tone: 'ink', depth: 0.9, rot: 3 },
  { name: 'gearPair', top: '9%', left: '9%', size: 22, tone: 'signal', depth: 1, rot: -4 },
  { name: 'constellation', top: '4%', right: '3%', size: 44, tone: 'signal', depth: 0.95 },
  { name: 'orbit', top: '12%', right: '9%', size: 26, tone: 'ink', depth: 0.7 },
  { name: 'sprig', top: '19%', left: '5%', size: 20, tone: 'mint', depth: 1.1 },
  { name: 'hourglass', top: '25%', right: '2%', size: 38, tone: 'ink', depth: 0.85 },
  { name: 'barsMini', top: '34%', left: '1%', size: 34, tone: 'ink', depth: 0.8 },
  { name: 'orbit', top: '41%', right: '6%', size: 18, tone: 'signal', depth: 0.9 },
  { name: 'constellation', top: '48%', left: '8%', size: 24, tone: 'ink', depth: 0.65 },
  { name: 'hourglass', top: '56%', right: '10%', size: 16, tone: 'ink', depth: 0.95 },
  { name: 'gearPair', top: '62%', right: '1%', size: 30, tone: 'signal', depth: 0.7, rot: 4 },
  { name: 'barsMini', top: '70%', left: '6%', size: 26, tone: 'signal', depth: 0.6 },
  { name: 'orbit', top: '78%', left: '1%', size: 40, tone: 'ink', depth: 0.55 },
  { name: 'sprig', top: '85%', right: '5%', size: 22, tone: 'ink', depth: 0.75 },
  { name: 'constellation', top: '92%', left: '11%', size: 18, tone: 'ink', depth: 0.7 },
  { name: 'hourglass', top: '96%', right: '13%', size: 28, tone: 'ink', depth: 0.5 },
];

/**
 * BROWSE — a specimen board.
 *
 * Deliberately the least orderly of the three: mixed sizes at slightly wrong intervals, because
 * browsing is rummaging. The catalogue grid takes the whole column, so this scene lives entirely
 * in the two gutters — which is also why it is the densest, with two narrow strips to fill rather
 * than an open field. The calipers appear twice at very different scales: one tool measuring two
 * different things.
 */
const FIELDGUIDE: MicroMark[] = [
  { name: 'magnifier', top: '2%', right: '3%', size: 42, tone: 'signal', depth: 1 },
  { name: 'tagPin', top: '5%', left: '2%', size: 34, tone: 'ink', depth: 0.85 },
  { name: 'calipers', top: '12%', left: '9%', size: 17, tone: 'ink', depth: 1 },
  { name: 'cardStack', top: '15%', right: '9%', size: 24, tone: 'ink', depth: 0.7 },
  { name: 'compassRose', top: '22%', left: '1%', size: 40, tone: 'signal', depth: 0.8 },
  { name: 'mapPin', top: '28%', right: '2%', size: 28, tone: 'mint', depth: 0.9 },
  { name: 'tagPin', top: '35%', left: '7%', size: 18, tone: 'signal', depth: 0.95 },
  { name: 'magnifier', top: '42%', right: '7%', size: 17, tone: 'ink', depth: 1 },
  { name: 'cardStack', top: '48%', left: '2%', size: 38, tone: 'signal', depth: 0.6 },
  { name: 'compassRose', top: '55%', right: '11%', size: 21, tone: 'ink', depth: 0.85 },
  { name: 'calipers', top: '62%', right: '1%', size: 44, tone: 'ink', depth: 0.55 },
  { name: 'mapPin', top: '69%', left: '10%', size: 15, tone: 'ink', depth: 1 },
  { name: 'tagPin', top: '76%', right: '4%', size: 26, tone: 'ink', depth: 0.75 },
  { name: 'magnifier', top: '83%', left: '3%', size: 30, tone: 'signal', depth: 0.7 },
  { name: 'cardStack', top: '90%', right: '8%', size: 17, tone: 'ink', depth: 0.9 },
  { name: 'compassRose', top: '96%', left: '8%', size: 32, tone: 'ink', depth: 0.6 },
];

/**
 * PROFILE — an instrument rack.
 *
 * The orderly one, at regular intervals, because this page is about control and a jumbled backdrop
 * would contradict it. It also gets the most room: the settings card is half-column and stops
 * short, so the whole right-of-centre area and everything below the card are open, and the rack
 * extends into them rather than clinging to the frame. The `tick` character underneath holds each
 * mark dead still and then snaps it — an instrument taking a reading.
 */
const WORKBENCH: MicroMark[] = [
  { name: 'lockDial', top: '3%', right: '4%', size: 38, tone: 'signal', depth: 0.95, rot: 4 },
  { name: 'keyTiny', top: '9%', left: '2%', size: 30, tone: 'ink', depth: 0.85 },
  { name: 'fingerprint', top: '16%', right: '14%', size: 24, tone: 'signal', depth: 0.8 },
  { name: 'toggleSw', top: '22%', left: '8%', size: 18, tone: 'ink', depth: 1 },
  { name: 'badgeStar', top: '30%', right: '24%', size: 34, tone: 'mint', depth: 0.75 },
  { name: 'shieldCheck', top: '38%', left: '1%', size: 26, tone: 'ink', depth: 0.9 },
  { name: 'lockDial', top: '44%', right: '6%', size: 17, tone: 'warning', depth: 0.95, rot: -5 },
  { name: 'keyTiny', top: '52%', left: '9%', size: 21, tone: 'ink', depth: 0.7 },
  { name: 'toggleSw', top: '58%', right: '17%', size: 28, tone: 'signal', depth: 0.8 },
  // Below the card the page is completely open, so the rack widens out across it instead of
  // staying in two narrow strips. Nothing down here can ever sit on top of content.
  { name: 'fingerprint', top: '68%', left: '22%', size: 36, tone: 'ink', depth: 0.65 },
  { name: 'shieldCheck', top: '74%', right: '30%', size: 20, tone: 'signal', depth: 0.85 },
  { name: 'keyTiny', top: '80%', left: '3%', size: 32, tone: 'ink', depth: 0.6 },
  { name: 'lockDial', top: '84%', right: '9%', size: 26, tone: 'ink', depth: 0.75 },
  { name: 'badgeStar', top: '90%', left: '38%', size: 22, tone: 'ink', depth: 0.7 },
  { name: 'toggleSw', top: '94%', right: '40%', size: 16, tone: 'ink', depth: 0.9 },
  { name: 'fingerprint', top: '96%', left: '13%', size: 42, tone: 'ink', depth: 0.5 },
];

export function OrreryField() {
  return <MicroField marks={ORRERY} motion="orbit" intensity={0.62} />;
}

export function FieldGuideField() {
  // The quietest of the three on purpose: it is the only one competing with a wall of cards.
  return <MicroField marks={FIELDGUIDE} motion="bob" intensity={0.54} />;
}

export function WorkbenchField() {
  // The loudest: this page has the least content, so the backdrop carries more of it, and `tick`
  // leaves the marks at rest most of the time anyway.
  return <MicroField marks={WORKBENCH} motion="tick" intensity={0.66} />;
}
