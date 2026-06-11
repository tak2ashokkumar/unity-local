import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { MonitoringTemplates, TemplateViewData } from '../monitoring-template.service';
import { MetricTriggers, MetricTriggersViewData, TemplateTriggersService, ToggleStatus } from './template-triggers.service';

@Component({
  selector: 'template-triggers',
  templateUrl: './template-triggers.component.html',
  styleUrls: ['./template-triggers.component.scss'],
  providers: [TemplateTriggersService]
})
export class TemplateTriggersComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  templateId: string;

  @ViewChild('create') create: ElementRef;
  modalRef: BsModalRef;
  delModalRef: BsModalRef;
  @ViewChild('confirm') confirm: ElementRef;
  currentCriteria: SearchCriteria;
  triggers: MetricTriggers[] = [];
  viewData: MetricTriggersViewData[] = []
  statusButton: string;
  count: number;
  templates: MonitoringTemplates[] = [];
  templateViewData: TemplateViewData[] = []
  templateData: TemplateViewData;
  selectedTriggersID: number;
  selectedFilter: string;
  toggleStatus: ToggleStatus = {
    status: ''
  };

  constructor(private modalService: BsModalService,
    private route: ActivatedRoute,
    private triggerService: TemplateTriggersService,
    private spinnerService: AppSpinnerService,
    private notification: AppNotificationService) {
    this.route.parent.paramMap.subscribe(params => this.templateId = params.get('id'));
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ search: '' }] };
  }

  ngOnInit(): void {
    this.spinnerService.start('main');

    this.getTriggers()
  }
  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getTriggers() {
    this.triggerService.getTriggers(this.currentCriteria, this.templateId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.triggers = res.results;
      this.count = res.count;
      this.viewData = this.triggerService.convertToViewData(this.triggers);
      this.spinnerService.stop('main');
    }, err => {
      this.spinnerService.stop('main');
    });
  }

  onFilterChange() {
    if (this.selectedFilter === 'enabled') {
      this.filterTemplates('enabled');
    } else if (this.selectedFilter === 'disabled') {
      this.filterTemplates('disabled');
    }
  }

  filterTemplates(type: string) {
    this.viewData = this.triggerService.convertToViewData(this.triggers.filter(metric => metric.status === type));
  }

  filterTemplatesSeverity(type: string) {
    this.viewData = this.triggerService.convertToViewData(this.triggers.filter(metric => metric.severity === type));
  }



  toggle(itemId: number, status: string) {
    this.toggleStatus.status = status;
    this.spinnerService.start('main');
    this.triggerService.put(itemId, this.toggleStatus).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.spinnerService.stop('main');
      this.notification.success(new Notification('Status successfully set.'));
      this.getTriggers();
    }, (err: HttpErrorResponse) => {
      this.spinnerService.stop('main');
      this.notification.error(new Notification(' Failed to set status. Please try again.'));
    })

  }


  // templateDefaultStatus() {
  //   this.templateService.getTemplates().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
  //     this.templates = res.results;
  //     this.templateViewData = this.templateService.convertToViewData(this.templates);
  //     this.templateData = this.templateViewData.find(template => template.templateID === Number(this.tempID))
  //     this.getTriggers()
  //     this.spinnerService.stop('main');
  //   }, err => {
  //     this.spinnerService.stop('main');
  //   });
  // }

  decideSeverityColor(severity: string) {
    if (severity === 'Information' || 'Average' || 'Not Classified') return 'text-primary'
    else if (severity === 'Warning' || 'High') return 'text-warning'
    else return 'text-danger'
  }

  // onFilterChange() {
  //   if (this.selectedFilter === 'enabled') {
  //     this.filterTemplates('enabled');
  //   } else if (this.selectedFilter === 'disabled') {
  //     this.filterTemplates('disabled');
  //   }
  // }

  // filterTemplates(type: string) {
  //   this.viewData = this.metricsService.convertToViewData(this.metrics.filter(metric => metric.status === type), this.templateData.templateIsDefault);
  // }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getTriggers();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getTriggers();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getTriggers();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getTriggers();
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.getTriggers();
  }

  changeStatusView(status: string) {
    this.statusButton = status;
  }

  createTrigger() {
    this.modalRef = this.modalService.show(this.create, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  deletePanelDevice(view: MetricTriggersViewData) {
    this.selectedTriggersID = view.triggerId;
    this.delModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }


  confirmDelete() {
    this.delModalRef.hide();
    this.spinnerService.start('main');
    this.triggerService.delete(this.selectedTriggersID).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.spinnerService.stop('main');
      this.notification.success(new Notification('Trigger deleted successfully.'));
      this.getTriggers();
    }, (err: HttpErrorResponse) => {
      this.spinnerService.stop('main');
      this.notification.error(new Notification(' Failed to delete Trigger. Please try again.'));
    })
  }



}
