import { Component, computed, input, output } from '@angular/core';
import { NgIconComponent, provideIcons } from '@ng-icons/core';
import { tablerTag } from '@ng-icons/tabler-icons';
import { TippyDirective } from '@ngneat/helipopper';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { startCase } from 'lodash';
import { HeroSpecialGlowDirective } from '../../directives/hero-special-glow.directive';
import { HideResearchDirective } from '../../directives/hideresearch.directive';
import {
  canGiveClickXp,
  canUseItemsOnHero,
  clickXpBoost,
  gamestate,
  getHero,
  giveClickXp,
  hasAnyitemsToUse,
  notifyError,
  removeHero,
  renameHero,
  setHeroDamageType,
} from '../../helpers';
import { GameHero } from '../../interfaces';
import { ButtonCloseComponent } from '../button-close/button-close.component';
import { DamageTypeComponent } from '../damage-type/damage-type.component';
import { HeroArchetypeListComponent } from '../hero-archetype-list/hero-archetype-list.component';
import { HeroArtComponent } from '../hero-art/hero-art.component';
import { HeroAssignmentComponent } from '../hero-assignment/hero-assignment.component';
import { HeroLevelTaglineComponent } from '../hero-level-tagline/hero-level-tagline.component';
import { HeroStatsTableComponent } from '../hero-stats-table/hero-stats-table.component';
import { HeroStatusComponent } from '../hero-status/hero-status.component';
import { HeroTaskLevelListComponent } from '../hero-task-level-list/hero-task-level-list.component';

@Component({
  selector: 'app-hero-display-tall',
  imports: [
    DamageTypeComponent,
    HeroArtComponent,
    HeroArchetypeListComponent,
    HeroStatsTableComponent,
    HeroAssignmentComponent,
    HeroLevelTaglineComponent,
    HeroTaskLevelListComponent,
    SweetAlert2Module,
    ButtonCloseComponent,
    TippyDirective,
    HeroSpecialGlowDirective,
    HeroStatusComponent,
    HideResearchDirective,
    NgIconComponent,
  ],
  providers: [
    provideIcons({
      tablerTag,
    }),
  ],
  templateUrl: './hero-display-tall.component.html',
  styleUrl: './hero-display-tall.component.scss',
})
export class HeroDisplayTallComponent {
  public hero = input.required<GameHero>();
  public close = output<void>();
  public showItemPanel = output<void>();

  public liveHeroData = computed(() => getHero(this.hero().id));

  public canEditHeroStats = computed(
    () => this.hero()?.id === gamestate().townSetup.heroId,
  );

  public canDismissHero = computed(
    () => this.hero().id !== gamestate().townSetup.heroId,
  );

  public xpOnClick = computed(() => clickXpBoost());

  public hasItems = computed(() => hasAnyitemsToUse());

  public canUseItemsOnThisHero = computed(() => canUseItemsOnHero(this.hero()));

  public changeMainCharacterType(newType: string) {
    const hero = this.hero();
    if (!hero) return;

    setHeroDamageType(hero, newType);
  }

  public dismissHero() {
    removeHero(this.hero());
    this.close.emit();
  }

  public renameHero(newName: string) {
    const name = startCase(newName.replace(/[^A-Za-z ]+/g, ''));
    if (name.length === 0) {
      notifyError('That name is not valid!');
      return;
    }

    renameHero(this.hero().id, name);
  }

  public canGiveClickXp(): boolean {
    return gamestate().cooldowns.nextClickResetTime <= 0 && canGiveClickXp();
  }

  public giveXp() {
    giveClickXp(this.hero());
  }
}
