import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { InputTemplateModel, OrchestrationInputTemplateService } from './orchestration-input-template.service';
import { Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { HeaderAction, SortDirection, SortEvent, StatusToggleEvent, TableColumn } from 'src/app/shared/app-generic-table/app-generic-table.type';

@Component({
  selector: 'orchestration-input-template',
  templateUrl: './orchestration-input-template.component.html',
  styleUrls: ['./orchestration-input-template.component.scss']
})
export class OrchestrationInputTemplateComponent implements OnInit, OnDestroy {

  headerActions: HeaderAction[] = [
    { id: 'template', label: 'Create Template', icon: 'fas fa-plus', btnClass: 'ct-btn-primary' }
  ];

  columns: TableColumn[] = [
    { key: 'name', label: 'Name', widthClass: 'tdw-20', sortable: true, sortField: 'name', locked: true, },
    { key: 'input_name', label: 'Input Field Name', widthClass: 'tdw-20', sortable: true, sortField: 'input_name' },
    { key: 'dependency_name', label: 'Dependent Field', widthClass: 'tdw-20', sortable: true, sortField: 'dependency_name' },
    { key: 'type', label: 'Type', widthClass: 'tdw-10', sortable: true, sortField: 'type' },
    {
      key: 'template_status', label: 'Status', align: 'center', cellClass: 'status-toggle-column',
      statusToggle: {
        activeValue: 'Enabled',
        inactiveValue: 'Disabled',
        activeLabel: 'Enable',
        inactiveLabel: 'Disable'
      }
    },
    { key: 'actions', label: 'Actions', align: 'center', locked: true, cellClass: 'action-icons-column' }
  ];

  currentCriteria: SearchCriteria;
  private ngUnsubscribe = new Subject();
  viewData: InputTemplateModel[] = [];
  count: number;
  name: string;
  templateId: string;
  cloneModalRef: BsModalRef;
  @ViewChild('clone') clone: ElementRef;
  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  deleteModalRef: BsModalRef;
  @ViewChild('edit') edit: ElementRef;
  editModelRef: BsModalRef;
  activeSortField: string | null = null;
  activeSortDirection: SortDirection = null;

  constructor(
    private svc: OrchestrationInputTemplateService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: BsModalService
  ) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.restoreCriteria();
    this.getInputTemplateData();
  }

  ngOnDestroy() {
    this.cloneModalRef?.hide();
    this.deleteModalRef?.hide();
    this.editModelRef?.hide();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private restoreCriteria(): void {
    const qp = this.route.snapshot.queryParamMap;
    this.applyQueryParamsToCriteria(qp);
  }

  private applyQueryParamsToCriteria(qp: ParamMap): void {
    this.currentCriteria.searchValue = qp.get('search') || '';
    this.currentCriteria.sortColumn = qp.get('sortColumn') || '';
    this.currentCriteria.sortDirection = (qp.get('sortDirection') as '' | 'asc' | 'desc') || '';
    this.activeSortField = this.currentCriteria.sortColumn || null;
    this.activeSortDirection = (this.currentCriteria.sortDirection || null) as SortDirection;
    const pageNo = qp.get('pageNo');
    const pageSize = qp.get('pageSize');
    this.currentCriteria.pageNo = pageNo ? +pageNo : 1;
    this.currentCriteria.pageSize = pageSize ? +pageSize : PAGE_SIZES.DEFAULT_PAGE_SIZE;
  }

  private syncCriteriaToQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: this.currentCriteria.searchValue || null,
        sortColumn: this.currentCriteria.sortColumn || null,
        sortDirection: this.currentCriteria.sortDirection || null,
        pageNo: this.currentCriteria.pageNo !== 1 ? this.currentCriteria.pageNo : null,
        pageSize: this.currentCriteria.pageSize !== PAGE_SIZES.DEFAULT_PAGE_SIZE ? this.currentCriteria.pageSize : null
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  onHeaderAction(id: string) {
    if (id === 'template') this.createTemplate();
  }

  onStatusToggle(event: StatusToggleEvent) {
    if (event.row?.type === 'Manual') {
      this.toggleStatus(event.value, event.row);
    }
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.syncCriteriaToQueryParams();
    this.getInputTemplateData();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo !== pageNo) {
      this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.syncCriteriaToQueryParams();
      this.getInputTemplateData();
    }
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.syncCriteriaToQueryParams();
    this.getInputTemplateData();
  }

  refreshData() {
    this.spinner.start('main');
    this.getInputTemplateData();
  }

  onSortChanged(event: SortEvent) {
    this.spinner.start('main');
    this.activeSortField = event.direction ? event.field : null;
    this.activeSortDirection = event.direction;
    this.currentCriteria.sortColumn = event.direction ? event.field : '';
    this.currentCriteria.sortDirection = event.direction || '';
    this.currentCriteria.pageNo = 1;
    this.syncCriteriaToQueryParams();
    this.getInputTemplateData();
  }

  getInputTemplateData() {
    this.svc.getTemplateData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      this.viewData = data.results;
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Templates'));
    });
  }

  toggleStatus(status: boolean, view: InputTemplateModel) {
    const previousStatus = view.template_status;
    view['template_status'] = status ? 'Enabled' : 'Disabled';
    this.svc.toggleStatus(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
    }, (err: HttpErrorResponse) => {
      view['template_status'] = previousStatus;
      this.notification.error(new Notification('Failed to change status'));
    });
  }

  createTemplate() {
    this.router.navigate(['crud'], { relativeTo: this.route, state: { inputTemplateReturnUrl: this.router.url } });
  }

  cloneTemplate(name: string, uuid: string) {
    this.name = `Copy-${name}`;
    this.templateId = uuid;
    this.cloneModalRef = this.modalService.show(this.clone, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmClone() {
    this.spinner.start('main');
    this.svc.cloneData(this.templateId, this.name).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.getInputTemplateData();
      this.spinner.stop('main');
      this.notification.success(new Notification('Template cloned successfully'));
      this.cloneModalRef.hide();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to clone template'));
      this.cloneModalRef.hide();
    });
  }

  deleteTemplate(uuid: string) {
    this.templateId = uuid;
    this.deleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmTemplateDelete() {
    this.deleteModalRef.hide();
    this.spinner.start('main');
    this.svc.deleteData(this.templateId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.notification.success(new Notification('Template deleted successfully.'));
      this.getInputTemplateData();
    }, err => {
      this.notification.error(new Notification(' Template has more than one reference so it can not be deleted!! Please try again.'));
    });
  }

  editTemplate(view: InputTemplateModel) {
    this.templateId = view.uuid;
    this.editModelRef = this.modalService.show(this.edit, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmEdit() {
    this.editModelRef.hide();
    this.router.navigate([this.templateId, 'edit'], { relativeTo: this.route, state: { inputTemplateReturnUrl: this.router.url } });
  }
}