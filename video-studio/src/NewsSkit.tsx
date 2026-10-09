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
import {Doctor, DocExpr, TalkingCar, CarExpr} from './characters';
import LINES from './newsLines.json';

// 대본 A: 뉴스 속보 패러디 (상황극 · 가상 데이터)
export const NEWS_TOTAL = 900;
const SYL = 3; // 한 글자 = 3프레임 (0.1초), 합성 음성과 동일

type Line = {who: 'doc' | 'car'; text: string; start: number; expr: string};
const lines = LINES as Line[];
const unitsOf = (t: string) => [...t].filter((c) => /[\p{L}\p{N}]/u.test(c)).length;

const C = {
  bg: '#0b1020',
  white: '#ffffff',
  dim: '#9aa6c7',
  yellow: '#FFD400',
  red: '#ff2d2d',
  green: '#1fdc7a',
  blue: '#2f7bff',
};
const FONT = 'Pretendard, sans-serif';
const fontCss = `
@font-face{font-family:Pretendard;font-weight:700;src:url(${staticFile('Pretendard-Bold.woff2')}) format('woff2');}
@font-face{font-family:Pretendard;font-weight:800;src:url(${staticFile('Pretendard-ExtraBold.woff2')}) format('woff2');}
@font-face{font-family:Pretendard;font-weight:900;src:url(${staticFile('Pretendard-Black.woff2')}) format('woff2');}
`;

// ── 컷 구성: 스튜디오(박사) / 현장(자동차) / 광고 / 지도 ─────────────
type Shot = {from: number; to: number; kind: 'studio' | 'port' | 'ad' | 'map'};
const shots: Shot[] = [
  {from: 0, to: 90, kind: 'studio'},
  {from: 90, to: 210, kind: 'port'},
  {from: 210, to: 260, kind: 'studio'},
  {from: 260, to: 300, kind: 'port'},
  {from: 300, to: 345, kind: 'studio'},
  {from: 345, to: 390, kind: 'port'},
  {from: 390, to: 426, kind: 'ad'},
  {from: 426, to: 480, kind: 'map'},
  {from: 480, to: 525, kind: 'studio'},
  {from: 525, to: 600, kind: 'port'},
  {from: 600, to: 660, kind: 'studio'},
  {from: 660, to: 690, kind: 'port'},
  {from: 690, to: 880, kind: 'studio'},
  {from: 880, to: 900, kind: 'studio'},
];

// 지금 말하고 있는 대사와 말한 글자 수
const activeLine = (frame: number, who: 'doc' | 'car') => {
  let found: {line: Line; spoken: number; speaking: boolean} | null = null;
  for (const l of lines) {
    if (l.who !== who || frame < l.start) continue;
    const n = unitsOf(l.text);
    const spoken = Math.min(n, Math.floor((frame - l.start) / SYL) + 1);
    found = {line: l, spoken, speaking: frame < l.start + n * SYL};
  }
  return found;
};

// 글자 단위로 입 열고 닫기
const mouthAt = (frame: number, who: 'doc' | 'car') => {
  const a = activeLine(frame, who);
  if (!a || !a.speaking) return 0.15;
  const k = (frame - a.line.start) % SYL;
  return [0.95, 0.55, 0.2][k];
};

// ── 공통 연출 도구 ─────────────────────────────────────────────
const shake = (frame: number, at: number, power = 16) => {
  const t = frame - at;
  if (t < 0 || t > 10) return '';
  const k = power * (1 - t / 10);
  return `translate(${Math.sin(t * 7) * k}px, ${Math.cos(t * 9) * k}px)`;
};

const usePop = (delay: number, damping = 11) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping, stiffness: 190}});
};

// 말풍선: 말하는 글자만큼 한 글자씩 나타남
const Bubble: React.FC<{who: 'doc' | 'car'; frame: number; top: number}> = ({who, frame, top}) => {
  const a = activeLine(frame, who);
  if (!a) return null;
  const age = frame - a.line.start;
  if (age > unitsOf(a.line.text) * SYL + 40) return null;
  let count = 0;
  const shown = [...a.line.text]
    .filter((c) => {
      if (/[\p{L}\p{N}]/u.test(c)) {
        count++;
        return count <= a.spoken;
      }
      return count <= a.spoken && count > 0;
    })
    .join('');
  const pop = Math.min(1, age / 4);
  const color = who === 'doc' ? C.white : C.yellow;
  return (
    <div style={{position: 'absolute', left: 60, right: 170, top, display: 'flex', justifyContent: 'center'}}>
      <div
        style={{
          transform: `scale(${0.8 + 0.2 * pop})`,
          background: color,
          color: C.bg,
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 66,
          lineHeight: 1.25,
          padding: '22px 34px',
          borderRadius: 34,
          textAlign: 'center',
          boxShadow: '0 12px 0 rgba(0,0,0,0.25)',
          maxWidth: 850,
          wordBreak: 'keep-all',
        }}
      >
        {shown}
      </div>
    </div>
  );
};

// ── 배경 ──────────────────────────────────────────────────────
const StudioBg: React.FC<{frame: number}> = ({frame}) => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 35%, #2b4fd8 0%, #10205e 55%, #070c22 100%)'}}>
    {/* 스튜디오 조명 줄무늬 */}
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          top: 0,
          left: 90 + i * 170 + Math.sin(frame / 20 + i) * 10,
          width: 60,
          height: 1300,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0))',
          transform: 'skewX(-12deg)',
        }}
      />
    ))}
    {/* 뒤 화면의 세계지도 느낌 점들 */}
    <svg width={1080} height={1920} style={{position: 'absolute', opacity: 0.18}}>
      {Array.from({length: 140}).map((_, i) => (
        <circle key={i} cx={(i * 97) % 1000 + 40} cy={330 + ((i * 53) % 520)} r={5} fill="#9fc0ff" />
      ))}
    </svg>
  </AbsoluteFill>
);

const PortBg: React.FC<{frame: number}> = ({frame}) => (
  <AbsoluteFill style={{background: 'linear-gradient(180deg, #ffb36b 0%, #ff8a7a 30%, #6d6bd8 62%)'}}>
    {/* 크레인 */}
    {[160, 820].map((x, i) => (
      <svg key={x} width={300} height={700} style={{position: 'absolute', left: x - 150, top: 300}}>
        <rect x={140} y={80} width={22} height={620} fill="#2a2f55" />
        <rect x={20} y={80} width={260} height={22} fill="#2a2f55" />
        <line x1={i ? 60 : 240} y1={102} x2={i ? 60 : 240} y2={260} stroke="#2a2f55" strokeWidth={4} />
        <rect x={(i ? 60 : 240) - 30} y={260} width={60} height={34} fill="#ff5d5d" />
      </svg>
    ))}
    {/* 바다 */}
    <div style={{position: 'absolute', top: 1180, left: 0, right: 0, bottom: 0, background: 'linear-gradient(180deg, #2e7bd6, #164a96)'}} />
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          top: 1230 + i * 70,
          left: -200 + ((frame * (2 + i)) % 200),
          width: 1500,
          height: 8,
          borderRadius: 4,
          background: 'rgba(255,255,255,0.25)',
        }}
      />
    ))}
    {/* 컨테이너 더미 */}
    <svg width={1080} height={300} style={{position: 'absolute', top: 900}}>
      {['#ff5d5d', '#FFD400', '#1fdc7a', '#2f7bff', '#ff8a3d', '#b46bff'].map((c, i) => (
        <rect key={i} x={30 + i * 170} y={i % 2 ? 150 : 90} width={160} height={i % 2 ? 130 : 190} fill={c} stroke="#1b1f3a" strokeWidth={6} />
      ))}
    </svg>
    {/* 부두 바닥 */}
    <div style={{position: 'absolute', top: 1150, left: 0, right: 0, height: 40, background: '#3b3f63'}} />
  </AbsoluteFill>
);

// ── 오버레이 ──────────────────────────────────────────────────
const BreakingBanner: React.FC<{frame: number; from: number}> = ({frame, from}) => {
  const p = spring({frame: frame - from, fps: 30, config: {damping: 10, stiffness: 220}});
  return (
    <div style={{position: 'absolute', top: 230, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${p}) rotate(-3deg)`}}>
      <div style={{background: C.red, color: C.white, fontFamily: FONT, fontWeight: 900, fontSize: 110, padding: '6px 50px', borderRadius: 14, boxShadow: '0 10px 0 #8d0000', letterSpacing: 4}}>
        속보
      </div>
    </div>
  );
};

const Ticker: React.FC<{frame: number}> = ({frame}) => {
  const text = '속보 · 21만km 쏘나타 해외행 · 국내 150만 원 견적 · 상황극 · 가상 데이터 · 수출이야기 NEWS · ';
  return (
    <div style={{position: 'absolute', top: 1430, left: 0, right: 0, height: 74, background: '#ffffff', overflow: 'hidden', display: 'flex', alignItems: 'center'}}>
      <div style={{background: C.red, color: C.white, fontFamily: FONT, fontWeight: 900, fontSize: 40, padding: '14px 22px', zIndex: 2}}>LIVE</div>
      <div style={{whiteSpace: 'nowrap', fontFamily: FONT, fontWeight: 800, fontSize: 40, color: C.bg, transform: `translateX(${-((frame * 6) % 1600)}px)`}}>
        {text + text + text}
      </div>
    </div>
  );
};

const LocationTag: React.FC<{text: string}> = ({text}) => (
  <div style={{position: 'absolute', top: 230, left: 60, background: 'rgba(0,0,0,0.65)', color: C.white, fontFamily: FONT, fontWeight: 800, fontSize: 44, padding: '10px 26px', borderRadius: 12, borderLeft: `10px solid ${C.red}`}}>
    {text}
  </div>
);

const Badge: React.FC = () => (
  <div style={{position: 'absolute', top: 150, left: 60, fontFamily: FONT, fontWeight: 700, fontSize: 30, color: C.yellow, border: `3px solid ${C.yellow}`, borderRadius: 40, padding: '6px 20px', background: 'rgba(0,0,0,0.45)'}}>
    상황극 · 가상 데이터
  </div>
);

// ── 컷별 화면 ────────────────────────────────────────────────
const Studio: React.FC<{frame: number; shot: Shot}> = ({frame, shot}) => {
  const a = activeLine(frame, 'doc');
  const expr = (a?.line.expr ?? 'smile') as DocExpr;
  const t = frame - shot.from;
  const zoom = 1 + t * 0.0015 + (a && frame - a.line.start < 6 ? 0.04 * (1 - (frame - a.line.start) / 6) : 0);
  const bob = Math.sin(frame / 5) * 6;
  const jump = expr === 'shock' && a ? Math.max(0, 40 - (frame - a.line.start) * 6) : 0;
  return (
    <AbsoluteFill style={{transform: `${a ? shake(frame, a.line.start, expr === 'shock' ? 18 : 0) : ''}`}}>
      <StudioBg frame={frame} />
      <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 45%'}}>
        <div style={{position: 'absolute', top: 420 + bob - jump, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
          <Doctor size={640} expr={expr} mouth={mouthAt(frame, 'doc')} />
        </div>
        {/* 앵커 책상 */}
        <div style={{position: 'absolute', top: 1060, left: 70, right: 70, height: 150, borderRadius: '30px 30px 10px 10px', background: 'linear-gradient(180deg, #f5f7ff, #b9c3e6)', boxShadow: '0 -6px 0 #FFD400 inset'}}>
          <div style={{textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 54, color: '#1d2d7a', marginTop: 40}}>
            수출이야기 <span style={{color: C.red}}>NEWS</span>
          </div>
        </div>
      </AbsoluteFill>
      {(frame < 90 || frame >= 880) && <BreakingBanner frame={frame} from={frame >= 880 ? 880 : 2} />}
      {frame >= 758 && frame < 880 && <ProfileCta frame={frame} />}
      <Bubble who="doc" frame={frame} top={1240} />
      <Ticker frame={frame} />
    </AbsoluteFill>
  );
};

const ProfileCta: React.FC<{frame: number}> = ({frame}) => {
  const p = spring({frame: frame - 758, fps: 30, config: {damping: 9, stiffness: 200}});
  const nudge = Math.sin(frame / 3) * 10;
  return (
    <div style={{position: 'absolute', top: 300, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${p}) translateY(${nudge}px)`}}>
      <div style={{background: C.yellow, color: C.bg, fontFamily: FONT, fontWeight: 900, fontSize: 64, padding: '18px 44px', borderRadius: 60, boxShadow: '0 10px 0 #b38f00'}}>
        ▲ 프로필에서 시세 문의
      </div>
    </div>
  );
};

const Port: React.FC<{frame: number; shot: Shot}> = ({frame, shot}) => {
  const a = activeLine(frame, 'car');
  const fainting = shot.from === 660;
  const expr = (fainting ? 'faint' : a?.line.expr ?? 'curious') as CarExpr;
  const t = frame - shot.from;
  const zoom = 1.02 + t * 0.0012;
  const bounce = Math.abs(Math.sin(frame / 4)) * (a && a.speaking ? 14 : 4);
  const tilt = fainting ? interpolate(t, [0, 12], [0, -28], {extrapolateRight: 'clamp', easing: Easing.out(Easing.back(2))}) : Math.sin(frame / 7) * 2;
  const drop = fainting ? interpolate(t, [0, 12], [0, 60], {extrapolateRight: 'clamp'}) : 0;
  return (
    <AbsoluteFill style={{transform: fainting ? shake(frame, 660, 20) : ''}}>
      <PortBg frame={frame} />
      <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 60%'}}>
        <div style={{position: 'absolute', top: 640 - bounce + drop, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
          <TalkingCar size={900} expr={expr} mouth={mouthAt(frame, 'car')} tilt={tilt} />
        </div>
        {/* 마이크 스탠드 */}
        {!fainting && (
          <svg width={200} height={520} style={{position: 'absolute', left: 760, top: 720}}>
            <rect x={92} y={90} width={14} height={420} fill="#2b2f45" />
            <rect x={60} y={500} width={80} height={14} rx={7} fill="#2b2f45" />
            <rect x={78} y={20} width={44} height={90} rx={22} fill="#3c4258" />
            <rect x={84} y={28} width={14} height={40} rx={7} fill="#ffffff" opacity={0.35} />
            <rect x={70} y={96} width={60} height={26} rx={6} fill={C.red} />
            <text x={100} y={115} fontSize={18} fontWeight={900} fill="#fff" textAnchor="middle" fontFamily={FONT}>NEWS</text>
          </svg>
        )}
        {fainting && (
          <div style={{position: 'absolute', top: 560, left: 0, right: 0, textAlign: 'center', fontSize: 90, color: C.yellow, fontFamily: FONT, fontWeight: 900, transform: `rotate(${frame * 8}deg)`}}>
            ✦ ✦ ✦
          </div>
        )}
      </AbsoluteFill>
      <LocationTag text="현장 연결 · 인천항" />
      {shot.from === 525 && frame >= 560 && <BigPrice frame={frame} at={560} />}
      <Bubble who="car" frame={frame} top={1240} />
      <Ticker frame={frame} />
    </AbsoluteFill>
  );
};

const BigPrice: React.FC<{frame: number; at: number}> = ({frame, at}) => {
  const p = spring({frame: frame - at, fps: 30, config: {damping: 8, stiffness: 200}});
  const flash = interpolate(frame, [at, at + 6], [0.8, 0], {extrapolateRight: 'clamp'});
  return (
    <>
      <AbsoluteFill style={{background: '#fff', opacity: flash}} />
      <div style={{position: 'absolute', top: 360, left: 0, right: 0, display: 'flex', justifyContent: 'center', transform: `scale(${p}) rotate(-4deg)`}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 170, color: C.green, WebkitTextStroke: '8px #0b3d22', textShadow: '0 12px 0 #0b3d22'}}>290만 원</div>
      </div>
    </>
  );
};

const Ad: React.FC<{frame: number; shot: Shot}> = ({frame, shot}) => {
  const t = frame - shot.from;
  const p = spring({frame: t, fps: 30, config: {damping: 10}});
  return (
    <AbsoluteFill style={{background: C.yellow, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'absolute', top: 260, fontFamily: FONT, fontWeight: 800, fontSize: 40, color: '#5a4a00'}}>잠깐 광고 (진짜임)</div>
      <div style={{transform: `scale(${p})`, textAlign: 'center'}}>
        <div style={{fontFamily: FONT, fontWeight: 900, fontSize: 130, color: C.bg}}>수출이야기</div>
        <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 52, color: C.bg, marginTop: 20}}>
          내 차, 바다 건너면
          <br />
          몸값이 달라진다
        </div>
      </div>
    </AbsoluteFill>
  );
};

const MapShot: React.FC<{frame: number; shot: Shot}> = ({frame, shot}) => {
  const t = interpolate(frame - shot.from, [4, 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.quad)});
  const P0 = {x: 860, y: 900}, P1 = {x: 540, y: 380}, P2 = {x: 200, y: 980};
  const pt = {
    x: (1 - t) ** 2 * P0.x + 2 * (1 - t) * t * P1.x + t ** 2 * P2.x,
    y: (1 - t) ** 2 * P0.y + 2 * (1 - t) * t * P1.y + t ** 2 * P2.y,
  };
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #13275a 0%, #070c22 75%)'}}>
      <svg width={1080} height={1920} style={{position: 'absolute'}}>
        <path d={`M${P0.x},${P0.y} Q${P1.x},${P1.y} ${P2.x},${P2.y}`} fill="none" stroke={C.yellow} strokeWidth={10} strokeDasharray="1400" strokeDashoffset={1400 * (1 - t)} strokeLinecap="round" />
        <circle cx={P0.x} cy={P0.y} r={24} fill={C.blue} />
        <text x={P0.x} y={P0.y + 80} fill="#fff" fontFamily={FONT} fontWeight={800} fontSize={50} textAnchor="middle">인천</text>
        <circle cx={P2.x} cy={P2.y} r={24 + 14 * t} fill={C.green} />
        <text x={P2.x} y={P2.y + 84} fill="#fff" fontFamily={FONT} fontWeight={900} fontSize={60} textAnchor="middle" opacity={t > 0.85 ? 1 : 0.3}>
          {t > 0.85 ? '요르단' : '???'}
        </text>
      </svg>
      <div style={{position: 'absolute', left: pt.x - 120, top: pt.y - 110}}>
        <TalkingCar size={240} expr="curious" mouth={mouthAt(frame, 'car')} tilt={-10} />
      </div>
      <Bubble who="car" frame={frame} top={1240} />
    </AbsoluteFill>
  );
};

// ── 전체 조립 ───────────────────────────────────────────────
const Sfx: React.FC<{at: number; src: string; volume?: number}> = ({at, src, volume = 0.8}) => (
  <Sequence from={at} durationInFrames={60}>
    <Audio src={staticFile(src)} volume={volume} />
  </Sequence>
);

export const NewsSkit: React.FC = () => {
  const frame = useCurrentFrame();
  const shot = shots.find((s) => frame >= s.from && frame < s.to) ?? shots[0];
  const View = {studio: Studio, port: Port, ad: Ad, map: MapShot}[shot.kind];
  const cutFlash = interpolate(frame - shot.from, [0, 3], [0.35, 0], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <style>{fontCss}</style>
      <View frame={frame} shot={shot} />
      <AbsoluteFill style={{background: '#fff', opacity: shot.from === 0 ? 0 : cutFlash}} />
      <Badge />
      {frame >= 690 && (
        <div style={{position: 'absolute', top: 1520, left: 60, right: 170, textAlign: 'center', fontFamily: FONT, fontWeight: 700, fontSize: 28, color: C.dim}}>
          ※ 실제 가격은 차량 상태·시기·국가에 따라 달라요
        </div>
      )}

      {/* 배경 비트 (목소리를 가리지 않게 작게) */}
      <Audio src={staticFile('voice/bgm.wav')} volume={0.22} />
      {/* 캐릭터 목소리 */}
      {lines.map((l, i) => (
        <Sequence key={i} from={l.start} durationInFrames={unitsOf(l.text) * SYL + 6}>
          <Audio src={staticFile(`voice/L${i}.wav`)} volume={0.9} />
        </Sequence>
      ))}
      {/* 효과음 */}
      <Sfx at={2} src="sfx/hit.wav" />
      <Sfx at={2} src="sfx/stamp.wav" />
      <Sfx at={60} src="sfx/whoosh.wav" />
      {shots.slice(1).map((s) => (
        <Sfx key={s.from} at={s.from} src="sfx/whoosh.wav" volume={0.35} />
      ))}
      <Sfx at={390} src="sfx/ding.wav" volume={0.7} />
      <Sfx at={430} src="sfx/riser.wav" volume={0.5} />
      <Sfx at={560} src="sfx/hit.wav" />
      <Sfx at={560} src="sfx/ding.wav" />
      <Sfx at={604} src="sfx/stamp.wav" />
      <Sfx at={660} src="sfx/hit.wav" volume={0.7} />
      <Sfx at={758} src="sfx/pop.wav" />
      <Sfx at={880} src="sfx/hit.wav" />
    </AbsoluteFill>
  );
};
