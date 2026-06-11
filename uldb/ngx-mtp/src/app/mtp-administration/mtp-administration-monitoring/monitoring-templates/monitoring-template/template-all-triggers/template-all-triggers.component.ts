import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { cloneDeep as _clone } from 'lodash-es';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { MetricTriggers, MetricTriggersViewData, TemplateAllTriggersService } from './template-all-triggers.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';

@Component({
  selector: 'template-all-triggers',
  templateUrl: './template-all-triggers.component.html',
  styleUrls: ['./template-all-triggers.component.scss'],
  providers: [TemplateAllTriggersService]
})
export class TemplateAllTriggersComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  subscr: Subscription;
  templateId: string;
  componentId: string;
  currentCriteria: SearchCriteria;
  isDefaultTemplate: boolean = true;

  count: number;
  triggers: MetricTriggers[] = [];
  viewData: MetricTriggersViewData[] = []
  selectedTriggersID: number;

  @ViewChild('confirm') confirm: ElementRef;
  modalRef: BsModalRef;

  selectedFilter: string;
  selectedSeverityFilter: string;
  constructor(private modalService: BsModalService,
    private router: Router,
    private route: ActivatedRoute,
    private svc: TemplateAllTriggersService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private refreshService: DataRefreshBtnService) {
    this.route.parent.paramMap.subscribe(params => {
      this.templateId = params.get('id');
      this.componentId = params.get('componentId');
    });
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ severity: '', status: '' }] };
    this.subscr = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        let activeRoute = event.url.split('/').pop();
        if (activeRoute == 'triggers') {
          this.refreshData();
        }
      }
    });
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
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
    this.getTriggers();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getTriggers();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getTriggers();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getTriggers();
  }

  refreshData() {
    this.spinner.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ severity: '', status: '' }] };
    this.getTriggers();
  }

  getTriggers() {
    this.svc.getTriggers(this.templateId, this.componentId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.triggers = res.results;
      this.count = res.count;
      if (this.triggers.length) {
        this.viewData = this.svc.convertToViewData(this.triggers);
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

  onFilterChange() {
    this.spinner.start('main');
    this.currentCriteria.pageNo = 1;
    this.getTriggers();
  }

  toggleStatus(itemId: number, status: string) {
    this.spinner.start('main');
    this.svc.toggleStatus(this.componentId, itemId, status).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.spinner.stop('main');
      this.notification.success(new Notification('Status successfully set.'));
      this.getTriggers();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification(' Failed to set status. Please try again.'));
    })
  }

  onSeverityChange() {
    this.filterTemplatesSeverity(this.selectedSeverityFilter);
  }

  filterTemplates(type: string) {
    this.viewData = this.svc.convertToViewData(this.triggers.filter(metric => metric.status === type));
  }

  filterTemplatesSeverity(type: string) {
    this.viewData = this.svc.convertToViewData(this.triggers.filter(metric => metric.severity === type));
  }



  decideSeverityColor(severity: string) {
    if (severity === 'Information' || 'Average' || 'Not Classified') return 'text-primary'
    else if (severity === 'Warning' || 'High') return 'text-warning'
    else return 'text-danger'
  }

  deletePanelDevice(view: MetricTriggersViewData) {
    this.selectedTriggersID = view.triggerId;
    this.modalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.modalRef.hide();
    this.spinner.start('main');
    this.svc.delete(this.componentId, this.selectedTriggersID).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.spinner.stop('main');
      this.notification.success(new Notification('Trigger deleted successfully.'));
      this.getTriggers();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification(' Failed to delete Trigger. Please try again.'));
    })
  }

  createTrigger() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  updateTrigger(view: MetricTriggersViewData) {
    this.router.navigate([view.triggerId], { relativeTo: this.route });
  }
}
