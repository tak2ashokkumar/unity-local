import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TabData } from 'src/app/shared/tabdata';

@Component({
  selector: 'business-service-tabs',
  templateUrl: './business-service-tabs.component.html',
  styleUrls: ['./business-service-tabs.component.scss']
})
export class BusinessServiceTabsComponent implements OnInit {
  tabItems: TabData[];
  subscr: Subscription;
  businessId: String;
  removeBg: Boolean=true;

  constructor(private router: Router,
    private route: ActivatedRoute,) {
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.businessId = this.route.snapshot.paramMap.get('businessId');
        this.tabItems = [
          { name: 'Summary', url: `/unitycloud/business-service/${this.businessId}/summary` },
          { name: 'Topology', url: `/unitycloud/business-service/${this.businessId}/topology` },
          { name: 'Cost Insights', url: `/unitycloud/business-service/${this.businessId}/cost-insights` },
        ];
        if (event.url === `/unitycloud/business-service/${this.businessId}`) {
          this.router.navigate([this.tabItems[0]?.url]);
        }
      }
    });
  }

  ngOnInit(): void {
  }

}
