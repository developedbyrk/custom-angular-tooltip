import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  TemplateRef,
} from '@angular/core';
import { TooltipService } from './tooltip.service';

@Directive({
  selector: '[appTooltip]',
  standalone: true,
})
export class TooltipDirective {
  @Input('appTooltip')
  content!: string | TemplateRef<any>;

  constructor(private el: ElementRef, private tooltipService: TooltipService) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.tooltipService.showTooltip(this.el.nativeElement, this.content);
    document.addEventListener('click', this.onDocumentClick.bind(this));
  }

  @HostListener('mouseleave') onMouseLeave() {
    if (!this.isScrollable()) {
      this.tooltipService.hideTooltip();
      document.removeEventListener('click', this.onDocumentClick.bind(this));
    }
  }

  private isScrollable(): boolean {
    return (
      (typeof this.content === 'string' && this.content.length > 100) ||
      this.content instanceof TemplateRef
    ); // Adjust this condition as needed
  }

  private onDocumentClick(event: Event) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.tooltipService.hideTooltip();
      document.removeEventListener('click', this.onDocumentClick.bind(this));
    }
  }
}
