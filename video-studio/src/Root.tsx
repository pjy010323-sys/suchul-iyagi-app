import React from 'react';
import {Composition} from 'remotion';
import {PriceReveal, TOTAL} from './PriceReveal';

export const Root: React.FC = () => (
  <Composition
    id="PriceReveal"
    component={PriceReveal}
    durationInFrames={TOTAL}
    fps={30}
    width={1080}
    height={1920}
  />
);
