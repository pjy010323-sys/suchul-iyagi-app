import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {Doctor, TalkingCar} from './characters';

const fontCss = `
@font-face{font-family:Pretendard;font-weight:800;src:url(${staticFile('Pretendard-ExtraBold.woff2')}) format('woff2');}
@font-face{font-family:Pretendard;font-weight:900;src:url(${staticFile('Pretendard-Black.woff2')}) format('woff2');}
`;

const Label: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{fontFamily: 'Pretendard', fontWeight: 800, fontSize: 30, color: '#9aa6c7', textAlign: 'center', marginTop: 6}}>{children}</div>
);

export const CharacterSheet: React.FC = () => (
  <AbsoluteFill style={{background: '#0b1020', padding: 50}}>
    <style>{fontCss}</style>
    <div style={{fontFamily: 'Pretendard', fontWeight: 900, fontSize: 54, color: '#fff'}}>
      캐릭터 시안 <span style={{color: '#FFD400'}}>· 수출 박사 & 말하는 자동차</span>
    </div>
    <div style={{display: 'flex', justifyContent: 'space-around', marginTop: 20}}>
      {(['smile', 'shock', 'smug'] as const).map((e, i) => (
        <div key={e}>
          <Doctor size={330} expr={e} mouth={e === 'shock' ? 0.8 : 0.4} />
          <Label>{['기본 (설명할 때)', '깜짝! (150만 원?!)', '으쓱 (내가 해냈지)'][i]}</Label>
        </div>
      ))}
    </div>
    <div style={{display: 'flex', justifyContent: 'space-around', marginTop: 30}}>
      {(['sad', 'curious', 'money', 'faint'] as const).map((e, i) => (
        <div key={e}>
          <TalkingCar size={400} expr={e} mouth={0.5} />
          <Label>{['울먹 (폐차야?)', '궁금 (어디?)', '돈 눈 (얼마?!)', '기절 (+140?!)'][i]}</Label>
        </div>
      ))}
    </div>
  </AbsoluteFill>
);
