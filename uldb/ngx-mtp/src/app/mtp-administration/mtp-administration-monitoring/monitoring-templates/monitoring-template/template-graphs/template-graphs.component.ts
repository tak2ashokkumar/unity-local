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
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TemplateMetricsService } from '../template-metrics/template-metrics.service';
import { TemplateGraphViewData, TemplateGraphs, TemplateGraphsService, TemplateMetrics, TemplateMetricsListViewData } from './template-graphs.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';

@Component({
  selector: 'template-graphs',
  templateUrl: './template-graphs.component.html',
  styleUrls: ['./template-graphs.component.scss'],
  providers: [TemplateGraphsService, TemplateMetricsService]
})
export class TemplateGraphsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  subscr: Subscription;
  templateId: string;
  componentId: string;
  currentCriteria: SearchCriteria;
  isDefaultTemplate: boolean = true;

  count: number;
  graphs: TemplateGraphs[] = []
  viewData: TemplateGraphViewData[] = []
  selectedView: TemplateGraphViewData;

  action: 'Add' | 'Edit';
  metrics: Array<TemplateMetrics> = [];
  metricsViewData: TemplateMetricsListViewData[] = [];
  @ViewChild('create') create: ElementRef;
  createForm: FormGroup;
  createFormErrors: any;
  createFormValidationMessages: any;
  nonFieldErr: string = '';
  modalRef: BsModalRef;
  @ViewChild('confirm') confirm: ElementRef;
  delModalRef: BsModalRef;

  tenantListSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    keyToSelect: 'item_id',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };

  myTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'item selected',
    checkedPlural: 'items selected',
    searchPlaceholder: 'Find',
    defaultTitle: 'Select',
    allSelected: 'All selected',
  };
  constructor(private modalService: BsModalService,
    private router: Router,
    private route: ActivatedRoute,
    private graphService: TemplateGraphsService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private refreshService: DataRefreshBtnService) {
    this.route.parent.paramMap.subscribe(params => {
      this.templateId = params.get('id');
      this.componentId = params.get('componentId');
    });
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        let activeRoute = event.url.split('/').pop();
        if (activeRoute == 'graphs') {
          this.refreshData();
        }
      }
    });
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
  }

  ngOnInit(): void {
    this.getTemplateMetrics();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    if(this.subscr){
      this.subscr.unsubscribe();
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getTemplatesGraphs();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getTemplatesGraphs();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getTemplatesGraphs();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getTemplatesGraphs();
  }

  refreshData() {
    this.spinner.start('main');
    this.getTemplatesGraphs();
  }

  getTemplatesGraphs() {
    this.graphService.getGraphs(this.templateId, this.componentId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.graphs = res.results;
      if (this.graphs.length) {
        this.viewData = this.graphService.convertToViewData(this.graphs);
        this.isDefaultTemplate = _clone(this.viewData.getFirst().isDefault);
      } else {
        this.viewData = [];
        this.isDefaultTemplate = false;
      }
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
    });
  }

  createGraph() {
    this.selectedView = null;
    this.buildCreateForm()
    this.action = 'Add';
    this.modalRef = this.modalService.show(this.create, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }))
  }

  editGraph(index: number) {
    this.selectedView = this.viewData[index];
    this.nonFieldErr = '';
    this.action = 'Edit';
    this.buildCreateForm()
    this.modalRef = this.modalService.show(this.create, Object.assign({}, { class: 'modal-md', keyboard: true, ignoreBackdropClick: true }));
  }

  buildCreateForm() {
    this.createForm = this.graphService.buildCloneForm(this.selectedView);
    this.createFormErrors = this.graphService.resetFormErrors();
    this.createFormValidationMessages = this.graphService.validationMessages;
  }

  onSubmit() {
    if (this.createForm.invalid) {
      this.createFormErrors = this.utilService.validateForm(this.createForm, this.createFormValidationMessages, this.createFormErrors);
      this.createForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.createFormErrors = this.utilService.validateForm(this.createForm, this.createFormValidationMessages, this.createFormErrors); });
    }
    else {
      if (this.action == 'Edit') {
        this.spinner.start('main');
        this.graphService.update(this.componentId, this.selectedView.graphId, this.createForm.getRawValue(),).pipe((takeUntil(this.ngUnsubscribe))).subscribe(res => {
          this.modalRef.hide();
          this.getTemplatesGraphs();
          this.notification.success(new Notification('Graph Created Successfully'));
          this.spinner.stop('main');
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
          this.spinner.stop('main');
          this.notification.error(new Notification(' Failed to update Graph. Please try again.'));
        });
      }
      else {
        this.spinner.start('main');
        this.graphService.create(this.componentId, this.createForm.getRawValue()).pipe((takeUntil(this.ngUnsubscribe))).subscribe(res => {
          this.modalRef.hide();
          this.getTemplatesGraphs();
          this.notification.success(new Notification('Graph Created Successfully'));
          this.spinner.stop('main');
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
          this.spinner.stop('main');
          this.notification.error(new Notification(' Failed to create graph. Please try again.'));
        });
      }
    }
  }

  handleError(err: any) {
    this.createFormErrors = this.graphService.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err.detail) {
      this.nonFieldErr = err.detail;
    } else if (err) {
      if (isString(err)) {
        this.nonFieldErr = err;
      }
      for (const field in err) {
        if (field in this.createForm.controls) {
          this.createFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.modalRef.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  deletePanelDevice(view: TemplateGraphViewData) {
    this.selectedView = view;
    this.delModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  getTemplateMetrics() {
    this.graphService.getMetrics(this.templateId, this.componentId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.metrics = res;
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
    });
  }

  confirmDelete() {
    this.delModalRef.hide();
    this.spinner.start('main');
    this.graphService.delete(this.componentId, this.selectedView.graphId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.spinner.stop('main');
      this.notification.success(new Notification('Graph deleted successfully.'));
      this.getTemplatesGraphs();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification(' Failed to delete graph. Please try again.'));
    })
  }
}
