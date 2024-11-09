export type HeroArtPiece = 'ear' | 'eye';

export type HeroMood =
  | 'happy'
  | 'neutral'
  | 'sad'
  | 'smile'
  | 'smug'
  | 'stern'
  | 'surprise'
  | 'thinking';

export interface HeroIndividualArtPiece {
  name: string;
  layer?: number;
}

export type HeroArtNonMood = Record<
  string,
  { pieces: HeroIndividualArtPiece[] }
>;
export type HeroArtWithMood = Record<
  string,
  Record<HeroMood, { pieces: HeroIndividualArtPiece[] }>
>;

export interface HeroArt {
  ear: HeroArtNonMood;
  eye: HeroArtWithMood;
  hair: HeroArtNonMood;
  facialhair: HeroArtNonMood;
  horn: HeroArtNonMood;
  makeup: HeroArtNonMood;
  mask: HeroArtNonMood;
  outfit: HeroArtNonMood;
  wing: HeroArtNonMood;
}
