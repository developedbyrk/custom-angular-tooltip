import {
  Component,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { TooltipDirective } from './tooltip.directive';
// import { RouterOutlet } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    // RouterOutlet,
    TooltipDirective,
    MatTooltipModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'custom-tooltip';

  @ViewChild('tooltipContent', { static: true })
  tooltipContent!: TemplateRef<any>;

  constructor() {}
}
