import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap, NavigationEnd } from '@angular/router';
import { TabData } from 'src/app/shared/tabdata';
import { Subscription } from 'rxjs';
import { ContainerResourceSection } from '../container-resource-accordion/container-resource-accordion.component';
import { KUBERNETES_RESOURCE_TABS, buildGlobalContainerSections } from '../container-resource-tabs.const';

@Component({
  selector: 'kubernetes-tabs',
  templateUrl: './kubernetes-tabs.component.html',
  styleUrls: ['./kubernetes-tabs.component.scss']
})
export class KubernetesTabsComponent implements OnInit {
  controllerId: string;
  tabData: TabData[] = KUBERNETES_RESOURCE_TABS;
  tabItems: TabData[] = [];
  sections: ContainerResourceSection[] = [];
  activeHeading: string;
  subscr: Subscription;
  constructor(private router: Router,
    private route: ActivatedRoute) {
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/unitycloud/devices/kubernetes') {
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
      this.sections = [{ heading: 'Kubernetes Resources', items: this.tabItems }];
    } else {
      // Global Devices -> Containers: one accordion with both Kubernetes and Docker
      // sections (only one open at a time), Kubernetes open by default. Docker items
      // point at the separate global 'docker' route, so the URL reads docker/...
      this.sections = buildGlobalContainerSections();
      this.activeHeading = 'Kubernetes Resources';
    }
  }

  goBack() {
    let backSteps = this.route.snapshot.data && this.route.snapshot.data.backSteps ? this.route.snapshot.data.backSteps : 2;
    this.router.navigate(['../'.repeat(backSteps)], { relativeTo: this.route });
  }
}
