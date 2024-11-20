import { Signal, signal, WritableSignal } from '@angular/core';
import { cloneDeep } from 'lodash';
import { GameState } from '../interfaces';

export function blankGameState(): GameState {
  return {
    heroes: {},
    researchProgress: {},
    heroCurrentTaskSpeed: {},
    taskProgress: {},
    taskAssignments: {},
    taskUpgrades: {},
    resources: {},
    activeResearch: '',
    recruitment: {
      recruitableHeroes: [],
      numRerolls: 0,
    },
    cooldowns: {
      nextDefenseAttackTime: 0,
      nextClickResetTime: 0,
      nextShopResetTime: 0,
      nextRecruitResetTime: 0,
    },
    defense: {
      numAttacks: -1,
      incomingDamage: 0,
      damageTypeId: '',
      targettedTaskIds: [],
    },
    townSetup: {
      hasDoneSetup: false,
      heroId: '',
      heroName: '',
      townName: '',
    },
    shop: {
      ownedItems: {},
      shopItems: [],
      numRerolls: 0,
    },
    meta: {
      version: 1,
      isPaused: false,
      difficulty: 'normal',
      createdAt: Date.now(),
      numTicks: 0,
    },
  };
}

const _gamestate: WritableSignal<GameState> = signal(blankGameState());
export const gamestate: Signal<GameState> = _gamestate.asReadonly();

export function setGameState(state: GameState): void {
  _gamestate.set(cloneDeep(state));
}

export function updateGamestate(func: (state: GameState) => GameState): void {
  _gamestate.update(func);
}
