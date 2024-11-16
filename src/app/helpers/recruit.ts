import { GameHero, GameHeroStat, GameResource } from '../interfaces';
import { getEntry } from './content';
import { cooldown } from './cooldown';
import { gamestate, setGameState } from './gamestate';
import { addHero, canRecruitHero, createHero, totalHeroes } from './hero';
import { notifyError } from './notify';
import {
  allUnlockedStatBoostResearchValue,
  isResearchComplete,
} from './research';
import { hasResource, loseResource } from './resource';
import { seededrng } from './rng';

import { v4 as uuid } from 'uuid';

export function setResetTime(): void {
  const state = gamestate();
  state.cooldowns.nextRecruitResetTime = cooldown(3600);
  setGameState(state);
}

export function resetRerolls(): void {
  const state = gamestate();
  state.recruitment.numRerolls = 0;
  setGameState(state);
}

export function generateHeroesToRecruit() {
  const state = gamestate();

  const rng = seededrng(uuid());

  function statBonusForRecruit(stat: GameHeroStat): number {
    const maxBoost = allUnlockedStatBoostResearchValue(stat);
    return Math.round(rng() * maxBoost);
  }

  state.recruitment.recruitableHeroes = [];
  for (let i = 0; i < 6; i++) {
    const hero = createHero();

    hero.stats.force += statBonusForRecruit('force');
    hero.stats.piety += statBonusForRecruit('piety');
    hero.stats.progress += statBonusForRecruit('progress');
    hero.stats.resistance += statBonusForRecruit('resistance');
    hero.stats.speed += statBonusForRecruit('speed');

    state.recruitment.recruitableHeroes.push(hero);
  }

  setGameState(state);
}

export function recruitHero(hero: GameHero): void {
  const resource = getEntry<GameResource>('Food');
  if (!resource) return;

  const state = gamestate();

  if (!state.recruitment.recruitableHeroes.includes(hero)) {
    notifyError('That hero is not available for recruitment!', true);
    return;
  }

  loseResource(resource, recruitCost());
  addHero(hero);
}

export function doReroll(): void {
  const resource = getEntry<GameResource>('Food');
  if (!resource) return;

  generateHeroesToRecruit();
  loseResource(resource, rerollCost());

  const state = gamestate();
  state.recruitment.numRerolls += 1;
  setGameState(state);
}

export function canRecruit(): boolean {
  const resource = getEntry<GameResource>('Food');
  if (!resource) return false;

  return (
    isResearchComplete('Help Posters') &&
    canRecruitHero() &&
    hasResource(resource, recruitCost())
  );
}

export function canReroll(): boolean {
  const resource = getEntry<GameResource>('Food');
  if (!resource) return false;

  return hasResource(resource, rerollCost());
}

export function rerollCost(): number {
  const numRerolls = gamestate().recruitment.numRerolls ?? 0;
  if (numRerolls === 0) return 0;

  const totalRerolls = 1 + numRerolls;
  return recruitCost() + Math.floor(Math.pow(totalRerolls, 1.5)) * 5;
}

export function recruitCost(): number {
  const heroesRecruited = totalHeroes();
  return Math.floor(Math.pow(heroesRecruited, 1.9) * 5);
}
