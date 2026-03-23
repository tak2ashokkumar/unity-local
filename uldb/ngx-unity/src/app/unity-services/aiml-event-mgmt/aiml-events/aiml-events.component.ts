import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { cloneDeep as _clone } from 'lodash-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, UnityDeviceType } from 'src/app/shared/app-utility/app-utility.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { AimlEventDetailsService } from '../../../shared/aiml-event-details/aiml-event-details.service';
import { AIMLEventsViewData, AimlEventsService, EventsFilterFormData, aimlEventsColumnMapping } from './aiml-events.service';
import { AIMLEventsSummary } from './aiml-events.type';
import { TableColumnMapping } from '../../green-it/green-it-usage/green-it-usage.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'aiml-events',
  templateUrl: './aiml-events.component.html',
  styleUrls: ['./aiml-events.component.scss'],
  providers: [AimlEventsService]
})
export class AimlEventsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;

  summaryViewData: AIMLEventsSummary;
  count: number;
  viewData: AIMLEventsViewData[] = [];
  selectedViewIndex: number;
  hoveredIndex: number = -1;
  tooltipDirection: 'top' | 'bottom' = 'top';

  acknowledgeForm: FormGroup;
  acknowledgeFormErrors: any;
  acknowledgeFormValidationMessages: any;

  columnForm: FormGroup;
  columnsSelected: TableColumnMapping[] = [];
  tableColumns: TableColumnMapping[] = aimlEventsColumnMapping;

  @ViewChild('tooltipRef', { static: false }) tooltipElementRef: ElementRef;

  filterForm: FormGroup;
  filterFormData: EventsFilterFormData;
  deviceTypes: Array<UnityDeviceType> = [];
  deviceTypeSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'type',
    keyToSelect: 'key',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };

  columnSelectionSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    selectAsObject: true,
    selectionLimit: 8,
    buttonClasses: 'btn btn-default btn-block p-1',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: false,
    showUncheckAll: false
  };

  columnSelectionTexts: IMultiSelectTexts = {
    checkAll: 'Select all columns',
    uncheckAll: 'Deselect all columns',
    checked: 'column',
    checkedPlural: 'columns',
    defaultTitle: 'Select columns',
    allSelected: 'All columns selected',
  };

  constructor(private eventSvc: AimlEventsService,
    private eventDetailService: AimlEventDetailsService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private refreshService: DataRefreshBtnService,) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.HUNDRED };
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
  }

  ngOnInit() {
    this.spinner.start('main');
    this.columnsSelected = this.tableColumns.filter(col => col.default);
    this.getEventSummary();
    this.getDropDownData();
    this.buildColumnForm();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.spinner.start('main');
    this.currentCriteria.pageNo = 1;
    this.columnsSelected = this.tableColumns.filter(col => col.default);
    this.getEventSummary();
    this.getDropDownData();
    this.buildColumnForm();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getEvents();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getEvents();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getEvents();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getEvents();
  }

  getDropDownData() {
    this.eventSvc.getDropdownData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.deviceTypes = _clone(res[0]);
      this.buildFilterForm();
    }, err => {
      this.deviceTypes = [];
      this.buildFilterForm();
      this.notification.error(new Notification('Error while fetching filter data!!'));
    });
  }

  getEventSummary() {
    this.eventSvc.getEventSummary().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.summaryViewData = res;
    }, err => {
      this.notification.error(new Notification('Error whlie fetching event summary'))
    });
  }

  buildFilterForm() {
    this.filterForm = this.eventSvc.buildFilterForm();
    this.getEvents();
  }

  buildColumnForm() {
    this.columnForm = this.eventSvc.buildColumnSelectionForm(this.columnsSelected);
  }

  columnChange() {
    this.spinner.start('main');
    this.columnsSelected = _clone(this.columnForm.getRawValue().columns);
    this.spinner.stop('main');
  }

  getEvents() {
    this.eventSvc.getEvents(this.currentCriteria, this.filterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.count = res.count;
      this.viewData = this.eventSvc.convertDetailsToViewdata(res.results);
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while fetching events'))
    });
  }

  acknowledge(index: number) {
    this.selectedViewIndex = index;
    this.acknowledgeForm = this.eventSvc.buildAcknowledgeForm();
    this.acknowledgeFormErrors = this.eventSvc.resetAcknowledgeFormErrors();
    this.acknowledgeFormValidationMessages = this.eventSvc.acknowledgeFormValidationMessages;
    this.handleAcknowledgementFormSubscriptions();
  }

  handleAcknowledgementFormSubscriptions() {
    this.acknowledgeForm.get('ack_comment').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value && value.length > 512) {
        this.acknowledgeForm.get('ack_comment').setValue(value.slice(0, 512), { emitEvent: false });
      }
    });
  }

  onMouseEnterTooltip(i: number, element: HTMLElement) {
    this.hoveredIndex = i;
    setTimeout(() => {
      const tooltip = this.tooltipElementRef?.nativeElement;
      if (tooltip) {
        const tooltipHeight = tooltip.getBoundingClientRect();
        if (tooltipHeight.height > 150) {
          this.tooltipDirection = 'bottom';
        } else {
          this.tooltipDirection = 'top';
        }
      }
    }, 0);
  }

  onAcknowledge() {
    if (this.acknowledgeForm.invalid) {
      this.acknowledgeFormErrors = this.utilService.validateForm(this.acknowledgeForm, this.acknowledgeFormValidationMessages, this.acknowledgeFormErrors);
      this.acknowledgeForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.acknowledgeFormErrors = this.utilService.validateForm(this.acknowledgeForm, this.acknowledgeFormValidationMessages, this.acknowledgeFormErrors);
      });
    } else {
      let obj = Object.assign({}, this.acknowledgeForm.getRawValue());
      let selectedIndex = _clone(this.selectedViewIndex);
      this.onCloseAcknowledge();
      this.viewData[selectedIndex].isAcknowledged = true;
      this.eventSvc.onAcknowledge(this.viewData[selectedIndex].uuid, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.viewData[selectedIndex].isAcknowledged = res.is_acknowledged;
        this.viewData[selectedIndex].acknowledgedTime = res.acknowledged_time;
        this.viewData[selectedIndex].acknowledgedComment = res.acknowledged_comment;
        this.viewData[selectedIndex].acknowledgedBy = res.acknowledged_by;
        this.viewData[selectedIndex].acknowledgedTooltipMsg = `Ack by: ${res.acknowledged_by}<br>` + `Ack Msg: ${res.acknowledged_comment}<br>` + `Ack at: ${res.acknowledged_time}`;
        this.spinner.stop('main');
      }, err => {
        this.viewData[selectedIndex].isAcknowledged = false;
        this.spinner.stop('main');
        this.notification.error(new Notification('Error while acknowledging an events'));
      });
    }
  }

  onCloseAcknowledge() {
    this.selectedViewIndex = null;
    let element: HTMLElement = document.getElementById('count') as HTMLElement;
    element.click();
    this.acknowledgeForm = null;
    this.acknowledgeFormErrors = this.eventSvc.resetAcknowledgeFormErrors();
    this.acknowledgeFormValidationMessages = this.eventSvc.acknowledgeFormValidationMessages;
  }

  viewEventDetails(eventId: string) {
    this.eventDetailService.showEventDetails(eventId);
  }

  filterEvents() {
    this.currentCriteria.pageNo = 1;
    this.getEvents();
  }

  disable(view: AIMLEventsViewData) {
    if (view.isStatusResolved || !view.isSourceUnity) {
      return;
    }
    this.spinner.start('main');
    this.eventSvc.disable(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getEvents();
      this.notification.success(new Notification('Disabled Trigger successfully.'));
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to Disable Trigger. Please try again.'));
    });
  }

  resolve(view: AIMLEventsViewData) {
    if (view.isStatusResolved) {
      return;
    }
    this.spinner.start('main');
    this.eventSvc.resolve(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getEvents();
      this.notification.success(new Notification('Event Resolved successfully'));
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to Resolve event. Please try again.'));
    });
  }
}
