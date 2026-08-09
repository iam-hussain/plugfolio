/* Plugfolio — creator-perspective film. Built on animations-v2 SceneStage. */
const R = window.React;
const { SceneStage, useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakToggle } = window;

/* ---- format / stage dims (module-level so scenes can read current size) ---- */
const FORMATS = {
  '9:16':  { w: 1080, h: 1920 },
  '1:1':   { w: 1080, h: 1080 },
  '16:9':  { w: 1920, h: 1080 },
};
let CUR = FORMATS['9:16'];
function dims() {
  const w = CUR.w, h = CUR.h;
  const S = Math.min(w, h) * 0.94;
  return { w, h, S, u: S / 1000, cx: w / 2, cy: h / 2, left: w / 2 - S / 2, top: h / 2 - S / 2 };
}

/* ---- easing / timing helpers ---- */
const seg = (p, a, b) => Math.max(0, Math.min(1, (p - a) / (b - a)));
const easeOut = x => 1 - Math.pow(1 - x, 3);
const easeInOut = x => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const backOut = x => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
// group in/out: fades content in after progress 0, settles back before 1 (frame-match)
const grpK = p => easeOut(seg(p, 0.0, 0.15)) * (1 - easeInOut(seg(p, 0.9, 1.0)));

const VIOLET = '#7C3AED', DEEP = '#5B21B6', TINT = '#A78BFA', LIME = '#C6FF3D', INK = '#12101C', CORAL = '#FF6B5C', CANVAS = '#F5F4F8';
const SORA = "'Sora',sans-serif", INTER = "'Inter',sans-serif", MONO = "'Space Mono',monospace";

/* ---- the character (PlugMark, alive) ---- */
function PlugChar({ sz, body = VIOLET, prong = LIME, t = 0, hop = true, look = 'center', droop = 0, role = null }) {
  const bt = t * 2.4;
  const bounce = hop ? Math.max(0, Math.sin(bt)) : 0;
  const bob = -bounce * 0.05 * sz;
  const sqY = 1 + (hop ? (Math.cos(bt) < -0.6 ? 0.06 : -0.02 * bounce) : 0);
  const cyc = t % 3.4;
  const blink = cyc > 3.15 ? 0.12 : 1;
  const lx = look === 'left' ? -0.15 : look === 'right' ? 0.15 : 0;
  const eyeW = 0.155 * sz, eyeH = 0.175 * sz;
  const eye = (leftPct) => R.createElement('div', {
    style: {
      position: 'absolute', left: leftPct * sz, top: (0.585 + droop * 0.03) * sz, width: eyeW, height: eyeH,
      borderRadius: '50%', background: INK, transform: `scaleY(${blink})`, transformOrigin: 'center',
      overflow: 'hidden',
    }
  },
    R.createElement('div', { style: { position: 'absolute', top: eyeH * 0.16 + lx * eyeH, left: eyeW * 0.2 + lx * eyeW, width: eyeW * 0.42, height: eyeW * 0.42, borderRadius: '50%', background: '#fff' } }),
    R.createElement('div', { style: { position: 'absolute', bottom: eyeH * 0.16, right: eyeW * 0.18, width: eyeW * 0.2, height: eyeW * 0.2, borderRadius: '50%', background: '#fff', opacity: 0.8 } }),
  );
  // Creator's signature: sunglasses + a little camera
  const lensW = 0.185 * sz, lensH = 0.155 * sz, ly = 0.60 * sz;
  const lens = (lx) => R.createElement('div', { style: { position: 'absolute', left: lx, top: ly, width: lensW, height: lensH, borderRadius: `${0.05 * sz}px ${0.05 * sz}px ${0.08 * sz}px ${0.08 * sz}px`, background: 'linear-gradient(150deg,#26243a,#0a0913)', border: `${Math.max(1.5, 0.018 * sz)}px solid ${INK}`, overflow: 'hidden', boxShadow: `inset 0 0 ${0.04 * sz}px rgba(198,255,61,0.35)` } },
    R.createElement('div', { style: { position: 'absolute', top: 0, left: '18%', width: '26%', height: '150%', background: 'rgba(255,255,255,0.35)', transform: 'rotate(22deg)' } }),
    R.createElement('div', { style: { position: 'absolute', top: 0, left: 0, right: 0, height: '18%', background: LIME, opacity: 0.85 } }),
  );
  const shades = R.createElement('div', { key: 'shades' },
    R.createElement('div', { style: { position: 'absolute', left: 0.3175 * sz, top: ly + lensH * 0.32, width: 0.19 * sz, height: 0.02 * sz, background: INK } }),
    R.createElement('div', { style: { position: 'absolute', left: 0.16 * sz, top: ly + lensH * 0.2, width: 0.16 * sz, height: 0.03 * sz, background: INK, borderRadius: 4, transform: 'rotate(6deg)' } }),
    R.createElement('div', { style: { position: 'absolute', left: 0.68 * sz, top: ly + lensH * 0.2, width: 0.16 * sz, height: 0.03 * sz, background: INK, borderRadius: 4, transform: 'rotate(-6deg)' } }),
    lens(0.3175 * sz), lens(0.5075 * sz),
  );
  const camera = sz > 120 && R.createElement('div', { key: 'cam', style: { position: 'absolute', left: 0.63 * sz, top: 0.46 * sz, width: 0.33 * sz, height: 0.24 * sz, transform: 'rotate(-9deg)' } },
    R.createElement('div', { style: { position: 'absolute', top: -0.05 * sz, left: 0.06 * sz, width: 0.1 * sz, height: 0.06 * sz, background: '#1b1830', borderRadius: `${0.02 * sz}px ${0.02 * sz}px 0 0` } }),
    R.createElement('div', { style: { position: 'absolute', inset: 0, background: 'linear-gradient(160deg,#232038,#12101c)', border: `${Math.max(1.5, 0.014 * sz)}px solid #322c4a`, borderRadius: 0.05 * sz, boxShadow: `0 ${0.03 * sz}px ${0.06 * sz}px rgba(0,0,0,0.4)` } }),
    R.createElement('div', { style: { position: 'absolute', top: 0.03 * sz, left: 0.03 * sz, width: 0.05 * sz, height: 0.05 * sz, borderRadius: 3, background: LIME, opacity: 0.9 } }),
    R.createElement('div', { style: { position: 'absolute', top: 0.055 * sz, left: 0.13 * sz, width: 0.14 * sz, height: 0.14 * sz, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, #6b6790, #0a0913 70%)', border: `${Math.max(1.5, 0.016 * sz)}px solid ${VIOLET}` } },
      R.createElement('div', { style: { position: 'absolute', top: '30%', left: '30%', width: '18%', height: '18%', borderRadius: '50%', background: LIME } }),
    ),
  );
  return R.createElement('div', { style: { width: sz, height: sz, position: 'relative', transform: `translateY(${bob}px) scaleY(${sqY})`, transformOrigin: '50% 100%' } },
    R.createElement('svg', { viewBox: '0 0 100 100', width: sz, height: sz, style: { display: 'block', overflow: 'visible' } },
      R.createElement('g', { strokeLinejoin: 'round' },
        R.createElement('polygon', { points: '33,53 33,27 39.5,15 46,27 46,53', fill: prong, stroke: prong, strokeWidth: 3 }),
        R.createElement('polygon', { points: '54,53 54,27 60.5,15 67,27 67,53', fill: prong, stroke: prong, strokeWidth: 3 }),
        R.createElement('rect', { x: 18, y: 43, width: 64, height: 44, rx: 13, fill: body, stroke: body, strokeWidth: 3 }),
      )
    ),
    role === 'creator' ? [shades, camera] : [eye(0.335), eye(0.525)],
  );
}

/* ---- wordmark lockup ---- */
function Wordmark({ u, k = 1 }) {
  return R.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 14 * u, opacity: k } },
    R.createElement('div', { style: { width: 46 * u, height: 46 * u } }, R.createElement(PlugChar, { sz: 46 * u, body: '#fff', prong: LIME, hop: false })),
    R.createElement('div', { style: { fontFamily: SORA, fontSize: 46 * u, fontWeight: 700, letterSpacing: '-0.045em', color: '#fff', display: 'flex', alignItems: 'flex-end' } },
      'plugfolio',
      R.createElement('span', { style: { width: 10 * u, height: 10 * u, borderRadius: 3 * u, background: LIME, marginLeft: 6 * u, marginBottom: 8 * u } }),
    ),
  );
}

/* ---- shared backdrop (persistent across every scene) ---- */
function Backdrop({ t = 0 }) {
  const { w, h } = dims();
  const gx = 50 + Math.sin(t * 0.5) * 12, gy = 32 + Math.cos(t * 0.4) * 8;
  return R.createElement('div', {
    style: {
      position: 'absolute', inset: 0, width: w, height: h, background: INK,
      backgroundImage: `radial-gradient(${w * 0.5}px ${w * 0.45}px at ${gx}% ${gy}%, rgba(124,58,237,0.42), transparent 70%)`,
    }
  });
}
function SafeBox({ children }) {
  const { S, left, top } = dims();
  return R.createElement('div', { style: { position: 'absolute', left, top, width: S, height: S, overflow: 'visible' } }, children);
}
function Eyebrow({ u, p, text, color = LIME }) {
  const k = easeOut(seg(p, 0.05, 0.22)) * (1 - seg(p, 0.9, 1));
  return R.createElement('div', { style: { position: 'absolute', left: 0, right: 0, top: '9%', textAlign: 'center', fontFamily: MONO, fontSize: 20 * u, letterSpacing: '0.2em', textTransform: 'uppercase', color, opacity: k, transform: `translateY(${(1 - k) * -10 * u}px)` } }, text);
}
function Caption({ u, p, text, color = CANVAS }) {
  const k = easeOut(seg(p, 0.12, 0.3)) * (1 - easeInOut(seg(p, 0.9, 1)));
  return R.createElement('div', { style: { position: 'absolute', left: '6%', right: '6%', bottom: '7%', textAlign: 'center', fontFamily: SORA, fontWeight: 700, fontSize: 50 * u, letterSpacing: '-0.03em', lineHeight: 1.08, color, opacity: k, transform: `translateY(${(1 - k) * 22 * u}px)`, textWrap: 'balance' } }, text);
}

/* ---- product card (brand-accurate, outbound) ---- */
function MiniCard({ u, w = 300, accent = VIOLET, title = 'Product', price = '$—', btn = 'Buy', own = false, coupon = null, hue = 250 }) {
  return R.createElement('div', { style: { width: w, background: '#1C1930', border: '1px solid #2E2946', borderRadius: 22 * u, overflow: 'hidden', boxShadow: `0 ${18 * u}px ${40 * u}px rgba(0,0,0,0.35)` } },
    R.createElement('div', { style: { aspectRatio: '1.5 / 1', width: '100%', background: `linear-gradient(150deg, hsl(${hue} 45% 30%), hsl(${hue} 40% 18%))`, position: 'relative' } },
      own && R.createElement('div', { style: { position: 'absolute', top: 12 * u, left: 12 * u, fontFamily: MONO, fontSize: 13 * u, color: TINT, background: 'rgba(18,16,28,0.7)', padding: `${5 * u}px ${10 * u}px`, borderRadius: 100 } }, 'Their own product'),
    ),
    R.createElement('div', { style: { padding: `${18 * u}px ${18 * u}px ${20 * u}px` } },
      R.createElement('div', { style: { fontFamily: INTER, fontWeight: 600, fontSize: 26 * u, color: CANVAS } }, title),
      R.createElement('div', { style: { fontFamily: INTER, fontWeight: 700, fontSize: 30 * u, color: '#fff', marginTop: 4 * u } }, price),
      coupon && R.createElement('div', { style: { marginTop: 12 * u, display: 'inline-flex', alignItems: 'center', gap: 8 * u, fontFamily: MONO, fontSize: 20 * u, color: INK, background: LIME, padding: `${7 * u}px ${12 * u}px`, borderRadius: 10 * u, fontWeight: 700, letterSpacing: '0.04em' } }, coupon),
      R.createElement('div', { style: { marginTop: 16 * u, height: 56 * u, borderRadius: 14 * u, background: accent, color: own ? '#fff' : '#fff', fontFamily: INTER, fontWeight: 700, fontSize: 24 * u, display: 'flex', alignItems: 'center', justifyContent: 'center' } }, own ? 'Shop their store' : btn),
    ),
  );
}

/* ============================ SCENES ============================ */

function Hunt({ progress: p, localTime: t }) {
  const { u } = dims();
  const K = grpK(p);
  const scroll = -((t * 520) % 620);
  // posts: each is a video thumbnail; one (the jacket) is what the follower wants
  const posts = [
    { hue: 265, label: 'get-ready haul', prod: false },
    { hue: 20, label: 'that jacket 🧥', prod: true },
    { hue: 190, label: 'desk tour', prod: false },
    { hue: 320, label: 'skincare night', prod: false },
    { hue: 45, label: 'coffee run', prod: false },
    { hue: 150, label: 'gym fit check', prod: false },
  ];
  const flick = Math.sin(t * 8) * 6 * u;
  return R.createElement(R.Fragment, null,
    R.createElement(Backdrop, { t }),
    R.createElement(SafeBox, null,
      R.createElement(Eyebrow, { u, p, text: 'The problem today', color: TINT }),
      R.createElement('div', { style: { position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%,-52%) scale(${0.9 + 0.1 * easeOut(seg(p, 0, 0.2))})`, opacity: K } },
        // phone
        R.createElement('div', { style: { width: 480 * u, height: 760 * u, background: '#0C0B14', border: `${10 * u}px solid #201C30`, borderRadius: 54 * u, overflow: 'hidden', position: 'relative', boxShadow: `0 ${30 * u}px ${70 * u}px rgba(0,0,0,0.5)` } },
          R.createElement('div', { style: { position: 'absolute', inset: 0, transform: `translateY(${scroll}px)` } },
            posts.map((post, i) => R.createElement('div', { key: i, style: { height: 600 * u, borderBottom: '1px solid #1C1930', background: `linear-gradient(150deg, hsl(${post.hue} 42% 28%), hsl(${post.hue + 24} 40% 15%))`, position: 'relative' } },
              // video play glyph
              R.createElement('div', { style: { position: 'absolute', left: '50%', top: '42%', transform: 'translate(-50%,-50%)', width: 96 * u, height: 96 * u, borderRadius: '50%', background: 'rgba(0,0,0,0.35)', border: `${3 * u}px solid rgba(255,255,255,0.55)`, display: 'flex', alignItems: 'center', justifyContent: 'center' } },
                R.createElement('div', { style: { width: 0, height: 0, borderTop: `${18 * u}px solid transparent`, borderBottom: `${18 * u}px solid transparent`, borderLeft: `${28 * u}px solid rgba(255,255,255,0.85)`, marginLeft: 8 * u } })),
              // caption chip
              R.createElement('div', { style: { position: 'absolute', left: 28 * u, bottom: 32 * u, fontFamily: MONO, fontSize: 26 * u, color: '#fff', background: 'rgba(0,0,0,0.4)', padding: `${8 * u}px ${16 * u}px`, borderRadius: 10 * u } }, post.label),
              // the wanted product, pinned in the jacket post
              post.prod && R.createElement('div', { style: { position: 'absolute', right: 28 * u, top: 28 * u, width: 150 * u, background: '#F5F4F8', borderRadius: 14 * u, overflow: 'hidden', boxShadow: `0 ${8 * u}px ${20 * u}px rgba(0,0,0,0.45)`, border: `${3 * u}px solid ${LIME}` } },
                R.createElement('div', { style: { height: 96 * u, background: 'linear-gradient(150deg, hsl(20 55% 55%), hsl(14 50% 38%))' } }),
                R.createElement('div', { style: { padding: `${10 * u}px ${12 * u}px` } },
                  R.createElement('div', { style: { fontFamily: INTER, fontWeight: 700, fontSize: 22 * u, color: INK, lineHeight: 1.15 } }, 'Cropped jacket'),
                  R.createElement('div', { style: { fontFamily: INTER, fontWeight: 700, fontSize: 24 * u, color: VIOLET, marginTop: 4 * u } }, '$128'))),
            ))
          ),
          // scrubbing finger
          R.createElement('div', { style: { position: 'absolute', right: 40 * u, top: 380 * u + flick, width: 46 * u, height: 46 * u, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', border: '2px solid rgba(255,255,255,0.5)' } }),
          // ? bubbles
          [0, 1, 2].map(i => {
            const bp = seg(p, 0.3 + i * 0.12, 0.55 + i * 0.12);
            return R.createElement('div', { key: i, style: { position: 'absolute', left: (60 + i * 120) * u, top: (120 - i * 30) * u, width: 64 * u, height: 64 * u, borderRadius: '50%', background: TINT, color: INK, fontFamily: SORA, fontWeight: 800, fontSize: 40 * u, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${backOut(bp)})`, opacity: bp } }, '?')
          }),
        ),
      ),
      // follower peeking, confused — with a role label so it reads clearly
      R.createElement('div', { style: { position: 'absolute', right: '5%', bottom: '19%', width: 150 * u, opacity: K, textAlign: 'center' } },
        R.createElement('div', { style: { display: 'inline-block', fontFamily: MONO, fontSize: 20 * u, letterSpacing: '0.14em', textTransform: 'uppercase', color: INK, background: TINT, padding: `${6 * u}px ${16 * u}px`, borderRadius: 100 * u, marginBottom: 12 * u } }, 'Follower'),
        R.createElement(PlugChar, { sz: 150 * u, body: TINT, prong: LIME, t, hop: false, look: 'left' })
      ),
      R.createElement(Caption, { u, p, text: '“Which video had that jacket again?”' }),
    ),
  );
}

function Gone({ progress: p, localTime: t }) {
  const { u } = dims();
  const K = grpK(p);
  const stamps = ['EXPIRED', 'OUT OF STOCK', 'LINK DEAD'];
  return R.createElement(R.Fragment, null,
    R.createElement(Backdrop, { t }),
    R.createElement(SafeBox, null,
      R.createElement(Eyebrow, { u, p, text: 'And by the time they find it', color: CORAL }),
      R.createElement('div', { style: { position: 'absolute', left: '50%', top: '46%', transform: 'translate(-50%,-50%)', opacity: K } },
        R.createElement('div', { style: { position: 'relative', filter: `grayscale(${seg(p, 0.35, 0.6)})` } },
          R.createElement(MiniCard, { u, w: 440 * u, title: 'The jacket everyone asked about', price: '$128', hue: 20 }),
        ),
        stamps.map((s, i) => {
          const sp = seg(p, 0.3 + i * 0.13, 0.42 + i * 0.13);
          return R.createElement('div', { key: i, style: { position: 'absolute', left: '50%', top: (26 + i * 21) + '%', transform: `translate(-50%,-50%) rotate(${-8 + i * 7}deg) scale(${1 + (1 - backOut(sp)) * 1.4})`, opacity: sp, fontFamily: SORA, fontWeight: 800, fontSize: 50 * u, letterSpacing: '-0.02em', color: '#fff', background: CORAL, padding: `${8 * u}px ${20 * u}px`, borderRadius: 12 * u, whiteSpace: 'nowrap', boxShadow: `0 ${8 * u}px ${20 * u}px rgba(0,0,0,0.4)` } }, s)
        }),
      ),
      R.createElement('div', { style: { position: 'absolute', left: '10%', bottom: '19%', width: 140 * u, opacity: K } },
        R.createElement(PlugChar, { sz: 140 * u, body: TINT, prong: '#7a7290', t, hop: false, droop: 1 })
      ),
      R.createElement(Caption, { u, p, text: 'The sale is already gone.', color: CORAL }),
    ),
  );
}

function Enter({ progress: p, localTime: t }) {
  const { u } = dims();
  const grow = backOut(seg(p, 0.05, 0.4));
  const spark = seg(p, 0.35, 0.5) * (1 - seg(p, 0.55, 0.8));
  const dots = 9;
  const K = 1 - easeInOut(seg(p, 0.92, 1));
  return R.createElement(R.Fragment, null,
    R.createElement(Backdrop, { t }),
    R.createElement(SafeBox, null,
      // scattered tags flying into a grid behind
      Array.from({ length: dots }).map((_, i) => {
        const gp = easeOut(seg(p, 0.4 + (i % 3) * 0.05, 0.8));
        const gx = 22 + (i % 3) * 28, gy = 22 + Math.floor(i / 3) * 28;
        const sx = 50 + Math.cos(i * 2.1) * 70, sy = 50 + Math.sin(i * 1.7) * 70;
        const x = sx + (gx - sx) * gp, y = sy + (gy - sy) * gp;
        return R.createElement('div', { key: i, style: { position: 'absolute', left: x + '%', top: y + '%', width: 90 * u, height: 90 * u, marginLeft: -45 * u, marginTop: -45 * u, borderRadius: 18 * u, background: `linear-gradient(150deg, hsl(${(i * 40) % 360} 42% 30%), hsl(${(i * 40 + 30) % 360} 40% 18%))`, border: '1px solid #2E2946', opacity: 0.35 + 0.5 * gp } })
      }),
      // creator hopping in center
      R.createElement('div', { style: { position: 'absolute', left: '50%', top: '44%', transform: `translate(-50%,-50%) scale(${grow})`, } },
        R.createElement('div', { style: { position: 'relative', width: 300 * u } },
          spark > 0.02 && R.createElement('div', { style: { position: 'absolute', top: -30 * u, right: 20 * u, width: 70 * u, height: 70 * u, borderRadius: 16 * u, background: LIME, opacity: spark, transform: `scale(${0.6 + spark})`, boxShadow: `0 0 ${60 * u}px rgba(198,255,61,0.8)` } }),
          R.createElement(PlugChar, { sz: 300 * u, body: VIOLET, prong: LIME, t, role: 'creator' }),
        ),
      ),
      R.createElement('div', { style: { position: 'absolute', left: 0, right: 0, top: '72%', display: 'flex', justifyContent: 'center', opacity: easeOut(seg(p, 0.55, 0.8)) } },
        R.createElement(Wordmark, { u })
      ),
      R.createElement(Caption, { u, p, text: 'One profile. Every plug.' }),
    ),
  );
}

function Market({ progress: p, localTime: t }) {
  const { u } = dims();
  const K = grpK(p);
  const chips = ['All', 'Beauty', 'Tech', 'Fits', 'Home'];
  const cards = [
    { title: 'Everyday serum', price: '$24', hue: 330 },
    { title: 'Studio headphones', price: '$199', hue: 250 },
    { title: 'The linen shirt', price: '$68', hue: 40, own: true },
    { title: 'Trail runners', price: '$110', hue: 150, coupon: 'PLUG10' },
  ];
  return R.createElement(R.Fragment, null,
    R.createElement(Backdrop, { t }),
    R.createElement(SafeBox, null,
      R.createElement(Eyebrow, { u, p, text: 'Your referrals, grouped', color: LIME }),
      // chips
      R.createElement('div', { style: { position: 'absolute', left: 0, right: 0, top: '17%', display: 'flex', gap: 12 * u, justifyContent: 'center', flexWrap: 'wrap', padding: '0 6%' } },
        chips.map((c, i) => {
          const cp = easeOut(seg(p, 0.1 + i * 0.05, 0.35 + i * 0.05));
          return R.createElement('div', { key: i, style: { fontFamily: MONO, fontSize: 19 * u, padding: `${8 * u}px ${16 * u}px`, borderRadius: 100, background: i === 0 ? LIME : 'transparent', color: i === 0 ? INK : '#B7B2C4', border: i === 0 ? 'none' : '1px solid #3A3550', opacity: cp, transform: `translateY(${(1 - cp) * -14 * u}px)` } }, c)
        })
      ),
      // grid
      R.createElement('div', { style: { position: 'absolute', left: '6%', right: '6%', top: '27%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 * u } },
        cards.map((c, i) => {
          const cp = backOut(seg(p, 0.2 + i * 0.07, 0.55 + i * 0.07));
          return R.createElement('div', { key: i, style: { transform: `scale(${cp}) translateY(${(1 - cp) * 30 * u}px)`, opacity: Math.max(0, cp) } },
            R.createElement(MiniCard, { u, w: '100%', title: c.title, price: c.price, hue: c.hue, own: c.own, coupon: c.coupon })
          )
        })
      ),
      R.createElement(Caption, { u, p, text: 'All your picks, in one shoppable place.' }),
    ),
  );
}

function Voice({ progress: p, localTime: t }) {
  const { u } = dims();
  const K = grpK(p);
  const comments = ['need this 🔥', 'just copped!', 'best rec ever'];
  const stars = easeOut(seg(p, 0.3, 0.6));
  return R.createElement(R.Fragment, null,
    R.createElement(Backdrop, { t }),
    R.createElement(SafeBox, null,
      R.createElement(Eyebrow, { u, p, text: 'Not a faceless listing', color: LIME }),
      R.createElement('div', { style: { position: 'absolute', left: '50%', top: '46%', transform: `translate(-50%,-50%) scale(${0.92 + 0.08 * easeOut(seg(p, 0, 0.2))})`, opacity: K, width: 560 * u } },
        R.createElement('div', { style: { background: '#1C1930', border: '1px solid #2E2946', borderRadius: 26 * u, overflow: 'hidden', boxShadow: `0 ${24 * u}px ${60 * u}px rgba(0,0,0,0.45)` } },
          R.createElement('div', { style: { height: 230 * u, background: 'linear-gradient(150deg, hsl(250 45% 32%), hsl(250 40% 18%))' } }),
          R.createElement('div', { style: { padding: 24 * u } },
            // creator note
            R.createElement('div', { style: { display: 'flex', gap: 14 * u, alignItems: 'flex-start' } },
              R.createElement('div', { style: { width: 56 * u, height: 56 * u, flexShrink: 0 } }, R.createElement(PlugChar, { sz: 56 * u, body: VIOLET, prong: LIME, hop: false, role: 'creator' })),
              R.createElement('div', { style: { fontFamily: INTER, fontSize: 25 * u, lineHeight: 1.45, color: CANVAS } }, '“I’ve worn these daily for a year — worth every penny.”'),
            ),
            R.createElement('div', { style: { display: 'flex', gap: 6 * u, marginTop: 16 * u } },
              [0, 1, 2, 3, 4].map(i => R.createElement('div', { key: i, style: { color: seg(stars, i / 5, (i + 1) / 5) > 0 ? LIME : '#3A3550', fontSize: 30 * u, fontFamily: SORA } }, '★'))
            ),
          ),
        ),
        // floating comment bubbles
        comments.map((c, i) => {
          const bp = backOut(seg(p, 0.45 + i * 0.13, 0.7 + i * 0.13));
          return R.createElement('div', { key: i, style: { position: 'absolute', right: (-40 - i * 10) * u, top: (60 + i * 150) * u, transform: `scale(${bp})`, opacity: Math.max(0, bp), fontFamily: INTER, fontWeight: 600, fontSize: 23 * u, color: INK, background: i === 1 ? LIME : '#fff', padding: `${10 * u}px ${18 * u}px`, borderRadius: 100, boxShadow: `0 ${8 * u}px ${20 * u}px rgba(0,0,0,0.3)`, whiteSpace: 'nowrap' } }, c)
        }),
      ),
      R.createElement(Caption, { u, p, text: 'Your take, your reviews — your voice sells.' }),
    ),
  );
}

function Fresh({ progress: p, localTime: t }) {
  const { u } = dims();
  const K = grpK(p);
  const swap = seg(p, 0.35, 0.6);
  const tick = seg(p, 0.55, 0.72) * (1 - seg(p, 0.85, 1));
  return R.createElement(R.Fragment, null,
    R.createElement(Backdrop, { t }),
    R.createElement(SafeBox, null,
      R.createElement(Eyebrow, { u, p, text: 'Change it once', color: LIME }),
      R.createElement('div', { style: { position: 'absolute', left: '50%', top: '46%', transform: 'translate(-50%,-50%)', opacity: K, width: 460 * u } },
        R.createElement('div', { style: { position: 'relative' } },
          // old image fades out, new fades in
          R.createElement('div', { style: { position: 'absolute', inset: 0, borderRadius: 22 * u, background: 'linear-gradient(150deg, hsl(20 45% 30%), hsl(20 40% 18%))', opacity: 1 - swap, height: 320 * u } }),
          R.createElement(MiniCard, { u, w: '100%', title: 'The linen shirt', price: swap > 0.5 ? '$59' : '$68', hue: 150 }),
          // updated tick
          tick > 0.02 && R.createElement('div', { style: { position: 'absolute', top: -24 * u, right: -20 * u, display: 'flex', alignItems: 'center', gap: 8 * u, background: LIME, color: INK, fontFamily: MONO, fontWeight: 700, fontSize: 20 * u, padding: `${8 * u}px ${14 * u}px`, borderRadius: 100, transform: `scale(${backOut(Math.min(1, tick * 1.5))})`, boxShadow: `0 0 ${40 * u}px rgba(198,255,61,0.6)` } }, '✓ updated everywhere')
        ),
      ),
      R.createElement('div', { style: { position: 'absolute', left: '50%', bottom: '20%', transform: 'translateX(-50%)', display: 'flex', gap: 40 * u, opacity: K } },
        R.createElement('div', { style: { width: 120 * u } }, R.createElement(PlugChar, { sz: 120 * u, body: VIOLET, prong: LIME, t, role: 'creator' })),
        R.createElement('div', { style: { width: 100 * u } }, R.createElement(PlugChar, { sz: 100 * u, body: TINT, prong: LIME, t: t + 0.5 })),
      ),
      R.createElement(Caption, { u, p, text: 'Always current — never a dead link.' }),
    ),
  );
}

function Buy({ progress: p, localTime: t }) {
  const { u } = dims();
  const K = grpK(p);
  const steps = [
    { n: '1', label: 'Tap a post', hue: 300 },
    { n: '2', label: 'See the product', hue: 250 },
    { n: '3', label: 'Buy at the retailer', hue: 150 },
  ];
  const active = Math.min(2, Math.floor(seg(p, 0.1, 0.75) * 3));
  const noLogin = backOut(seg(p, 0.62, 0.8)) * (1 - seg(p, 0.92, 1));
  return R.createElement(R.Fragment, null,
    R.createElement(Backdrop, { t }),
    R.createElement(SafeBox, null,
      R.createElement(Eyebrow, { u, p, text: 'For the follower', color: LIME }),
      R.createElement('div', { style: { position: 'absolute', left: 0, right: 0, top: '30%', display: 'flex', gap: 20 * u, justifyContent: 'center', alignItems: 'center' } },
        steps.map((s, i) => {
          const sp = easeOut(seg(p, 0.1 + i * 0.18, 0.35 + i * 0.18));
          const on = i <= active;
          return R.createElement(R.Fragment, { key: i },
            R.createElement('div', { style: { width: 200 * u, height: 320 * u, borderRadius: 34 * u, background: `linear-gradient(160deg, hsl(${s.hue} 45% 28%), hsl(${s.hue} 40% 14%))`, border: `${3 * u}px solid ${on ? LIME : '#2E2946'}`, opacity: sp, transform: `scale(${0.9 + 0.1 * sp}) translateY(${(1 - sp) * 30 * u}px)`, position: 'relative', boxShadow: on ? `0 0 ${40 * u}px rgba(198,255,61,0.3)` : 'none', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 18 * u } },
              R.createElement('div', { style: { position: 'absolute', top: 16 * u, left: 16 * u, width: 52 * u, height: 52 * u, borderRadius: '50%', background: on ? LIME : '#2E2946', color: on ? INK : '#8C8798', fontFamily: SORA, fontWeight: 800, fontSize: 30 * u, display: 'flex', alignItems: 'center', justifyContent: 'center' } }, s.n),
              R.createElement('div', { style: { fontFamily: INTER, fontWeight: 600, fontSize: 22 * u, color: '#fff' } }, s.label),
            ),
            i < 2 && R.createElement('div', { style: { color: i < active ? LIME : '#3A3550', fontSize: 40 * u } }, '→'),
          )
        })
      ),
      noLogin > 0.02 && R.createElement('div', { style: { position: 'absolute', left: '50%', top: '66%', transform: `translate(-50%,-50%) rotate(-6deg) scale(${noLogin})`, fontFamily: SORA, fontWeight: 800, fontSize: 46 * u, color: INK, background: LIME, padding: `${10 * u}px ${24 * u}px`, borderRadius: 14 * u, boxShadow: `0 ${10 * u}px ${30 * u}px rgba(0,0,0,0.4)` } }, 'no login. no wall.'),
      R.createElement(Caption, { u, p, text: 'Tap · see · buy — three taps, no account.' }),
    ),
  );
}

function End({ progress: p, localTime: t }) {
  const { u } = dims();
  const inK = easeOut(seg(p, 0.05, 0.3));
  const passP = seg(p, 0.3, 0.6);
  const { S } = dims();
  return R.createElement(R.Fragment, null,
    R.createElement(Backdrop, { t }),
    R.createElement(SafeBox, null,
      // two characters
      R.createElement('div', { style: { position: 'absolute', left: 0, right: 0, top: '30%', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 120 * u, opacity: inK } },
        R.createElement('div', { style: { width: 200 * u } }, R.createElement(PlugChar, { sz: 200 * u, body: VIOLET, prong: LIME, t, role: 'creator' })),
        R.createElement('div', { style: { width: 170 * u } }, R.createElement(PlugChar, { sz: 170 * u, body: TINT, prong: LIME, t: t + 0.4, look: 'left' })),
      ),
      // spark passing between them
      R.createElement('div', { style: { position: 'absolute', left: `${33 + passP * 34}%`, top: '36%', width: 40 * u, height: 40 * u, marginLeft: -20 * u, borderRadius: 10 * u, background: LIME, opacity: (passP > 0 && passP < 1) ? 1 : 0, boxShadow: `0 0 ${50 * u}px rgba(198,255,61,0.9)`, transform: `scale(${1 + Math.sin(passP * Math.PI) * 0.5})` } }),
      // wordmark + tagline
      R.createElement('div', { style: { position: 'absolute', left: 0, right: 0, top: '62%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 * u, opacity: easeOut(seg(p, 0.45, 0.7)) } },
        R.createElement('div', { style: { transform: `scale(${1.3})` } }, R.createElement(Wordmark, { u })),
        R.createElement('div', { style: { fontFamily: SORA, fontWeight: 700, fontSize: 46 * u, letterSpacing: '-0.03em', color: '#fff', marginTop: 20 * u } }, 'All your plugs. One profile.'),
        R.createElement('div', { style: { fontFamily: MONO, fontSize: 22 * u, letterSpacing: '0.14em', color: LIME, opacity: easeOut(seg(p, 0.6, 0.85)) } }, 'PLUGFOLIO.APP'),
      ),
    ),
  );
}

const SCENE_MAP = { Hunt, Gone, Enter, Market, Voice, Fresh, Buy, End };

/* ============================ APP ============================ */
function CreatorFilm() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS);
  const fmt = t.format || '9:16';
  CUR = FORMATS[fmt] || FORMATS['9:16'];
  const { w, h } = CUR;
  // fit the stage inside the preview viewport
  const wrap = { position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#08070C', overflow: 'hidden' };
  return R.createElement('div', { style: wrap },
    R.createElement('div', { style: { width: '100%', height: '100%', maxWidth: '100vw', maxHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
      R.createElement(SceneStage, {
        key: fmt, width: w, height: h, scenes: window.OM_SCENES, playback: window.OM_PLAYBACK, bg: INK,
        style: { width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '100%' },
      }, SCENE_MAP)
    ),
    R.createElement(TweaksPanel, null,
      R.createElement(TweakSection, { label: 'Format' }),
      R.createElement(TweakRadio, { label: 'Aspect ratio', value: fmt, options: ['9:16', '1:1', '16:9'], onChange: v => setTweak('format', v) }),
      R.createElement(TweakSection, { label: 'Editor' }),
      R.createElement(TweakToggle, { label: 'Motion editor', value: t.motionEditor, onChange: v => setTweak('motionEditor', v) }),
    ),
  );
}
window.CreatorFilm = CreatorFilm;
