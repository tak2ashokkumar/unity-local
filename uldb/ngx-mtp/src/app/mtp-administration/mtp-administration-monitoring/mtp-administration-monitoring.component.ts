import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { MtpAdministrationMonitoringService } from './mtp-administration-monitoring.service';
import { MonitoringTemplates } from './monitoring-templates/monitoring-template/monitoring-template.service';
import { MonitoringTemplatesDiscoveredComponents } from 'src/app/shared/SharedEntityTypes/monitoring.type';
import { takeUntil } from 'rxjs/operators';
import { cloneDeep as _clone } from 'lodash-es';

@Component({
  selector: 'mtp-a-administration-monitoring',
  templateUrl: './mtp-administration-monitoring.component.html',
  styleUrls: ['./mtp-administration-monitoring.component.scss'],
  providers: [MtpAdministrationMonitoringService]
})
export class MtpAdministrationMonitoringComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();
  subscr: Subscription;
  templates: MonitoringTemplates[] = [];
  activeTemplate: MonitoringTemplates;
  components: MonitoringTemplatesDiscoveredComponents[] = [];
  activeComponent: MonitoringTemplatesDiscoveredComponents;
  templateId: string;
  componentId: string;

  constructor(private router: Router,
    private route: ActivatedRoute,
    private monitoringService: MtpAdministrationMonitoringService) {
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url.split('/').pop() == 'monitoring') {
          this.router.navigate(['templates'], { relativeTo: this.route });
        }
        const url = event.url.split('/').pop();
        const lastSegment = ['metrics', 'triggers', 'graphs', 'create'];
        if (lastSegment.includes(url) && event.url.split('/').reverse()[2] == 'templates') {
          this.templateId = _clone(event.url.split('/').reverse()[1]);
          this.getTemplateComponents(this.templateId);
        } else if (lastSegment.includes(url) && event.url.split('/').reverse()[2] == 'component') {
          this.templateId = _clone(event.url.split('/').reverse()[3]);
          this.componentId = _clone(event.url.split('/').reverse()[1]);
          this.getTemplateComponents(this.templateId);
        } else if (lastSegment.includes(url) && event.url.split('/').reverse()[3] == 'component') {
          this.templateId = _clone(event.url.split('/').reverse()[4]);
          this.componentId = _clone(event.url.split('/').reverse()[2]);
          this.getTemplateComponents(this.templateId);
        } else {
          this.components = [];
          this.templateId = null;
          this.componentId = null;
        }
      }
    });
  }

  ngOnInit(): void {
    this.getTemplates();
  }

  ngOnDestroy(): void {
    if (this.subscr) {
      this.subscr.unsubscribe();
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getTemplates() {
    this.templates = [];
    this.monitoringService.getTemplates().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.templates = res;
      let activeTemplate = this.templates.find(t => t.template_id == Number(this.templateId));
      if (activeTemplate) {
        this.activeTemplate = _clone(activeTemplate);
      }
    }, err => {
    });
  }

  getTemplateComponents(templateId: string) {
    this.components = [];
    this.monitoringService.getTemplateComponents(Number(templateId)).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.components = res;
      let activeComponent = this.components.find(c => c.discovery_rule_id == Number(this.componentId));
      if (activeComponent) {
        this.activeComponent = _clone(activeComponent);
      }
    });
  }

  goToTemplate(templateId: string) {
    if (Number(templateId)) {
      this.router.navigate(['templates', templateId, 'metrics'], { relativeTo: this.route });
    } else {
      this.router.navigate(['templates'], { relativeTo: this.route });
    }
  }

  goToComponent(componentId: string) {
    if (!this.templateId) {
      return;
    }
    if (Number(componentId)) {
      this.router.navigate(['templates', this.templateId, 'component', componentId, 'metrics'], { relativeTo: this.route });
    } else {
      this.router.navigate(['templates', this.templateId, 'metrics'], { relativeTo: this.route });
    }
  }

  isActive(card: string) {
    if (this.router.url.match('/monitoring/' + card)) {
      return 'active text-primary bg-lb border-primary bg-colour shadow-none';
    } else {
      return 'text-muted btn-outline-light'
    }
  }

  goTo(card: string) {
    this.router.navigate([card], { relativeTo: this.route });
  }

}
