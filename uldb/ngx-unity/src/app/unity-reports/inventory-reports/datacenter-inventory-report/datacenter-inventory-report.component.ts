import { Component, OnInit } from '@angular/core';
import { DatacenterInventoryReportService, DatacenterInventoryView, DatacenterInventoryCabinetView, DCInventoryReportViewData, DCReportFilterData } from './datacenter-inventory-report.service';
import { AppUtilityService, FaIconMapping } from 'src/app/shared/app-utility/app-utility.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { FormGroup } from '@angular/forms';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { ReportSchedulesCrudService } from '../../report-schedules-crud/report-schedules-crud.service';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'datacenter-inventory-report',
  templateUrl: './datacenter-inventory-report.component.html',
  styleUrls: ['./datacenter-inventory-report.component.scss'],
  providers: [DatacenterInventoryReportService]
})
export class DatacenterInventoryReportComponent implements OnInit {
  private ngUnsubscribe = new Subject();

  // dropdown data variables
  datacenters: DatacenterInventoryView[] = [];
  datacenterCabinets: DatacenterInventoryCabinetView[] = [];

  // dropdown selection variable
  selectedDropdownData: DCReportFilterData = new DCReportFilterData();

  reportViewdata: DCInventoryReportViewData = new DCInventoryReportViewData();
  FaIconMapping = FaIconMapping;
  scheduleId: string;

  filterForm: FormGroup;
  filterFormErrors: any;
  filterFormValidationMessages: any;

  dcSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: "uuid",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };

  cabinetSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    keyToSelect: 'uuid',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };

  constructor(private reportService: DatacenterInventoryReportService,
    private utilService: AppUtilityService,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private scheduleSvc: ReportSchedulesCrudService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.scheduleId = params.get('scheduleId');
    });
  }

  ngOnInit() {
    this.spinner.start('main');
    this.getDataCenters();
  }

  getDataCenters() {
    this.reportService.getDataCenters().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.datacenters = this.reportService.convertToDataCenterInventoryView(data);
      this.spinner.stop('main');
      this.buildFilterForm();
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong !. Tryagain later.'));
      this.spinner.stop('main');
    })
  }

  buildFilterForm() {
    this.filterForm = this.reportService.createFilterForm();
    this.filterFormValidationMessages = this.reportService.filterFormValidationMessages;
    this.filterFormErrors = this.reportService.resetFilterFormErrors();
    if (this.scheduleId) {
      this.setFilterWithScheduledValues();
    }
  }

  private setFilterWithScheduledValues() {
    this.scheduleSvc.getScheduleById(this.scheduleId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.filterForm.get('datacenters').setValue(res.report_meta.datacenters);
      this.dcChange();
      this.filterForm.get('cabinets').setValue(res.report_meta.cabinets);
      this.filterForm.get('reportType').setValue(res.report_meta.reportType);
      this.filterForm.get('report_url').setValue(res.report_meta.report_url);
      this.generateReport();
    }, err => { this.notification.error(new Notification('Something went wrong!! Please try again')) });
  }

  dcChange() {
    let selectedDCIds = <string[]>this.filterForm.get('datacenters').value;
    if (selectedDCIds == this.selectedDropdownData.dcUUID) {
      return;
    }

    this.selectedDropdownData.dcUUID = selectedDCIds;
    if (selectedDCIds.length) {
      this.filterForm.get('cabinets').reset();
      let dcCabinets = [];
      selectedDCIds.map(dcId => {
        const dcData = this.datacenters.find(dc => dc.uuid == dcId);
        dcCabinets = dcCabinets.concat(dcData.cabinets);
      })
      this.datacenterCabinets = dcCabinets;
    } else {
      this.datacenterCabinets = [];
    }
  }

  generateReport() {
    if (this.filterForm.invalid) {
      this.filterFormErrors = this.utilService.validateForm(this.filterForm, this.filterFormValidationMessages, this.filterFormErrors);
      this.filterForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.filterFormErrors = this.utilService.validateForm(this.filterForm, this.filterFormValidationMessages, this.filterFormErrors); });
    } else {
      let selectedCabintIds = <string[]>this.filterForm.get('cabinets').value;
      this.selectedDropdownData.cabUUID = selectedCabintIds && selectedCabintIds.length ? selectedCabintIds : [];
      this.selectedDropdownData.device_list = this.filterForm.get('reportType').value == 'device';
      if (this.selectedDropdownData.device_list) {
        this.getDevicesViewReport();
      } else {
        this.getCabinetViewReport();
      }
    }
  }

  getCabinetViewReport() {
    this.spinner.start('main');
    this.reportService.generateDCCabinetViewReport(this.selectedDropdownData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.reportViewdata = this.reportService.convertToDCInfoViewData(data.result.data);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong !. Tryagain later.'));
      this.spinner.stop('main');
    })
  }

  getDevicesViewReport() {
    this.spinner.start('main');
    this.reportService.generateDCDevicesViewReport(this.selectedDropdownData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.reportViewdata = this.reportService.convertToDevicesInfoViewData(data.result.data);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Something went wrong !. Tryagain later.'));
      this.spinner.stop('main');
    })
  }

  downloadReport() {
    if (!this.reportViewdata.isReportReady) {
      return;
    }
    this.spinner.start('main');
    this.reportService.downloadReport(this.selectedDropdownData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      let ele = document.getElementById('file-downloader');
      ele.setAttribute('href', `customer/datacenter_inventory/get_report/?file_name=${data.data}`);
      ele.click();
      this.spinner.stop('main');
      this.notification.success(new Notification('Report downloaded successfully.'));
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to downloaded report. Try again later.'));
    });
  }

  sendEmail() {
    if (!this.reportViewdata.isReportReady) {
      return;
    }
    this.spinner.start('main');
    this.reportService.sendEmail(this.selectedDropdownData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.spinner.stop('main');
      this.notification.success(new Notification('Report sent to email.'));
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to send via email. Tryagain later.'));
    });
  }

  saveSchedule() {
    if (this.filterForm.invalid) {
      this.filterFormErrors = this.utilService.validateForm(this.filterForm, this.filterFormValidationMessages, this.filterFormErrors);
      this.filterForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.filterFormErrors = this.utilService.validateForm(this.filterForm, this.filterFormValidationMessages, this.filterFormErrors); });
    } else {
      this.scheduleSvc.addOrEdit(this.scheduleId, this.filterForm.getRawValue());
    }
  }
}
