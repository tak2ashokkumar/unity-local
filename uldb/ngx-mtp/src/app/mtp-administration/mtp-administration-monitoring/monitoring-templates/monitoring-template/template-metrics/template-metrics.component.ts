import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { cloneDeep as _clone, isString } from 'lodash-es';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TemplateMetricViewData, TemplateMetrics, TemplateMetricsService } from './template-metrics.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';

@Component({
  selector: 'template-metrics',
  templateUrl: './template-metrics.component.html',
  styleUrls: ['./template-metrics.component.scss'],
  providers: [TemplateMetricsService]
})
export class TemplateMetricsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  subscr: Subscription;
  templateId: string;
  componentId: string;
  currentCriteria: SearchCriteria;
  isDefaultTemplate: boolean = true;

  count: number;
  metrics: TemplateMetrics[] = [];
  viewData: TemplateMetricViewData[] = [];
  selectedView: TemplateMetricViewData = new TemplateMetricViewData();

  @ViewChild('itemInfoRef') itemInfoRef: ElementRef;
  @ViewChild('confirm') confirm: ElementRef;
  modalRef: BsModalRef;

  cloneForm: FormGroup;
  cloneFormErrors: any;
  cloneValidationMessages: any;
  nonFieldErr: any;
  constructor(private metricsService: TemplateMetricsService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private modalService: BsModalService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private refreshService: DataRefreshBtnService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ status: '' }] };
    this.route.parent.paramMap.subscribe(params => {
      this.templateId = params.get('id');
      this.componentId = params.get('componentId');
    });
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        let activeRoute = event.url.split('/').pop();
        if (activeRoute == 'metrics') {
          this.refreshData();
        }
      }
    });
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
  }

  ngOnInit(): void { }

  ngOnDestroy() {
    this.spinner.stop('main');
    if (this.subscr) {
      this.subscr.unsubscribe();
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getMetrics();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getMetrics();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getMetrics();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getMetrics();
  }

  refreshData() {
    this.spinner.start('main');
    this.isDefaultTemplate = true;
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ status: '' }] };
    this.getMetrics();
  }

  getMetrics() {
    this.metricsService.getMetrics(this.currentCriteria, this.templateId, this.componentId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.metrics = res.results;
      if (this.metrics.length) {
        this.viewData = this.metricsService.convertToViewData(this.metrics);
        this.isDefaultTemplate = _clone(this.viewData.getFirst().isDefault);
      } else {
        this.viewData = [];
      }
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
    });
  }

  onFilterChange() {
    this.spinner.start('main');
    this.currentCriteria.pageNo = 1;
    this.getMetrics();
  }

  toggleStatus(itemId: number, status: string) {
    this.spinner.start('main');
    this.metricsService.toggleStatus(itemId, status, this.componentId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.getMetrics();
      this.spinner.stop('main');
      this.notification.success(new Notification('Status successfully set.'));
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification(' Failed to set status. Please try again.'));
    })
  }

  goToTriggers(metricId: string) {
    // this.itemKeyEmitter.emit(itemKey);
  }

  deletePanelDevice(view: TemplateMetricViewData) {
    this.selectedView = view;
    this.modalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.modalRef.hide();
    this.spinner.start('main');
    this.metricsService.delete(this.selectedView.itemId, this.componentId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.spinner.stop('main');
      this.notification.success(new Notification('Metric deleted successfully.'));
      this.getMetrics();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification(' Failed to delete Metric. Please try again.'));
    })
  }

  showInfo(view: TemplateMetricViewData) {
    this.selectedView = view;
    this.modalRef = this.modalService.show(this.itemInfoRef, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
  }

  handleError(err: any) {
    this.cloneFormErrors = this.metricsService.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err.detail) {
      this.nonFieldErr = err.detail;
    } else if (err) {
      if (isString(err)) {
        this.nonFieldErr = err;
      }
      for (const field in err) {
        if (field in this.cloneForm.controls) {
          this.cloneFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.modalRef.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  buildChangeForm() {
    this.cloneForm = this.metricsService.buildChangeForm(null, null);
    this.cloneFormErrors = this.metricsService.resetFormErrors();
    this.cloneValidationMessages = this.metricsService.validationMessages;
  }

  onSubmitEvent(view: TemplateMetricViewData) {
    if (view.eventForm.invalid) {
      // view.isError = true;
      view.eventFormErrors = this.utilService.validateForm(view.eventForm, view.eventValidationMessages, view.eventFormErrors);
      view.eventForm.valueChanges
        .subscribe((e: any) => { view.eventFormErrors = this.utilService.validateForm(view.eventForm, view.eventValidationMessages, view.eventFormErrors); });
    } else {
      this.spinner.start('main');
      if (view.itemId) {
        this.metricsService.edit(view.itemId, view.eventForm.getRawValue(), this.componentId).pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(res => {
            this.getMetrics();
            this.notification.success(new Notification('Metric updated successfully'));
            view.onForm = false;
            this.spinner.stop('main');
          }, (err: HttpErrorResponse) => {
            this.handleError(err.error);
          });
      }
    }
  }

  onEditEvent(index: number) {
    this.buildChangeForm();
    this.viewData[index].onForm = true;
    for (let i = 0; i < this.viewData.length; i++) {
      if (index != i) {
        this.viewData[i].onForm = false;
      }
    }
  }
}
