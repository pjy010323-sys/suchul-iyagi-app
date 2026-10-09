import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

// ── 장면 시간표 (30fps 기준 프레임) ─────────────────────────────
const S = {
  hook: [0, 84],
  info: [84, 204],
  quotes: [204, 354],
  route: [354, 489],
  reveal: [489, 624],
  why: [624, 759],
  cta: [759, 900],
} as const;
export const TOTAL = 900;

const C = {
  bg: '#0b1020',
  bg2: '#141c36',
  white: '#ffffff',
  dim: '#9aa6c7',
  yellow: '#FFD400',
  red: '#ff3b3b',
  green: '#1fdc7a',
  blue: '#2f7bff',
};

const FONT = 'Pretendard, sans-serif';

const fontCss = `
@font-face{font-family:Pretendard;font-weight:700;src:url(${staticFile('Pretendard-Bold.woff2')}) format('woff2');}
@font-face{font-family:Pretendard;font-weight:800;src:url(${staticFile('Pretendard-ExtraBold.woff2')}) format('woff2');}
@font-face{font-family:Pretendard;font-weight:900;src:url(${staticFile('Pretendard-Black.woff2')}) format('woff2');}
`;

// ── 공통 도구 ────────────────────────────────────────────────────
const Sfx: React.FC<{at: number; src: string; volume?: number}> = ({at, src, volume = 0.8}) => (
  <Sequence from={at} durationInFrames={60}>
    <Audio src={staticFile(`sfx/${src}.wav`)} volume={volume} />
  </Sequence>
);

const usePop = (delay: number, damping = 12) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping, stiffness: 180}});
};

// 장면 진입: 옆에서 빠르게 밀려 들어오는 전환
const WhipIn: React.FC<{children: React.ReactNode; from?: 'left' | 'right'}> = ({children, from = 'right'}) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame, [0, 7], [from === 'right' ? 1080 : -1080, 0], {
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const blur = interpolate(frame, [0, 7], [18, 0], {extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{transform: `translateX(${x}px)`, filter: `blur(${blur}px)`}}>{children}</AbsoluteFill>;
};

// 충격 순간 화면 흔들림
const shake = (frame: number, at: number, power = 18) => {
  const t = frame - at;
  if (t < 0 || t > 10) return '';
  const k = power * (1 - t / 10);
  return `translate(${Math.sin(t * 7) * k}px, ${Math.cos(t * 9) * k}px)`;
};

// 자막: 화면 아래쪽(플랫폼 버튼에 안 가리는 높이)에 한 줄씩
const Caption: React.FC<{text: string; delay?: number; color?: string}> = ({text, delay = 0, color = C.white}) => {
  const p = usePop(delay, 14);
  return (
    <div
      style={{
        position: 'absolute',
        left: 70,
        right: 170,
        top: 1290,
        textAlign: 'center',
        transform: `scale(${0.7 + 0.3 * p})`,
        opacity: p,
      }}
    >
      <span
        style={{
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 54,
          color,
          background: 'rgba(0,0,0,0.55)',
          padding: '10px 22px',
          borderRadius: 14,
          lineHeight: 1.5,
          boxDecorationBreak: 'clone',
          WebkitBoxDecorationBreak: 'clone',
        }}
      >
        {text}
      </span>
    </div>
  );
};

const Car: React.FC<{width: number; color?: string}> = ({width, color = '#cfd6e6'}) => (
  <svg width={width} viewBox="0 0 800 290">
    <path
      d="M40,210 L40,172 Q45,150 92,145 L232,135 Q302,70 382,62 L540,62 Q602,66 662,130 L742,145 Q772,152 774,182 L774,210 Q774,222 760,222 L702,222 A62,62 0 0 0 578,222 L252,222 A62,62 0 0 0 128,222 L52,222 Q40,222 40,210 Z"
      fill={color}
    />
    <path d="M258,135 Q318,84 388,77 L456,77 L456,135 Z" fill="#26324f" />
    <path d="M472,77 L536,77 Q586,81 630,135 L472,135 Z" fill="#26324f" />
    <rect x="300" y="160" width="40" height="8" rx="4" fill="#8a94ad" />
    <rect x="500" y="160" width="40" height="8" rx="4" fill="#8a94ad" />
    {[190, 640].map((cx) => (
      <g key={cx}>
        <circle cx={cx} cy={222} r={52} fill="#151a26" />
        <circle cx={cx} cy={222} r={26} fill="#5d6680" />
      </g>
    ))}
  </svg>
);

const SampleBadge: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      top: 150,
      left: 60,
      fontFamily: FONT,
      fontWeight: 700,
      fontSize: 30,
      color: C.yellow,
      border: `3px solid ${C.yellow}`,
      borderRadius: 40,
      padding: '6px 20px',
      background: 'rgba(0,0,0,0.4)',
    }}
  >
    샘플 · 가상 데이터
  </div>
);

const Big: React.FC<{children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties}> = ({
  children,
  size = 96,
  color = C.white,
  style,
}) => (
  <div
    style={{
      fontFamily: FONT,
      fontWeight: 900,
      fontSize: size,
      color,
      lineHeight: 1.15,
      textAlign: 'center',
      letterSpacing: -2,
      textShadow: '0 6px 24px rgba(0,0,0,0.5)',
      ...style,
    }}
  >
    {children}
  </div>
);

// ── 장면 1: 훅 ───────────────────────────────────────────────────
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const carIn = usePop(0, 14);
  const stamp = usePop(14, 9);
  const q = usePop(40, 8);
  const zoom = interpolate(frame, [0, 84], [1, 1.12]);
  return (
    <AbsoluteFill style={{transform: `${shake(frame, 14)} ${shake(frame, 40, 12)}`}}>
      <AbsoluteFill style={{alignItems: 'center', top: 300}}>
        <Big size={88}>
          국내 견적 <span style={{color: C.red}}>150만 원</span>
          <br />
          받은 이 차
        </Big>
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', top: 680, transform: `scale(${zoom})`}}>
        <div style={{transform: `translateX(${(1 - carIn) * -900}px)`}}>
          <Car width={900} />
        </div>
        <div
          style={{
            position: 'absolute',
            top: 20,
            right: 120,
            transform: `rotate(-12deg) scale(${3 - 2 * stamp})`,
            opacity: stamp,
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 64,
            color: C.red,
            border: `8px solid ${C.red}`,
            borderRadius: 16,
            padding: '4px 24px',
            background: 'rgba(11,16,32,0.85)',
          }}
        >
          21만 km
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', top: 1080}}>
        <Big size={120} color={C.yellow} style={{transform: `scale(${q})`, opacity: q}}>
          수출하면 얼마?
        </Big>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── 장면 2: 차량 정보 (감점 요소들) ─────────────────────────────
const chips = ['2013년식', '주행 21만 km', 'LPG', '렌터카 이력'];
const Info: React.FC = () => (
  <WhipIn>
    <AbsoluteFill style={{alignItems: 'center', top: 300}}>
      <Big size={78}>YF 쏘나타</Big>
    </AbsoluteFill>
    <div style={{position: 'absolute', top: 520, left: 90, right: 170, display: 'flex', flexWrap: 'wrap', gap: 32}}>
      {chips.map((c, i) => (
        <Chip key={c} text={c} delay={10 + i * 14} />
      ))}
    </div>
    <AbsoluteFill style={{alignItems: 'center', top: 900, opacity: 0.35, filter: 'grayscale(1)'}}>
      <Car width={760} color="#7d8496" />
    </AbsoluteFill>
    <Caption text="국내에선 전부 '감점 요소'" delay={72} />
  </WhipIn>
);

const Chip: React.FC<{text: string; delay: number}> = ({text, delay}) => {
  const p = usePop(delay, 10);
  return (
    <div
      style={{
        transform: `scale(${p})`,
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: 64,
        color: C.white,
        background: C.bg2,
        border: `4px solid ${C.red}`,
        borderRadius: 24,
        padding: '22px 34px',
        display: 'flex',
        alignItems: 'center',
        gap: 18,
      }}
    >
      <span style={{color: C.red}}>✕</span>
      {text}
    </div>
  );
};

// ── 장면 3: 국내 업체 견적들 ─────────────────────────────────────
const quotes = [
  {name: 'A 업체', price: 120},
  {name: 'B 업체', price: 140},
  {name: 'C 업체', price: 150},
];
const Quotes: React.FC = () => (
  <WhipIn from="left">
    <AbsoluteFill style={{alignItems: 'center', top: 280}}>
      <Big size={76}>국내 업체 견적</Big>
    </AbsoluteFill>
    <div style={{position: 'absolute', top: 470, left: 90, right: 170}}>
      {quotes.map((q, i) => (
        <QuoteBar key={q.name} {...q} delay={8 + i * 16} />
      ))}
    </div>
    <Caption text={'"키로수가 너무 많아서요…"'} delay={70} color={C.dim} />
  </WhipIn>
);

const QuoteBar: React.FC<{name: string; price: number; delay: number}> = ({name, price, delay}) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame, [delay, delay + 14], [0, price / 150], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  return (
    <div style={{marginBottom: 72}}>
      <div style={{fontFamily: FONT, fontWeight: 700, fontSize: 40, color: C.dim, marginBottom: 10}}>{name}</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 24}}>
        <div style={{height: 120, width: 560 * w, background: C.red, borderRadius: 14}} />
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 64, color: C.white, opacity: w > 0.05 ? 1 : 0}}>
          {Math.round(price * Math.min(1, w / (price / 150)))}만
        </div>
      </div>
    </div>
  );
};

// ── 장면 4: 긴장감 – 바다 건너는 경로 ───────────────────────────
const P0 = {x: 880, y: 1000};
const P1 = {x: 540, y: 380};
const P2 = {x: 190, y: 1060};
const bez = (t: number) => ({
  x: (1 - t) ** 2 * P0.x + 2 * (1 - t) * t * P1.x + t ** 2 * P2.x,
  y: (1 - t) ** 2 * P0.y + 2 * (1 - t) * t * P1.y + t ** 2 * P2.y,
});
const Route: React.FC = () => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [20, 110], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad)});
  const ship = bez(t);
  const len = 1300;
  const glow = 0.5 + 0.5 * Math.sin(frame / 3);
  return (
    <WhipIn>
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 45%, #13275a 0%, ${C.bg} 70%)`}} />
      <AbsoluteFill style={{alignItems: 'center', top: 260}}>
        <Big size={74}>
          그런데 이 차를
          <br />
          <span style={{color: C.yellow}}>찾는 나라</span>가 있다
        </Big>
      </AbsoluteFill>
      <svg width={1080} height={1920} style={{position: 'absolute', top: 0}}>
        <path
          d={`M${P0.x},${P0.y} Q${P1.x},${P1.y} ${P2.x},${P2.y}`}
          fill="none"
          stroke={C.yellow}
          strokeWidth={8}
          strokeDasharray={`${len}`}
          strokeDashoffset={len * (1 - t)}
          strokeLinecap="round"
        />
        <circle cx={P0.x} cy={P0.y} r={22} fill={C.blue} />
        <text x={P0.x} y={P0.y + 80} fill={C.white} fontFamily={FONT} fontWeight={800} fontSize={44} textAnchor="middle">
          인천항
        </text>
        <circle cx={P2.x} cy={P2.y} r={22 + 10 * glow * t} fill={C.green} opacity={0.3 + 0.7 * t} />
        <text x={P2.x} y={P2.y + 80} fill={C.white} fontFamily={FONT} fontWeight={800} fontSize={44} textAnchor="middle" opacity={t > 0.9 ? 1 : 0.25}>
          {t > 0.9 ? '요르단' : '???'}
        </text>
        <g transform={`translate(${ship.x - 40}, ${ship.y - 30})`}>
          <rect width={80} height={36} rx={8} fill={C.white} />
          <rect x={14} y={-22} width={40} height={24} rx={4} fill={C.yellow} />
        </g>
      </svg>
      <Caption text="이 차, 결국 얼마에 팔렸을까?" delay={60} color={C.yellow} />
    </WhipIn>
  );
};

// ── 장면 5: 가격 공개 ───────────────────────────────────────────
const Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const LAND = 42;
  const v = interpolate(frame, [6, LAND], [150, 290], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.exp),
  });
  const rolling = frame < LAND;
  const burst = usePop(LAND, 8);
  const diff = usePop(LAND + 14, 9);
  const flash = interpolate(frame, [LAND, LAND + 8], [0.9, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{transform: shake(frame, LAND, 22)}}>
      <AbsoluteFill style={{alignItems: 'center', top: 330}}>
        <Big size={70} color={C.dim}>
          요르단 바이어 매입가
        </Big>
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', top: -140}}>
        <div
          style={{
            width: 900 * burst,
            height: 900 * burst,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${C.green}55 0%, transparent 65%)`,
            position: 'absolute',
          }}
        />
        <Big size={rolling ? 210 : 210 + 20 * (1 - burst)} color={rolling ? C.white : C.green} style={{filter: rolling ? 'blur(2px)' : 'none'}}>
          {Math.round(v)}만 원
        </Big>
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', top: 1060}}>
        <div
          style={{
            transform: `scale(${diff}) rotate(-4deg)`,
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 92,
            color: C.bg,
            background: C.yellow,
            padding: '12px 40px',
            borderRadius: 20,
          }}
        >
          국내보다 +140만 원
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: C.white, opacity: flash}} />
    </AbsoluteFill>
  );
};

// ── 장면 6: 왜? 이유 3가지 ───────────────────────────────────────
const reasons = [
  {n: '1', t: 'LPG 차를 찾는 나라가 있고'},
  {n: '2', t: '많이 탄 차도 고쳐서 오래 타고'},
  {n: '3', t: '부품 구하기 쉬운 인기 차종'},
];
const Why: React.FC = () => (
  <WhipIn>
    <AbsoluteFill style={{alignItems: 'center', top: 280}}>
      <Big size={96}>
        왜 <span style={{color: C.yellow}}>더</span> 받았을까?
      </Big>
    </AbsoluteFill>
    <div style={{position: 'absolute', top: 580, left: 90, right: 170}}>
      {reasons.map((r, i) => (
        <Reason key={r.n} {...r} delay={14 + i * 26} />
      ))}
    </div>
    <div style={{position: 'absolute', top: 1180, left: 90, right: 170, fontFamily: FONT, fontWeight: 700, fontSize: 30, color: C.dim}}>
      ※ 샘플용 예시 설명이에요
    </div>
  </WhipIn>
);

const Reason: React.FC<{n: string; t: string; delay: number}> = ({n, t, delay}) => {
  const p = usePop(delay, 13);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 28,
        marginBottom: 70,
        opacity: p,
        transform: `translateX(${(1 - p) * 200}px)`,
      }}
    >
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: 48,
          background: C.yellow,
          color: C.bg,
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {n}
      </div>
      <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 60, color: C.white}}>{t}</div>
    </div>
  );
};

// ── 장면 7: 문의 유도 (CTA) ─────────────────────────────────────
const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const title = usePop(4, 10);
  const brand = usePop(80, 12);
  const pulse = 1 + 0.04 * Math.sin(frame / 4);
  return (
    <WhipIn from="left">
      <AbsoluteFill style={{background: `linear-gradient(180deg, ${C.bg} 0%, #0f2a6b 100%)`}} />
      <AbsoluteFill style={{alignItems: 'center', top: 300}}>
        <Big size={100} style={{transform: `scale(${title})`}}>
          <span style={{color: C.yellow}}>내 차</span>도
          <br />
          수출될까?
        </Big>
      </AbsoluteFill>
      <div style={{position: 'absolute', top: 640, left: 90, right: 170, display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap'}}>
        {['차종', '연식', '키로수'].map((t, i) => (
          <CtaChip key={t} text={t} delay={24 + i * 10} />
        ))}
      </div>
      <AbsoluteFill style={{alignItems: 'center', top: 830}}>
        <Big size={62} style={{opacity: usePop(56, 14)}}>
          만 보내주시면
          <br />
          <span style={{color: C.green}}>수출 시세</span> 알려드려요
        </Big>
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', top: 1120}}>
        <div
          style={{
            transform: `scale(${brand * pulse})`,
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 64,
            color: C.white,
            background: C.blue,
            padding: '16px 44px',
            borderRadius: 60,
          }}
        >
          수출이야기 · DM 주세요
        </div>
      </AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          top: 1290,
          left: 90,
          right: 170,
          textAlign: 'center',
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 30,
          color: C.dim,
          opacity: brand,
        }}
      >
        ※ 실제 가격은 차량 상태·시기·국가에 따라 달라요
      </div>
    </WhipIn>
  );
};

const CtaChip: React.FC<{text: string; delay: number}> = ({text, delay}) => {
  const p = usePop(delay, 9);
  return (
    <div
      style={{
        transform: `scale(${p})`,
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 60,
        color: C.bg,
        background: C.white,
        borderRadius: 20,
        padding: '18px 34px',
      }}
    >
      {text}
    </div>
  );
};

// ── 전체 조립 ───────────────────────────────────────────────────
const seq = (k: keyof typeof S, el: React.ReactNode) => (
  <Sequence from={S[k][0]} durationInFrames={S[k][1] - S[k][0]}>
    {el}
  </Sequence>
);

export const PriceReveal: React.FC = () => {
  const ticks = [];
  // 긴장 구간: 점점 빨라지는 째깍 소리
  for (let f = S.route[0] + 10, gap = 12; f < S.route[1]; f += gap, gap = Math.max(5, gap - 1)) {
    ticks.push(<Sfx key={f} at={f} src="tick" volume={0.5} />);
  }
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <style>{fontCss}</style>
      {seq('hook', <Hook />)}
      {seq('info', <Info />)}
      {seq('quotes', <Quotes />)}
      {seq('route', <Route />)}
      {seq('reveal', <Reveal />)}
      {seq('why', <Why />)}
      {seq('cta', <Cta />)}
      <SampleBadge />

      {/* 효과음 */}
      <Sfx at={0} src="whoosh" volume={0.6} />
      <Sfx at={14} src="stamp" />
      <Sfx at={14} src="hit" />
      <Sfx at={40} src="hit" volume={0.6} />
      <Sfx at={S.info[0]} src="whoosh" volume={0.6} />
      {chips.map((_, i) => (
        <Sfx key={i} at={S.info[0] + 10 + i * 14} src="pop" volume={0.7} />
      ))}
      <Sfx at={S.quotes[0]} src="whoosh" volume={0.6} />
      {quotes.map((_, i) => (
        <Sfx key={i} at={S.quotes[0] + 8 + i * 16} src="pop" volume={0.5} />
      ))}
      <Sfx at={S.route[0]} src="whoosh" volume={0.6} />
      {ticks}
      <Sfx at={S.reveal[0]} src="riser" volume={0.7} />
      <Sfx at={S.reveal[0] + 42} src="hit" />
      <Sfx at={S.reveal[0] + 42} src="ding" />
      <Sfx at={S.reveal[0] + 56} src="stamp" volume={0.6} />
      <Sfx at={S.why[0]} src="whoosh" volume={0.6} />
      {reasons.map((_, i) => (
        <Sfx key={i} at={S.why[0] + 14 + i * 26} src="pop" volume={0.7} />
      ))}
      <Sfx at={S.cta[0]} src="whoosh" volume={0.6} />
      <Sfx at={S.cta[0] + 80} src="ding" volume={0.5} />
    </AbsoluteFill>
  );
};
