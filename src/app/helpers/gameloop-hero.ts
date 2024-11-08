import { sum } from 'lodash';
import {
  GameHero,
  GameHeroStat,
  GameResource,
  GameState,
  GameTask,
} from '../interfaces';
import { getEntry } from './content';
import { gamestate, setGameState } from './gamestate';
import { notify } from './notify';
import { seededrng } from './rng';
import { heroesAllocatedToTask } from './task';

function applyHeroSpeed(
  state: GameState,
  hero: GameHero,
  task: GameTask,
): void {
  state.heroCurrentTaskSpeed[hero.id] ??= 0;
  state.heroCurrentTaskSpeed[hero.id] +=
    hero.stats.speed + taskBonusForHero(hero, task);
}

function resetHeroSpeed(state: GameState, hero: GameHero): void {
  state.heroCurrentTaskSpeed[hero.id] = 0;
}

function canApplyDamageToTask(
  state: GameState,
  hero: GameHero,
  task: GameTask,
): boolean {
  return state.heroCurrentTaskSpeed[hero.id] >= task.speedPerCycle;
}

function applyHeroForce(
  state: GameState,
  hero: GameHero,
  task: GameTask,
): void {
  state.taskProgress[task.id] ??= 0;
  state.taskProgress[task.id] +=
    hero.stats.force + taskBonusForHero(hero, task);
}

function updateHero(state: GameState, hero: GameHero): void {
  state.heroes[hero.id] = hero;
}

function taskBonusForHero(hero: GameHero, task: GameTask): number {
  return hero.taskLevels[task.id] ?? 0;
}

function numTaskRewards(state: GameState, task: GameTask): number {
  return Math.floor(state.taskProgress[task.id] / task.damageRequiredPerCycle);
}

function isTaskFinished(state: GameState, task: GameTask): boolean {
  return numTaskRewards(state, task) > 0;
}

function finalizeTask(state: GameState, task: GameTask): void {
  if (task.resourceIdPerCycle && task.resourceRewardPerCycle) {
    const res = getEntry<GameResource>(task.resourceIdPerCycle);

    const heroBonusSum = sum(
      heroesAllocatedToTask(task).map((h) => taskBonusForHero(h, task)),
    );

    const gained =
      (heroBonusSum + task.resourceRewardPerCycle) *
      numTaskRewards(state, task);
    state.resources[task.resourceIdPerCycle] ??= 0;
    state.resources[task.resourceIdPerCycle] += gained;

    notify(`+${gained} ${res?.name ?? '???'}`);
  }
}

function resetTask(state: GameState, task: GameTask): void {
  state.taskProgress[task.id] -=
    task.damageRequiredPerCycle * numTaskRewards(state, task);
}

function rewardTaskDoers(state: GameState, task: GameTask): void {
  const xpGained = numTaskRewards(state, task);

  heroesAllocatedToTask(task).forEach((hero) => {
    gainTaskXp(state, hero, task, xpGained * hero.stats.progress);
    gainXp(state, hero, xpGained * (1 + taskBonusForHero(hero, task)));
    updateHero(state, hero);
  });
}

function gainStat(
  state: GameState,
  hero: GameHero,
  stat: GameHeroStat,
  val = 1,
): void {
  hero.stats[stat] += Math.floor(val);
}

function levelup(state: GameState, hero: GameHero): void {
  const rng = seededrng(hero.id + ' ' + hero.level);

  function statBoost(val = 1) {
    return Math.round(rng() * val);
  }

  gainStat(state, hero, 'health', statBoost(5));
  gainStat(state, hero, 'force', statBoost(1));
  gainStat(state, hero, 'piety', statBoost(1));
  gainStat(state, hero, 'progress', statBoost(1));
  gainStat(state, hero, 'resistance', statBoost(1));
  gainStat(state, hero, 'speed', statBoost(1));
}

function gainTaskXp(
  state: GameState,
  hero: GameHero,
  task: GameTask,
  xp = 1,
): void {
  if (hero.taskLevels[task.id] >= task.maxLevel) return;

  hero.taskXp ??= {};

  hero.taskLevels[task.id] ??= 0;
  hero.taskXp[task.id] ??= 0;

  hero.taskXp[task.id] += xp;

  if (hero.taskXp[task.id] >= task.xpRequiredPerLevel) {
    hero.taskXp[task.id] = 0;
    hero.taskLevels[task.id] += 1;
  }
}

function gainXp(state: GameState, hero: GameHero, xp = 1): void {
  if (hero.level >= hero.maxLevel) return;

  hero.xp += xp;

  if (hero.xp >= hero.maxXp) {
    hero.maxXp = maxXpForLevel(hero.level + 1);
    hero.xp = 0;
    hero.level += 1;

    levelup(state, hero);
  }
}

function maxXpForLevel(level: number): number {
  return level * 100;
}

export function doHeroGameloop(): void {
  const state = gamestate();

  Object.values(state.heroes).forEach((hero) => {
    if (!state.taskAssignments[hero.id]) return;

    const task = getEntry<GameTask>(state.taskAssignments[hero.id]);
    if (!task) return;

    // boost speed, track action
    applyHeroSpeed(state, hero, task);
    if (!canApplyDamageToTask(state, hero, task)) return;
    resetHeroSpeed(state, hero);

    // if we've met the terms, we can do damage
    applyHeroForce(state, hero, task);

    if (!isTaskFinished(state, task)) return;

    // finish the task, reset it, give the task doers a reward
    finalizeTask(state, task);
    rewardTaskDoers(state, task);
    resetTask(state, task);
  });

  setGameState(state);
}
