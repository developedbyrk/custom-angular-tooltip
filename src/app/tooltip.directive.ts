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
  content: string | TemplateRef<unknown> | null = null;

  @Input() tooltipClass?: string;

  constructor(private el: ElementRef, private tooltipService: TooltipService) {}

  @HostListener('mouseenter')
  onMouseEnter() {
    if (!this.isMobile() && this.content != null) {
      this.tooltipService.showTooltip(
        this.el.nativeElement,
        this.content,
        this.tooltipClass
      );
      document.addEventListener('click', this.boundDocumentClickHandler);
    }
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    if (!this.isMobile() && !this.isScrollable()) {
      this.tooltipService.hideTooltip();
      document.removeEventListener('click', this.boundDocumentClickHandler);
    }
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    if (this.content != null) {
      // Always close any open tooltip when tapping anywhere
      this.tooltipService.hideTooltip();

      // Wait a tiny bit before opening new tooltip, so background flash is avoided
      setTimeout(() => {
        this.tooltipService.showTooltip(
          this.el.nativeElement,
          this.content,
          this.tooltipClass
        );
        document.addEventListener('click', this.boundDocumentClickHandler);
      }, 0);

      // Prevent double-tap highlighting on iOS/Safari
      event.preventDefault();
    }
  }

  private isMobile(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  private boundDocumentClickHandler = this.onDocumentClick.bind(this);

  private isScrollable(): boolean {
    return (
      (typeof this.content === 'string' && this.content.length > 100) ||
      this.content instanceof TemplateRef
    );
  }

  private onDocumentClick(event: Event) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.tooltipService.hideTooltip();
      document.removeEventListener('click', this.boundDocumentClickHandler);
    }
  }
}
