import { Component, OnInit } from '@angular/core';
import { TabData } from 'src/app/shared/tabdata';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';

@Component({
  selector: 'public-cloud-oci-overview',
  templateUrl: './public-cloud-oci-overview.component.html',
  styleUrls: ['./public-cloud-oci-overview.component.scss']
})
export class PublicCloudOciOverviewComponent implements OnInit {
  tabData: TabData[] = tabData;
  accountId: string;
  currentRouteUrl: string = '';

  constructor(private router: Router,
    private route: ActivatedRoute) {
    this.route.parent.url.subscribe((urlPath: UrlSegment[]) => {
      urlPath.forEach((path) => this.currentRouteUrl = this.currentRouteUrl.concat(path.path + '/'));
    });
    this.route.url.subscribe((urlPath: UrlSegment[]) => {
      urlPath.forEach((path) => this.currentRouteUrl = this.currentRouteUrl.concat(path.path + '/'));
    });
  }

  ngOnInit() {
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  goTo(tab: TabData) {
    this.router.navigate([tab.url], { relativeTo: this.route });
  }

  isActive(tab: TabData) {
    if (this.router.url.match(this.currentRouteUrl.concat(tab.url))) {
      return 'active text-success';
    }
    return '';
  }
}


const tabData: TabData[] = [
  {
    name: 'Virtual Machines',
    url: 'vms'
  },
  {
    name: 'Users',
    url: 'users'
  },
  {
    name: 'Storage Services',
    url: 'storage-services'
  }
];