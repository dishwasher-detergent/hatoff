import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-countdown',
  standalone: true,
  imports: [],
  templateUrl: './countdown.component.html',
  styleUrl: './countdown.component.scss',
})
export class CountdownComponent {
  public secondsLeft = input.required<number>();
  public label = input.required<string>();

  public secondsUntilReset = computed(() =>
    Math.floor(this.secondsLeft() % 60),
  );
  public minutesUntilReset = computed(() =>
    Math.floor(this.secondsLeft() / 60),
  );
}
