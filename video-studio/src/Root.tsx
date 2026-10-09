import React from 'react';
import {Composition} from 'remotion';
import {PriceReveal, TOTAL} from './PriceReveal';
import {CharacterSheet} from './CharacterSheet';
import {NewsSkit, NEWS_TOTAL} from './NewsSkit';

export const Root: React.FC = () => (
  <>
    <Composition
      id="PriceReveal"
      component={PriceReveal}
      durationInFrames={TOTAL}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="CharacterSheet"
      component={CharacterSheet}
      durationInFrames={1}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="NewsSkit"
      component={NewsSkit}
      durationInFrames={NEWS_TOTAL}
      fps={30}
      width={1080}
      height={1920}
    />
  </>
);
