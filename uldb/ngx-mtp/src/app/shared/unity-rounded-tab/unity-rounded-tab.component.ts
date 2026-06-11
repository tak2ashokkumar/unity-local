import { Component, ContentChild, Input, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'unity-rounded-tab',
  templateUrl: './unity-rounded-tab.component.html',
  styleUrls: ['./unity-rounded-tab.component.scss']
})
export class UnityRoundedTabComponent implements OnInit {
  @Input('tabItems') tabItems: RoundedTabDataType[] = [];
  @ContentChild(TemplateRef) templateRef: TemplateRef<any>;

  constructor(private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit(): void {
  }

  isActive(url: string) {
    if (this.router.url.match(url)) {
      return 'active';
    }
  }

  goTo(tab: RoundedTabDataType) {
    if (!tab.disabled && !this.router.url.match(tab.url)) {
      this.router.navigate([tab.url], { relativeTo: this.route });
    }
  }
}

export interface RoundedTabDataType {
  name: string;
  url: string;
  disabled?: boolean;
}