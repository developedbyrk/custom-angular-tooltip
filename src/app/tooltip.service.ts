import { Overlay, OverlayRef, PositionStrategy } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Injectable, Injector, TemplateRef } from '@angular/core';
import { CustomTooltipComponent } from './custom-tooltip/custom-tooltip.component';

@Injectable({
  providedIn: 'root',
})
export class TooltipService {
  private overlayRef?: OverlayRef;
  private currentTriggerElement?: HTMLElement;
  private tooltipClass?: string;

  constructor(private overlay: Overlay, private injector: Injector) {}

  showTooltip(
    triggerElement: HTMLElement,
    content: string | TemplateRef<any> | null,
    customClass?: string
  ) {
    const sameTrigger = this.currentTriggerElement === triggerElement;

    // Always close the existing tooltip first
    this.hideTooltip();

    // Only open new tooltip if this is a different trigger or was just closed
    if (!sameTrigger) {
      this.currentTriggerElement = triggerElement;
      this.tooltipClass = customClass;

      const positionStrategy = this.getPositionStrategy(triggerElement);
      this.overlayRef = this.overlay.create({
        positionStrategy,
        panelClass: customClass || '',
      });

      const shouldScroll = this.shouldMakeScrollable(content);

      const tooltipPortal = new ComponentPortal(
        CustomTooltipComponent,
        null,
        this.createInjector(content, shouldScroll)
      );
      this.overlayRef.attach(tooltipPortal);
    }
  }

  hideTooltip() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = undefined;
    }

    this.currentTriggerElement = undefined;
    this.tooltipClass = undefined;
  }

  getTriggerElement(): HTMLElement | undefined {
    return this.currentTriggerElement;
  }

  private createInjector(
    content: string | TemplateRef<unknown> | null,
    shouldScroll: boolean
  ): Injector {
    return Injector.create({
      providers: [
        { provide: 'tooltipContent', useValue: content },
        { provide: 'shouldScroll', useValue: shouldScroll },
      ],
      parent: this.injector,
    });
  }

  private getPositionStrategy(triggerElement: HTMLElement): PositionStrategy {
    const elementRect = triggerElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - elementRect.bottom;
    const spaceAbove = elementRect.top;

    let positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(triggerElement);

    if (spaceBelow >= 200 || spaceBelow >= spaceAbove) {
      positionStrategy = positionStrategy.withPositions([
        {
          originX: 'center',
          originY: 'bottom',
          overlayX: 'center',
          overlayY: 'top',
        },
      ]);
    } else {
      positionStrategy = positionStrategy.withPositions([
        {
          originX: 'center',
          originY: 'top',
          overlayX: 'center',
          overlayY: 'bottom',
        },
      ]);
    }

    return positionStrategy;
  }

  private shouldMakeScrollable(
    content: string | TemplateRef<unknown> | null
  ): boolean {
    if (typeof content === 'string') {
      return content.length > 100;
    } else if (content instanceof TemplateRef) {
      return true;
    }
    return false;
  }
}
