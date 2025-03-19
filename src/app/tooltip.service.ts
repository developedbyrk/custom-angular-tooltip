import {
  Injectable,
  Injector,
  ApplicationRef,
  TemplateRef,
} from '@angular/core';
import { Overlay, OverlayRef, PositionStrategy } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { CustomTooltipComponent } from './custom-tooltip/custom-tooltip.component';

@Injectable({
  providedIn: 'root',
})
export class TooltipService {
  private overlayRef?: OverlayRef;
  private currentTriggerElement?: HTMLElement;

  constructor(private overlay: Overlay, private injector: Injector) {}

  showTooltip(triggerElement: HTMLElement, content: string | TemplateRef<any>, customClass?: string) {
    // Prevent reloading the tooltip if it's already open for the same element
    if (this.overlayRef && this.currentTriggerElement === triggerElement) {
      return;
    }

    this.hideTooltip(); // Close any existing tooltip before opening a new one
    this.currentTriggerElement = triggerElement; // Store the trigger element

    const positionStrategy = this.getPositionStrategy(triggerElement);
    this.overlayRef = this.overlay.create({
      positionStrategy,
      panelClass: customClass || '',
    });

    const shouldScroll = this.shouldMakeScrollable(content); // Determine if the tooltip should be scrollable

    const tooltipPortal = new ComponentPortal(
      CustomTooltipComponent,
      null,
      this.createInjector(content, shouldScroll) // Pass the shouldScroll value
    );
    this.overlayRef.attach(tooltipPortal);
  }

  hideTooltip() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = undefined;
    }
    this.currentTriggerElement = undefined; // Clear the trigger element
  }

  /**
   * Returns the current trigger element.
   */
  getTriggerElement(): HTMLElement | undefined {
    return this.currentTriggerElement;
  }

  private createInjector(
    content: string | TemplateRef<any>,
    shouldScroll: boolean
  ): Injector {
    return Injector.create({
      providers: [
        { provide: 'tooltipContent', useValue: content },
        { provide: 'shouldScroll', useValue: shouldScroll }, // Pass the shouldScroll value
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
      // Position below
      positionStrategy = positionStrategy.withPositions([
        {
          originX: 'center',
          originY: 'bottom',
          overlayX: 'center',
          overlayY: 'top',
        },
      ]);
    } else {
      // Position above
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

  private shouldMakeScrollable(content: string | TemplateRef<any>): boolean {
    // Check if content is scrollable based on length or height
    if (typeof content === 'string') {
      return content.length > 100; // Adjust this logic based on your needs
    } else if (content instanceof TemplateRef) {
      // You can apply a custom check for TemplateRef content if needed
      return true; // Assuming you always want to scroll for TemplateRef content
    }
    return false;
  }
}
