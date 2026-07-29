import { Component, Input, OnChanges } from '@angular/core';
import { TabData } from 'src/app/shared/tabdata';

export interface ContainerResourceSection {
  heading: string;
  items: TabData[];
}

@Component({
  selector: 'container-resource-accordion',
  templateUrl: './container-resource-accordion.component.html',
  styleUrls: ['./container-resource-accordion.component.scss']
})
export class ContainerResourceAccordionComponent implements OnChanges {
  // One section per controller type. A single section renders static/always-open
  // (heading + resource list); multiple sections behave as a collapsible accordion
  // where only one section is open at any time.
  @Input() sections: ContainerResourceSection[] = [];
  // Heading of the section to keep open (multi-section only). The shell sets this
  // from the active route so the section holding the current resource stays open.
  @Input() activeHeading: string;

  openHeading: string;

  ngOnChanges() {
    if (this.sections.length > 1 && this.activeHeading) {
      this.openHeading = this.activeHeading;
    }
  }

  toggle(heading: string) {
    // Multi-section: open the clicked section and close the others, so exactly one
    // section stays open at any time. A single section is static and non-collapsible.
    if (this.sections.length > 1) {
      this.openHeading = heading;
    }
  }

  isSectionOpen(heading: string): boolean {
    return this.sections.length <= 1 || this.openHeading === heading;
  }
}
