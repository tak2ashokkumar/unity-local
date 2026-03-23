import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { cloneDeep as _clone } from 'lodash-es';
import * as moment from 'moment';
import { BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { GreenITService } from '../green-it.service';
import { GreenITDCWidget, GreenITDCWidgetCabinet } from '../green-it.type';
import { DateRange, Duration, GreenItUsageByDeviceViewData, GreenItUsageService, TableColumnMapping, UsageFilterData, columnMapping, deviceTypes } from './green-it-usage.service';

@Component({
  selector: 'green-it-usage',
  templateUrl: './green-it-usage.component.html',
  styleUrls: ['./green-it-usage.component.scss'],
  providers: [GreenITService, GreenItUsageService]
})
export class GreenItUsageComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  datacenters: GreenITDCWidget[] = [];
  cabinets: GreenITDCWidgetCabinet[] = [];
  deviceTypes: Array<{ name: string, displayName: string, mapping: DeviceMapping }> = deviceTypes;
  tableColumns: TableColumnMapping[] = columnMapping;

  filterForm: FormGroup;
  filterFormErrors: any;
  filterFormValidationMesages: any;
  columnForm: FormGroup;
  viewData: GreenItUsageByDeviceViewData[] = [];
  columnsSelected: TableColumnMapping[] = [];

  duration = Duration;
  now: Date;
  dateRange: DateRange;

  // dropdown selection variable
  selectedFileterData: UsageFilterData = new UsageFilterData();

  dcSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "datacenter_name",
    keyToSelect: "datacenter_uuid",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };

  cabinetSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "cabinet_name",
    keyToSelect: "cabinet_uuid",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };

  deviceTypeSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'displayName',
    keyToSelect: 'name',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };

  columnSelectionSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    selectAsObject: true,
    selectionLimit: 10,
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };

  columnSelectionTexts: IMultiSelectTexts = {
    checkAll: 'Select all columns',
    uncheckAll: 'Deselect all columns',
    checked: 'column',
    checkedPlural: 'columns',
    defaultTitle: 'Select columns',
    allSelected: 'All columns selected',
  };

  constructor(private usageService: GreenItUsageService,
    private modalService: BsModalService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private ticketService: SharedCreateTicketService, ) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.TWENTY };
    this.now = new Date();
    this.now.setDate(this.now.getDate() - 1);
  }

  ngOnInit() {
    setTimeout(() => {
      this.columnsSelected = this.tableColumns.filter(col => col.default);
      this.getDataCenters();
    }, 0);
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(event: any) {
    this.getDataCenters();
  }

  getDataCenters() {
    this.usageService.getDataCenters().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.datacenters = res;
      this.buildFilterForm();
      this.buildColumnForm();
    }, (err: HttpErrorResponse) => {
      this.datacenters = [];
      this.notification.error(new Notification('Failed to fetch filter data. Please try again later.'));
      this.getUsageData();
    })
  }

  dcChange() {
    let selectedDCIds = <string[]>this.filterForm.get('data_center').value;
    if (selectedDCIds == this.selectedFileterData.data_center) {
      return;
    }

    this.selectedFileterData.data_center = selectedDCIds;
    if (selectedDCIds.length) {
      this.filterForm.get('cabinets').reset();
      let dcCabinets = [];
      selectedDCIds.map(dcId => {
        const dcData = this.datacenters.find(dc => dc.datacenter_uuid == dcId);
        dcCabinets = dcCabinets.concat(dcData.cabinets);
      })
      this.cabinets = dcCabinets;
    } else {
      this.cabinets = [];
    }
  }

  buildFilterForm() {
    this.dateRange = this.usageService.getDateRangeByPeriod(this.duration.CURRENT_YEAR);
    this.filterForm = this.usageService.buildFilterForm(this.datacenters, this.dateRange);
    this.filterFormErrors = this.usageService.resetFilterFormErrors();
    this.filterFormValidationMesages = this.usageService.filterFormValidationMessages;

    this.dcChange();
    let cbts: string[] = [];
    this.cabinets.map(cb => cbts.push(cb.cabinet_uuid));
    this.filterForm.get('cabinets').setValue([...cbts]);
    this.selectedFileterData.data_center = this.filterForm.get('data_center').value;

    this.filterForm.get('period').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      this.dateRange = this.usageService.getDateRangeByPeriod(val);
      if (this.dateRange) {
        this.filterForm.get('from').patchValue(new Date(this.dateRange.from))
        this.filterForm.get('to').patchValue(new Date(this.dateRange.to))
      }
      if (val == this.duration.CUSTOM) {
        this.filterForm.get('from').enable();
        this.filterForm.get('to').enable();
      } else {
        this.filterForm.get('from').disable();
        this.filterForm.get('to').disable();
      }
      this.filterForm.get('from').updateValueAndValidity();
      this.filterForm.get('to').updateValueAndValidity();
    });

    this.filterData();
  }

  buildColumnForm() {
    this.columnForm = this.usageService.buildColumnSelectionForm(this.columnsSelected);
  }

  columnChange() {
    this.spinner.start('main');
    this.columnsSelected = _clone(this.columnForm.getRawValue().columns);
    this.spinner.stop('main');
  }

  filterData() {
    const selectedCabintIds = <string[]>this.filterForm.get('cabinets').value;
    this.selectedFileterData.cabinets = selectedCabintIds && selectedCabintIds.length ? selectedCabintIds : [];

    const selectedDeviceTypes = <string[]>this.filterForm.get('device_types').value;
    this.selectedFileterData.device_types = selectedDeviceTypes && selectedDeviceTypes.length ? selectedDeviceTypes : [];
    this.selectedFileterData.period = <string>this.filterForm.get('period').value;
    this.selectedFileterData.from = moment(this.filterForm.get('from').value).format('YYYY-MM');
    this.selectedFileterData.to = moment(this.filterForm.get('to').value).format('YYYY-MM');

    this.spinner.start('main');
    this.usageService.getUsageData(this.selectedFileterData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.usageService.convertToViewData(res);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
    });
  }

  getUsageData() {
    this.spinner.start('main');
    this.usageService.getUsageData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.usageService.convertToViewData(res);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.viewData = [];
      this.spinner.stop('main');
    })
  }

  createTicket(data: GreenItUsageByDeviceViewData) {
    // this.ticketService.createTicket({
    //   subject: TICKET_SUBJECT(data.deviceMapping, data.deviceName),
    //   metadata: GREEN_IT_DEVICE_METADATA(data.deviceName, data.deviceType,
    //     data.datacenter, data.powerUsage, data.co2Emission,
    //   )
    // });
  }

}
