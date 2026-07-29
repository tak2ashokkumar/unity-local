import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap, NavigationEnd } from '@angular/router';
import { TabData } from 'src/app/shared/tabdata';
import { Subscription } from 'rxjs';
import { ContainerResourceSection } from '../container-resource-accordion/container-resource-accordion.component';
import { DOCKER_RESOURCE_TABS, buildGlobalContainerSections } from '../container-resource-tabs.const';

@Component({
  selector: 'docker-tabs',
  templateUrl: './docker-tabs.component.html',
  styleUrls: ['./docker-tabs.component.scss']
})
export class DockerTabsComponent implements OnInit {
  controllerId: string;
  tabData: TabData[] = DOCKER_RESOURCE_TABS;
  tabItems: TabData[] = [];
  sections: ContainerResourceSection[] = [];
  activeHeading: string;
  subscr: Subscription;
  constructor(private router: Router,
    private route: ActivatedRoute) {
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/unitycloud/devices/docker') {
          this.router.navigate([event.url, this.tabData[0].url]);
        }
      }
    });
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.controllerId = params.get('controllerId');
      this.buildTabItems();
    });
  }

  ngOnInit() { }

  buildTabItems() {
    if (this.controllerId) {
      let url = this.router.url.split('?')[0];
      let idx = url.indexOf(this.controllerId);
      let base = idx > -1 ? url.substring(0, idx + this.controllerId.length) : url;
      this.tabItems = this.tabData.map(t => ({ name: t.name, url: base + '/' + t.url }));
      this.sections = [{ heading: 'Docker Resources', items: this.tabItems }];
    } else {
      // Global Devices -> Containers: one accordion with both Kubernetes and Docker
      // sections (only one open at a time), Docker open by default. Kubernetes items
      // point at the separate global 'kubernetes' route.
      this.sections = buildGlobalContainerSections();
      this.activeHeading = 'Docker Resources';
    }
  }

  goBack() {
    let backSteps = this.route.snapshot.data && this.route.snapshot.data.backSteps ? this.route.snapshot.data.backSteps : 2;
    this.router.navigate(['../'.repeat(backSteps)], { relativeTo: this.route });
  }
}
