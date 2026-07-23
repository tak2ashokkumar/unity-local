import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap, UrlSegment, NavigationEnd } from '@angular/router';
import { TabData } from 'src/app/shared/tabdata';
import { Subscription } from 'rxjs';

@Component({
  selector: 'kubernetes-tabs',
  templateUrl: './kubernetes-tabs.component.html',
  styleUrls: ['./kubernetes-tabs.component.scss']
})
export class KubernetesTabsComponent implements OnInit {
  controllerId: string;
  tabData: TabData[] = tabData;
  tabItems: TabData[] = [];
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
      if (this.controllerId) {
        this.buildTabItems();
      }
    });
  }

  ngOnInit() { }

  buildTabItems() {
    let url = this.router.url.split('?')[0];
    let idx = url.indexOf(this.controllerId);
    let base = idx > -1 ? url.substring(0, idx + this.controllerId.length) : url;
    this.tabItems = this.tabData.map(t => ({ name: t.name, url: base + '/' + t.url }));
  }

  isActive(tab: TabData) {
    const url = this.router.url.split('?')[0];
    const isMatch = url.endsWith('/' + tab.url) || url.includes('/' + tab.url + '/');
    return isMatch ? 'active text-success' : '';
  }

  goTo(tab: TabData) {
    if (this.controllerId) {
      this.router.navigate([tab.url], { relativeTo: this.route });
    } else {
      this.router.navigate(['/unitycloud/devices/kubernetes', tab.url]);
    }
  }

  goBack() {
    let backSteps = this.route.snapshot.data && this.route.snapshot.data.backSteps ? this.route.snapshot.data.backSteps : 2;
    this.router.navigate(['../'.repeat(backSteps)], { relativeTo: this.route });
  }
}

const tabData: TabData[] = [
  { name: 'Nodes', url: 'nodes' },
  { name: 'Pods', url: 'pods' },
  { name: 'Namespaces', url: 'namespaces' },
  { name: 'Deployments', url: 'deployments' },
  { name: 'ReplicaSets', url: 'replicasets' },
  { name: 'DaemonSets', url: 'daemonsets' },
  { name: 'StatefulSets', url: 'statefulsets' },
  { name: 'Services', url: 'services' },
  { name: 'PersistentVolumes', url: 'persistentvolumes' },
  { name: 'PersistentVolumeClaims', url: 'persistentvolumeclaims' },
  { name: 'Events', url: 'events' },
  { name: 'ControlPlane Components', url: 'controlplane-components' },
  { name: 'StorageClasses', url: 'storageclasses' },
  { name: 'Jobs', url: 'jobs' },
  { name: 'CronJobs', url: 'cronjobs' },
  { name: 'ResourceQuotas', url: 'resourcequotas' },
  { name: 'HPAs', url: 'hpas' }
];

