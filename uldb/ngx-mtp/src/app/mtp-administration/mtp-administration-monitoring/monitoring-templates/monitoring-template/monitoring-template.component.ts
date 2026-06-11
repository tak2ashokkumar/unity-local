import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, UrlSegment } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { MonitoringTemplatesDiscoveredComponents } from 'src/app/shared/SharedEntityTypes/monitoring.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { MonitoringTemplateService, MonitoringTemplates } from './monitoring-template.service';

@Component({
  selector: 'monitoring-template',
  templateUrl: './monitoring-template.component.html',
  styleUrls: ['./monitoring-template.component.scss'],
  providers: [MonitoringTemplateService]
})
export class MonitoringTemplateComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  templateId: string;
  componentId: string;
  subscr: Subscription;

  count: number = 0;
  templates: MonitoringTemplates[] = [];
  activeTemplate: MonitoringTemplates;
  components: MonitoringTemplatesDiscoveredComponents[] = [];
  activeComponent: MonitoringTemplatesDiscoveredComponents;
  allTrigg: boolean = false;
  currentRouteUrl: string = '';
  reloading: boolean;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private spinnerService: AppSpinnerService,) {
    this.route.paramMap.subscribe(params => {
      this.templateId = params.get('id');
      this.componentId = params.get('componentId');
    });
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRouteUrl = '';
        this.route.parent.url.forEach((urlPath: UrlSegment[]) => {
          urlPath.forEach((path) => this.currentRouteUrl = this.currentRouteUrl.concat(path.path + '/'));
        });
        this.route.url.forEach((urlPath: UrlSegment[]) => {
          urlPath.forEach((path) => this.currentRouteUrl = this.currentRouteUrl.concat(path.path + '/'));
        });
      }
    });
  }

  ngOnInit(): void {}

  refreshData() {}

  ngOnDestroy() {
    this.spinnerService.stop('main');
    if(this.subscr){
      this.subscr.unsubscribe();
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  isActive(tab: string) {
    if (this.router.url.match(this.currentRouteUrl.concat(tab))) {
      return 'btn-primary btn-outline-primary text-white';
    } else {
      return 'btn-light btn-outline-secondary text-dark';
    }
  }

  goTo(path: string) {
    if (this.templateId && this.componentId) {
      this.router.navigate(['templates', this.templateId, 'component', this.componentId, path], { relativeTo: this.route.parent });
    } else {
      this.router.navigate([path], { relativeTo: this.route });
    }
  }

  goBackNavigation() {
    this.router.navigate(['templates'], { relativeTo: this.route.parent });
  }
}
