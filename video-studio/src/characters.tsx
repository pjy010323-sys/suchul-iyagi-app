import React from 'react';

// 캐릭터는 표정(expression)과 입 벌림(mouth 0~1)만 바꾸면 되도록 만든다.
// 나중에 음성 크기에 맞춰 mouth 값을 바꾸면 말하는 것처럼 보인다.

export type DocExpr = 'smile' | 'shock' | 'smug';

export const Doctor: React.FC<{size?: number; expr?: DocExpr; mouth?: number}> = ({
  size = 600,
  expr = 'smile',
  mouth = 0.3,
}) => {
  const shock = expr === 'shock';
  const smug = expr === 'smug';
  const eyeR = shock ? 26 : 16;
  const browY = shock ? -22 : smug ? 6 : 0;
  const mh = 8 + mouth * 46;
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 400 500">
      {/* 몸통: 남색 정장 + 노란 넥타이 */}
      <path d="M70,500 Q70,360 200,345 Q330,360 330,500 Z" fill="#1d2d5c" />
      <path d="M170,348 L200,400 L230,348 Z" fill="#ffffff" />
      <path d="M192,360 L208,360 L216,450 L200,470 L184,450 Z" fill="#FFD400" />
      {/* 목 */}
      <rect x="175" y="300" width="50" height="55" rx="10" fill="#f2c39b" />
      {/* 머리 */}
      <ellipse cx="200" cy="200" rx="120" ry="130" fill="#f6cfa8" />
      <ellipse cx="82" cy="215" rx="20" ry="30" fill="#f2c39b" />
      <ellipse cx="318" cy="215" rx="20" ry="30" fill="#f2c39b" />
      {/* 2:8 가르마 머리 */}
      <path d="M80,175 Q85,60 200,62 Q320,62 322,170 Q300,110 240,108 Q170,105 120,120 Q95,135 80,175 Z" fill="#2b2b33" />
      <path d="M150,70 Q190,100 250,104" stroke="#45454f" strokeWidth="6" fill="none" />
      {/* 눈썹 */}
      <g transform={`translate(0,${browY})`}>
        <path d={smug ? 'M118,150 Q150,140 180,152' : 'M118,148 Q150,132 182,146'} stroke="#2b2b33" strokeWidth="13" strokeLinecap="round" fill="none" />
        <path d={smug ? 'M220,146 Q250,130 282,142' : 'M218,146 Q250,132 282,148'} stroke="#2b2b33" strokeWidth="13" strokeLinecap="round" fill="none" />
      </g>
      {/* 동그란 안경 */}
      <circle cx="150" cy="195" r="38" fill="#ffffff" stroke="#111" strokeWidth="8" />
      <circle cx="250" cy="195" r="38" fill="#ffffff" stroke="#111" strokeWidth="8" />
      <path d="M188,192 Q200,184 212,192" stroke="#111" strokeWidth="7" fill="none" />
      {/* 눈동자 */}
      {smug ? (
        <>
          <path d="M132,198 Q150,188 168,198" stroke="#111" strokeWidth="8" strokeLinecap="round" fill="none" />
          <path d="M232,198 Q250,188 268,198" stroke="#111" strokeWidth="8" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <circle cx="152" cy="198" r={eyeR} fill="#111" />
          <circle cx="252" cy="198" r={eyeR} fill="#111" />
          <circle cx={152 + eyeR / 3} cy={198 - eyeR / 3} r={eyeR / 3.2} fill="#fff" />
          <circle cx={252 + eyeR / 3} cy={198 - eyeR / 3} r={eyeR / 3.2} fill="#fff" />
        </>
      )}
      {/* 코 + 콧수염 */}
      <path d="M200,215 Q212,245 196,250" stroke="#d9a47c" strokeWidth="7" strokeLinecap="round" fill="none" />
      <path d="M150,268 Q175,250 200,262 Q225,250 250,268 Q225,276 200,268 Q175,276 150,268 Z" fill="#2b2b33" />
      {/* 입 */}
      {shock ? (
        <ellipse cx="200" cy="300" rx="26" ry={20 + mouth * 22} fill="#5a1d1d" />
      ) : (
        <path d={`M165,282 Q200,${282 + mh} 235,282 Z`} fill="#5a1d1d" />
      )}
      {/* 볼터치 */}
      <ellipse cx="112" cy="250" rx="18" ry="10" fill="#ff8a7a" opacity="0.45" />
      <ellipse cx="288" cy="250" rx="18" ry="10" fill="#ff8a7a" opacity="0.45" />
      {/* 놀랐을 때 땀방울 */}
      {shock && <path d="M320,110 Q335,140 320,152 Q305,140 320,110 Z" fill="#7cc8ff" />}
    </svg>
  );
};

export type CarExpr = 'sad' | 'curious' | 'money' | 'faint';

export const TalkingCar: React.FC<{size?: number; expr?: CarExpr; mouth?: number; tilt?: number}> = ({
  size = 700,
  expr = 'curious',
  mouth = 0.3,
  tilt = 0,
}) => {
  const eye = (cx: number) => {
    if (expr === 'money')
      return (
        <text x={cx} y={180} fontSize="74" fontWeight="900" fill="#1a9e55" textAnchor="middle" fontFamily="Pretendard, sans-serif">
          $
        </text>
      );
    if (expr === 'faint')
      return <path d={`M${cx - 22},140 L${cx + 22},175 M${cx + 22},140 L${cx - 22},175`} stroke="#111" strokeWidth="9" strokeLinecap="round" />;
    const r = expr === 'sad' ? 20 : 24;
    return (
      <>
        <circle cx={cx} cy={160} r={r} fill="#111" />
        <circle cx={cx + 8} cy={152} r={7} fill="#fff" />
      </>
    );
  };
  const mh = 6 + mouth * 34;
  return (
    <svg width={size} height={size * 0.62} viewBox="0 0 600 372" style={{transform: `rotate(${tilt}deg)`}}>
      {/* 차체 (통통한 만화 세단) */}
      <path
        d="M30,270 Q22,215 70,200 L130,190 Q170,95 260,85 L370,85 Q450,92 500,185 L545,200 Q585,212 580,262 Q578,290 552,292 L30,292 Q24,282 30,270 Z"
        fill="#5b8cff"
        stroke="#2c4fae"
        strokeWidth="8"
      />
      {/* 앞유리 = 얼굴 */}
      <path d="M160,190 Q190,108 262,102 L368,102 Q432,108 470,190 Z" fill="#e8f4ff" stroke="#2c4fae" strokeWidth="7" />
      {/* 눈 */}
      {eye(265)}
      {eye(370)}
      {/* 슬플 때 눈썹 + 눈물 */}
      {expr === 'sad' && (
        <>
          <path d="M238,140 L285,124" stroke="#111" strokeWidth="8" strokeLinecap="round" />
          <path d="M398,140 L350,124" stroke="#111" strokeWidth="8" strokeLinecap="round" />
          <path d="M248,188 Q240,215 252,222 Q264,215 256,188 Z" fill="#7cc8ff" />
        </>
      )}
      {/* 입 (범퍼 위 그릴 자리) */}
      {expr === 'faint' ? (
        <path d="M280,240 Q300,230 320,240 Q340,250 360,240" stroke="#111" strokeWidth="8" fill="none" strokeLinecap="round" />
      ) : expr === 'sad' ? (
        <path d={`M275,${252 + mouth * 6} Q318,${228 - mouth * 10} 360,${252 + mouth * 6}`} stroke="#111" strokeWidth="9" fill="none" strokeLinecap="round" />
      ) : (
        <path d={`M270,232 Q318,${232 + mh * 1.4} 366,232 Z`} fill="#5a1d1d" stroke="#111" strokeWidth="6" />
      )}
      {/* 헤드라이트 볼터치 */}
      <ellipse cx="540" cy="228" rx="22" ry="14" fill="#FFD400" stroke="#2c4fae" strokeWidth="5" />
      <ellipse cx="62" cy="235" rx="16" ry="12" fill="#ff5d5d" stroke="#2c4fae" strokeWidth="5" />
      {/* 바퀴 */}
      {[150, 460].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy={300} r={58} fill="#1c1f2b" />
          <circle cx={cx} cy={300} r={26} fill="#c9cfdd" />
        </g>
      ))}
      {/* 주행거리 스티커 */}
      <g transform="translate(70,210) rotate(-8)">
        <rect width="92" height="40" rx="8" fill="#fff" stroke="#ff3b3b" strokeWidth="4" />
        <text x="46" y="28" fontSize="22" fontWeight="900" fill="#ff3b3b" textAnchor="middle" fontFamily="Pretendard, sans-serif">
          21만km
        </text>
      </g>
    </svg>
  );
};
