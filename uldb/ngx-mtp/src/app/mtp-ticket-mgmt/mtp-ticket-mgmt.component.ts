import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DateTimeAdapter, MomentDateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE } from '@busacca/ng-pick-datetime';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TenantListDataItem } from '../shared/SharedEntityTypes/tenants.type';
import { ITSMTypeOption, MTPServiceNowTicketType, MTPTicketPriorityType, MTPTicketStatusType, ServiceNowChoices, TicketPriorityOption, TicketStatusOption, TicketTypeOption } from '../shared/SharedEntityTypes/ticket-mgmt.type';
import { AppNotificationService } from '../shared/app-notification/app-notification.service';
import { Notification } from '../shared/app-notification/notification.type';
import { AppSpinnerService } from '../shared/app-spinner/app-spinner.service';
import { DateRange, UnityTimeDuration } from '../shared/app-utility/app-utility.service';
import { PAGE_SIZES, SearchCriteria } from '../shared/table-functionality/search-criteria';
import { MTPServiceNowTicketViewData, MTPTicketViewData, MtpTicketMgmtService } from './mtp-ticket-mgmt.service';
import { UserInfoService } from '../shared/user-info.service';
import { cloneDeep as _clone } from 'lodash-es';

export const MY_NATIVE_FORMATS = {
  parseInput: 'LL LT',
  fullPickerInput: 'DD MMM, YYYY hh:mm A',
  datePickerInput: 'LL',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
};



@Component({
  selector: 'mtp-ticket-mgmt',
  templateUrl: './mtp-ticket-mgmt.component.html',
  styleUrls: ['./mtp-ticket-mgmt.component.scss'],
  providers: [
    { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS },
    MtpTicketMgmtService
  ]
})
export class MtpTicketMgmtComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  private readonly serviceNowTicketSessionKey = 'mtpServiceNowTicketContext';
  downloadUrl: string;
  filterForm: FormGroup;
  now: any;
  durationRange = UnityTimeDuration;
  dateRange: DateRange;
  count = 0;
  currentCriteria: SearchCriteria;
  tenants: TenantListDataItem[] = [];
  itsmTypeOptions: ITSMTypeOption[] = [];
  ticketTypeOptions: TicketTypeOption[] = [
    { label: 'All', value: 'all' },
    { label: 'Incident', value: 'incident' },
    { label: 'Problem', value: 'problem' },
    { label: 'Change Request', value: 'change_request' }
  ];
  viewData: MTPTicketViewData[] = [];
  serviceNowViewData: MTPServiceNowTicketViewData[] = [];

  ticketStatusList: TicketStatusOption[] = [];
  ticketPriorityList: TicketPriorityOption[] = [];
  isFilterApplied = false;
  showTicketsTable = false;
  isApplyingFilter = false;
  lastAppliedFilterSignature = '';
  tablePlaceholderMessage = 'Select Tenant and ITSM Type to display tickets. Use the remaining filters and press the filter button to refine the list.';



  constructor(private svc: MtpTicketMgmtService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private user: UserInfoService) {
    this.now = moment();
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'search_key': '' }] };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    if (this.user.crmInstanceId) {
      this.buildForm();
      setTimeout(() => {
        this.getTenants();
      });
    } else {
      this.spinner.stop('main');
    }
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    if (!this.shouldShowTicketsTable()) {
      return;
    }
    this.spinner.start('main');
    this.getTickets(this.user.crmInstanceId);
  }

  onSearched(event: string) {
    this.currentCriteria.params[0].search_key = event;
    this.currentCriteria.pageNo = 1;
    if (!this.shouldShowTicketsTable()) {
      return;
    }
    this.spinner.start('main');
    this.getTickets(this.user.crmInstanceId);
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    if (!this.shouldShowTicketsTable()) {
      return;
    }
    this.spinner.start('main');
    this.getTickets(this.user.crmInstanceId);
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    if (!this.shouldShowTicketsTable()) {
      return;
    }
    this.spinner.start('main');
    this.getTickets(this.user.crmInstanceId);
  }

  refreshData() {
    this.spinner.start('main');
    this.now = moment();
    this.currentCriteria.pageNo = 1;
    this.currentCriteria.sortColumn = '';
    this.currentCriteria.sortDirection = '';
    this.currentCriteria.params[0].search_key = '';
    this.isFilterApplied = false;
    this.showTicketsTable = false;
    this.isApplyingFilter = false;
    this.lastAppliedFilterSignature = '';
    this.clearTicketData();
    if (this.user.crmInstanceId) {
      this.buildForm();
      setTimeout(() => {
        this.getTenants();
      })
    } else {
      this.spinner.stop('main');
    }
  }

  getTenants() {
    this.tenants = [];
    this.svc.getTenants().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tenants = _clone(res);
      this.updateITSMTypeOptions(this.filterForm.get('tenant').value);
      this.getTicketStatuses();
      this.getTicketPriorities();
      this.spinner.stop('main');
    }, err => {
      this.tenants = [];
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while fetching tenant list'));
    });
  }

  buildForm() {
    this.dateRange = this.svc.getDateRangeByPeriod(this.durationRange.LAST_WEEK);
    this.filterForm = this.svc.buildForm(this.dateRange);
    this.itsmTypeOptions = [];
    this.ticketStatusList = [];
    this.ticketPriorityList = [];
    this.clearTicketData();
    this.filterForm.get('status').disable({ emitEvent: false });
    this.filterForm.get('priority').disable({ emitEvent: false });

    this.filterForm.get('tenant').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((tenantUuid: string) => {
      this.resetTicketsTableState();
      this.updateITSMTypeOptions(tenantUuid);
      this.getTicketStatuses();
      this.getTicketPriorities();
      this.autoLoadTickets();
    });

    this.filterForm.get('itsm_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.resetTicketsTableState();
      this.getTicketStatuses();
      this.getTicketPriorities();
      this.autoLoadTickets();
    });

    this.filterForm.get('ticket_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.getTicketStatuses();
      this.getTicketPriorities();
    });

    this.filterForm.get('status').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
    });

    this.filterForm.get('priority').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
    });

    this.filterForm.get('from').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
    });

    this.filterForm.get('to').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
    });
  }

  updateITSMTypeOptions(tenantUuid: string) {
    const itsmTypeControl = this.filterForm.get('itsm_type');
    const tenant = this.tenants.find(t => t.uuid == tenantUuid);
    const options: ITSMTypeOption[] = [];

    if (tenant) {
      if (tenant.is_servicenow_integrated) {
        options.push({ label: 'ServiceNow', value: 'servicenow' });
      }
      if (tenant.is_dynamics_crm_integrated) {
        options.push({ label: 'Dynamic CRM', value: 'dynamic_crm' });
      }
    }

    this.itsmTypeOptions = options;

    if (!options.length) {
      itsmTypeControl.patchValue('', { emitEvent: false });
      itsmTypeControl.disable({ emitEvent: false });
      return;
    }

    itsmTypeControl.enable({ emitEvent: false });

    if (options.length === 1) {
      itsmTypeControl.patchValue(options[0].value, { emitEvent: false });
      return;
    }

    itsmTypeControl.patchValue('', { emitEvent: false });
  }

  getTicketStatuses() {
    const itsmType = this.filterForm.get('itsm_type').value;
    const tenantUuid = this.filterForm.get('tenant').value;
    const ticketType = this.filterForm.get('ticket_type').value;
    const statusControl = this.filterForm.get('status');

    this.ticketStatusList = [this.getAllFilterChoice() as TicketStatusOption];
    statusControl.patchValue('all', { emitEvent: false });
    statusControl.disable({ emitEvent: false });

    if (!itsmType) {
      return;
    }

    if (itsmType == 'servicenow' && !tenantUuid) {
      return;
    }

    if (itsmType == 'servicenow' && (!ticketType || ticketType == 'all')) {
      statusControl.enable({ emitEvent: false });
      return;
    }

    this.svc.getTicketStatusByITSMType(this.user.crmInstanceId, itsmType, tenantUuid, ticketType)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.ticketStatusList = [this.getAllFilterChoice() as TicketStatusOption, ..._clone(res)];
        if (this.ticketStatusList.length) {
          statusControl.enable({ emitEvent: false });
        }
      }, err => {
        this.ticketStatusList = [];
        statusControl.disable({ emitEvent: false });
        this.notification.error(new Notification('Error while fetching status list'));
      });
  }

  getTicketPriorities() {
    const itsmType = this.filterForm.get('itsm_type').value;
    const tenantUuid = this.filterForm.get('tenant').value;
    const ticketType = this.filterForm.get('ticket_type').value;
    const priorityControl = this.filterForm.get('priority');

    this.ticketPriorityList = [this.getAllFilterChoice() as TicketPriorityOption];
    priorityControl.patchValue('all', { emitEvent: false });
    priorityControl.disable({ emitEvent: false });

    if (!itsmType) {
      return;
    }

    if (itsmType == 'servicenow' && !tenantUuid) {
      return;
    }

    if (itsmType == 'servicenow' && (!ticketType || ticketType == 'all')) {
      priorityControl.enable({ emitEvent: false });
      return;
    }

    this.svc.getTicketPriorityByITSMType(this.user.crmInstanceId, itsmType, tenantUuid, ticketType)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.ticketPriorityList = [this.getAllFilterChoice() as TicketPriorityOption, ..._clone(res)];
        if (this.ticketPriorityList.length) {
          priorityControl.enable({ emitEvent: false });
        }
      }, err => {
        this.ticketPriorityList = [];
        priorityControl.disable({ emitEvent: false });
        this.notification.error(new Notification('Error while fetching priorities list'));
      });
  }

  getTicketStatusLabel(status: TicketStatusOption): string {
    if (status && status.value == 'all') {
      return 'All';
    }
    if (this.filterForm && this.filterForm.get('itsm_type').value == 'servicenow') {
      return (status as ServiceNowChoices).label;
    }
    return (status as MTPTicketStatusType).display_name;
  }

  getTicketPriorityLabel(priority: TicketPriorityOption): string {
    if (priority && priority.value == 'all') {
      return 'All';
    }
    if (this.filterForm && this.filterForm.get('itsm_type').value == 'servicenow') {
      return (priority as ServiceNowChoices).label;
    }
    return (priority as MTPTicketPriorityType).display_name;
  }

  getTickets(instanceId: string) {
    const formData = this.filterForm.getRawValue();
    const itsmType = formData.itsm_type;

    this.downloadUrl = itsmType == 'servicenow'
      ? ''
      : `/customer/mtp_dynamics_crm/instances/${instanceId}/tickets/download_report/?page=1&page_size=0`;

    this.svc.getTicketsByITSMType(instanceId, this.currentCriteria, formData).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: any) => {
      this.count = Number(res.count || 0);
      this.showTicketsTable = true;
      this.isApplyingFilter = false;
      this.lastAppliedFilterSignature = this.getFilterSignature();

      if (itsmType == 'servicenow') {
        this.viewData = [];
        this.serviceNowViewData = this.svc.convertServiceNowToViewData(res.results as MTPServiceNowTicketType[]);
      } else {
        this.serviceNowViewData = [];
        this.viewData = this.svc.convertToViewData(res.results);
      }

      this.spinner.stop('main');
    }, err => {
      this.clearTicketData();
      this.showTicketsTable = this.isFilterApplied;
      this.isApplyingFilter = false;
      this.spinner.stop('main');
    });
  }

  filterTickets() {
    this.currentCriteria.pageNo = 1;
    this.now = moment();
    this.normalizeSortForSelectedITSMType();
    this.isApplyingFilter = true;
    this.isFilterApplied = this.canFetchTickets();
    this.showTicketsTable = this.isFilterApplied;
    this.lastAppliedFilterSignature = this.isFilterApplied ? this.getFilterSignature() : '';
    this.clearTicketData();

    if (!this.user.crmInstanceId || !this.isFilterApplied) {
      this.isApplyingFilter = false;
      this.spinner.stop('main');
      return;
    }

    this.spinner.start('main');
    if (this.user.crmInstanceId) {
      setTimeout(() => {
        this.getTickets(this.user.crmInstanceId);
      })
    }
  }

  downloadReport() {
    if (this.isServiceNowSelected()) {
      if (!this.serviceNowViewData.length) {
        return;
      }

      this.spinner.start('main');
      this.svc.downloadServiceNowReport(this.filterForm.get('tenant').value).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        let ele = document.getElementById('file-downloader');
        ele.setAttribute('href', this.svc.getServiceNowReportUrl(res.data));
        ele.click();
        this.spinner.stop('main');
        this.notification.success(new Notification('Report downloaded successfully.'));
      }, err => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Failed to download report. Try again later.'));
      });
      return;
    }

    if (!this.viewData.length) {
      return;
    }
    this.spinner.start('main');
    this.svc.downloadDynamicCRMReport(this.user.crmInstanceId, this.filterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      let ele = document.getElementById('file-downloader');
      ele.setAttribute('href', `customer/mtp_dynamics_crm/instances/${this.user.crmInstanceId}/tickets/get_report/?file_name=${res.data}`);
      ele.click();
      this.spinner.stop('main');
      this.notification.success(new Notification('Report downloaded successfully.'));
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to download report. Try again later.'));
    });
  }

  syncAttributes() {
    this.spinner.start('main');
    this.svc.syncAttributes(this.user.crmInstanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.spinner.stop('main');
      this.notification.success(new Notification('Sync attributes successfully.'));
      this.getTicketStatuses();
      this.getTicketPriorities();
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to Sync attributes. Try again later.'));
    })
  }

  goToDetails(view: MTPTicketViewData) {
    this.router.navigate(['ticket', view.ticketId], { relativeTo: this.route });
  }

  goToServiceNowDetails(ticket: MTPServiceNowTicketViewData) {
    if (!this.setServiceNowTicketContext(ticket)) {
      return;
    }

    this.router.navigate(['ticket', 'servicenow'], { relativeTo: this.route });
  }

  editServiceNowTicket(ticket: MTPServiceNowTicketViewData) {
    if (!this.setServiceNowTicketContext(ticket)) {
      return;
    }

    this.router.navigate(['ticket', 'edit', 'servicenow'], { relativeTo: this.route });
  }

  createTicket() {
    this.router.navigate(['ticket', 'create'], { relativeTo: this.route });
  }

  shouldShowTicketsTable() {
    return this.showTicketsTable;
  }

  shouldShowDynamicCRMTable() {
    return this.shouldShowTicketsTable() && !this.isServiceNowSelected();
  }

  shouldShowServiceNowTable() {
    return this.shouldShowTicketsTable() && this.isServiceNowSelected();
  }

  isServiceNowSelected() {
    return this.filterForm && this.filterForm.get('itsm_type').value == 'servicenow';
  }

  hasTicketRows() {
    return this.isServiceNowSelected() ? this.serviceNowViewData.length : this.viewData.length;
  }

  private canFetchTickets() {
    if (!this.filterForm) {
      return false;
    }

    return !!this.filterForm.get('tenant').value && !!this.filterForm.get('itsm_type').value;
  }

  private clearTicketData() {
    this.count = 0;
    this.viewData = [];
    this.serviceNowViewData = [];
  }

  private setServiceNowTicketContext(ticket: MTPServiceNowTicketViewData): boolean {
    const tenantUuid = this.filterForm ? this.filterForm.get('tenant').value : '';

    if (!tenantUuid || !ticket || !ticket.sysId) {
      return false;
    }

    sessionStorage.setItem(this.serviceNowTicketSessionKey, JSON.stringify({
      tenantId: tenantUuid,
      sysId: ticket.sysId,
      ticketType: ticket.ticketType
    }));

    return true;
  }

  private getAllFilterChoice(): ServiceNowChoices {
    return {
      name: 'all',
      label: 'All',
      value: 'all',
      element: 'all'
    };
  }

  private normalizeSortForSelectedITSMType() {
    const itsmType = this.filterForm ? this.filterForm.get('itsm_type').value : '';
    const validColumns = itsmType == 'servicenow'
      ? ['state', 'priority', 'opened_at', 'sys_updated_on']
      : ['ticket_number', 'priority', 'status', 'created_on'];

    if (validColumns.indexOf(this.currentCriteria.sortColumn) === -1) {
      this.currentCriteria.sortColumn = '';
      this.currentCriteria.sortDirection = '';
    }
  }

  private resetTicketsTableState() {
    if (this.filterForm) {
      this.filterForm.get('ticket_type').patchValue('all', { emitEvent: false });
      this.filterForm.get('status').patchValue('all', { emitEvent: false });
      this.filterForm.get('priority').patchValue('all', { emitEvent: false });
    }
    this.isFilterApplied = false;
    this.showTicketsTable = false;
    this.isApplyingFilter = false;
    this.lastAppliedFilterSignature = '';
    this.currentCriteria.pageNo = 1;
    this.clearTicketData();
  }

  private autoLoadTickets() {
    if (!this.user.crmInstanceId) {
      return;
    }

    if (!this.canFetchTickets()) {
      this.resetTicketsTableState();
      return;
    }

    this.currentCriteria.pageNo = 1;
    this.normalizeSortForSelectedITSMType();
    this.isApplyingFilter = true;
    this.isFilterApplied = true;
    this.showTicketsTable = false;
    this.lastAppliedFilterSignature = '';
    this.clearTicketData();
    this.spinner.start('main');

    setTimeout(() => {
      this.getTickets(this.user.crmInstanceId);
    });
  }

  private getFilterSignature() {
    if (!this.filterForm) {
      return '';
    }

    const formData = this.filterForm.getRawValue();
    return JSON.stringify({
      tenant: formData.tenant || '',
      itsm_type: formData.itsm_type || '',
      ticket_type: formData.ticket_type || '',
      status: formData.status || '',
      priority: formData.priority || '',
      from: formData.from ? moment(formData.from).valueOf() : '',
      to: formData.to ? moment(formData.to).valueOf() : '',
      search_key: this.currentCriteria.params[0].search_key || ''
    });
  }
}
