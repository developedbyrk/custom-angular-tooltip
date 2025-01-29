import {
  Component,
  Inject,
  TemplateRef,
  ElementRef,
  ViewChild,
  AfterViewInit,
  Renderer2,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipService } from '../tooltip.service';

@Component({
  selector: 'app-custom-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-tooltip.component.html',
  styleUrls: ['./custom-tooltip.component.scss'], // Correct SCSS reference
})
export class CustomTooltipComponent implements AfterViewInit, OnDestroy {
  @ViewChild('tooltipContent', { static: true }) tooltipContentRef!: ElementRef;

  isContentScrollable: boolean = false;
  private mouseLeaveListener?: () => void;

  constructor(
    @Inject('tooltipContent') public content: string | TemplateRef<any>,
    private tooltipService: TooltipService,
    private renderer: Renderer2
  ) {}

  isTemplate(content: any): content is TemplateRef<any> {
    return content instanceof TemplateRef;
  }

  ngAfterViewInit(): void {
    this.checkIfScrollable();
    this.applyOpenClass();
  }

  ngOnDestroy(): void {
    this.removeMouseLeaveListener();
  }

  private checkIfScrollable(): void {
    setTimeout(() => {
      const tooltipElement = this.tooltipContentRef
        .nativeElement as HTMLElement;
      const contentText = tooltipElement.textContent || '';
      const contentHeight = tooltipElement.scrollHeight;

      if (contentHeight > 200 || contentText.length > 600) {
        this.isContentScrollable = true;
      } else {
        this.attachMouseLeaveListener();
      }
    }, 0); // Ensure DOM has updated
  }

  private applyOpenClass(): void {
    // Add the "open" class to trigger the animation after content is rendered
    setTimeout(() => {
      const tooltipElement = this.tooltipContentRef.nativeElement;
      tooltipElement.classList.add('open');
    }, 0); // Delay to ensure the tooltip content is loaded
  }

  private attachMouseLeaveListener(): void {
    const triggerElement = this.tooltipService.getTriggerElement();
    if (triggerElement) {
      // Attach the mouseleave listener using Renderer2
      this.mouseLeaveListener = this.renderer.listen(
        triggerElement,
        'mouseleave',
        () => {
          this.tooltipService.hideTooltip();
        }
      );
    }
  }

  private removeMouseLeaveListener(): void {
    if (this.mouseLeaveListener) {
      this.mouseLeaveListener(); // Remove the listener
      this.mouseLeaveListener = undefined;
    }
  }

  closeTooltip() {
    this.tooltipService.hideTooltip();
  }
}
