import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { GreenITService } from '../green-it.service';
import { GreenITDCWidget, GreenITDCWidgetCabinet } from '../green-it.type';
import { AwsCo2EmissionByAccountIdViewData, AwsCo2EmissionByAccountViewData, AwsCo2EmissionByGeographyViewData, AwsCo2EmissionByMonthViewData, AwsCo2EmissionByQuarterViewData, AwsCo2EmissionByServiceViewData, AwsCo2EmissionByYearViewData, AwsCo2Summary, AwsHighestCo2Geography, AwsHighestCo2Service, ChartData, ChartView, Co2EmissionByMonthViewData, Co2EmissionByProductViewData, Co2EmissionByProjectViewData, Co2EmissionByQuarterViewData, Co2EmissionByRegionViewData, Co2EmissionByYearViewData, EmissionDetailsFilterData, GcpCo2Summary, GcpHighestCo2Product, GreenItEmissionDetailsService, deviceTypes } from './green-it-emission-details.service';
import { AwsCo2EmissionAccountInfo, Co2EmissionByPublicCloudAccount } from './green-it-emission-details.type';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';

// import DataLabelsPlugin from 'chartjs-plugin-datalabels';


@Component({
  selector: 'green-it-emission-details',
  templateUrl: './green-it-emission-details.component.html',
  styleUrls: ['./green-it-emission-details.component.scss'],
  providers: [GreenITService, GreenItEmissionDetailsService]
})
export class GreenItEmissionDetailsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  filterForm: FormGroup;
  datacenters: GreenITDCWidget[] = [];
  cabinets: GreenITDCWidgetCabinet[] = [];
  deviceTypes: Array<{ name: string, displayName: string }> = [];
  gcpCloudAccounts: Co2EmissionByPublicCloudAccount[] = [];
  awsCloudAccounts: AwsCo2EmissionAccountInfo[] = [];
  publicCloudAccounts: any[] = [];

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
    showUncheckAll: true
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
    showUncheckAll: true
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
    showUncheckAll: true
  };

  publicCloudAccountSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    selectAsObject: true,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };

  viewType: string;
  dcChartData: ChartView;
  cabinetChartData: ChartView;
  deviceTypeChartData: ChartView;
  quarterChartData: ChartData;

  co2EmissionSummary: GcpCo2Summary = new GcpCo2Summary();
  gcpHighestCo2Product: GcpHighestCo2Product = new GcpHighestCo2Product();
  co2ByProductData: Co2EmissionByProductViewData = new Co2EmissionByProductViewData();
  co2ByProjectData: Co2EmissionByProjectViewData = new Co2EmissionByProjectViewData();
  co2ByRegionData: Co2EmissionByRegionViewData = new Co2EmissionByRegionViewData();
  co2ByQuarterData: Co2EmissionByQuarterViewData = new Co2EmissionByQuarterViewData();
  co2ByYearData: Co2EmissionByYearViewData = new Co2EmissionByYearViewData();
  co2ByMonthData: Co2EmissionByMonthViewData = new Co2EmissionByMonthViewData();

  awsHighestCo2Service: AwsHighestCo2Service = new AwsHighestCo2Service();
  awsCo2EmissionSummary: AwsCo2Summary = new AwsCo2Summary();
  awsHighestCo2Geography: AwsHighestCo2Geography = new AwsHighestCo2Geography();
  awsCo2ByServiceData: AwsCo2EmissionByServiceViewData = new AwsCo2EmissionByServiceViewData();
  awsCo2ByGeographyData: AwsCo2EmissionByGeographyViewData = new AwsCo2EmissionByGeographyViewData();
  awsCo2ByAccountIdData: AwsCo2EmissionByAccountIdViewData = new AwsCo2EmissionByAccountIdViewData();
  awsCo2ByAccountData: AwsCo2EmissionByAccountViewData = new AwsCo2EmissionByAccountViewData();
  awsCo2ByQuarterData: AwsCo2EmissionByQuarterViewData = new AwsCo2EmissionByQuarterViewData();
  awsCo2ByMonthData: AwsCo2EmissionByMonthViewData = new AwsCo2EmissionByMonthViewData();
  awsCo2ByYearData: AwsCo2EmissionByYearViewData = new AwsCo2EmissionByYearViewData();

  selectedOption: string;
  cloudType: string;
  filterParam: string;
  selectedFilterData: EmissionDetailsFilterData = new EmissionDetailsFilterData();

  constructor(private greenItService: GreenITService,
    private greenItEmissionService: GreenItEmissionDetailsService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService, private router: Router,
    private route: ActivatedRoute,
    private storage: StorageService) { }

  ngOnInit() {
    this.spinner.start('main');
    this.getDropdownData();
    this.filterParam = this.storage.getByKey('selectedOption', StorageType.SESSIONSTORAGE);
    switch (this.filterParam) {
      case 'aws':
        this.selectedOption = 'public_cloud'; break;
      case 'gcp':
        this.selectedOption = 'public_cloud'; break;
      default:
        this.selectedOption = 'datacenter';
    }
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.storage.removeByKey('selectedOption', StorageType.SESSIONSTORAGE);
  }

  refreshData(event: any) {
    this.spinner.start('main');
    this.getDropdownData();
  }

  getDropdownData() {
    this.greenItEmissionService.getDropdownData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.datacenters = res[0];
      let dcCabinets = [];
      this.datacenters.map(dc => {
        dcCabinets = dcCabinets.concat(dc.cabinets);
      })
      this.cabinets = dcCabinets;
      this.deviceTypes = res[1];
      this.gcpCloudAccounts = res[2];
      this.awsCloudAccounts = res[3];
      this.buildForm();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.datacenters = [];
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to fetch filter data. Please try again later.'));
    })
  }

  buildForm() {
    this.filterForm = this.greenItEmissionService.buildForm(this.selectedOption);
    if (this.filterForm.get('emission_by').value == 'datacenter') {
      this.setDCAttributes();
    } else {
      this.setPublicCloudAttributes();
    }
    this.filterForm.get('emission_by').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(type => {
      if (type == 'datacenter') {
        this.setDCAttributes();
      } else {
        this.setPublicCloudAttributes();
      }
    })
    this.filterData();
  }

  setDCAttributes() {
    this.filterForm.removeControl('cloud_type');
    this.filterForm.removeControl('cloud_accounts');
    let dcs: string[] = [];
    this.datacenters.map(dc => dcs.push(dc.datacenter_uuid));
    let cbs: string[] = [];
    this.cabinets.map(cb => cbs.push(cb.cabinet_uuid));
    let dtps: string[] = [];
    deviceTypes.map(dt => dtps.push(dt.name));
    this.filterForm.addControl('data_center', new FormControl(dcs, [Validators.required]));
    this.filterForm.addControl('cabinets', new FormControl(cbs));
    this.filterForm.addControl('device_types', new FormControl(dtps));
  }

  setPublicCloudAttributes() {
    this.filterForm.removeControl('data_center');
    this.filterForm.removeControl('cabinets');
    this.filterForm.removeControl('device_types');
    let accounts: string[] = [];
    this.cloudType = this.filterParam ? this.filterParam : 'gcp';
    this.filterForm.addControl('cloud_type', new FormControl(this.cloudType, [Validators.required]));
    if (this.cloudType == 'gcp') {
      this.publicCloudAccounts = this.gcpCloudAccounts.filter(ac => ac.co2emission_enabled);
      this.publicCloudAccounts.forEach(ac => accounts.push(ac));
    } else if (this.cloudType == 'aws') {
      this.publicCloudAccounts = this.awsCloudAccounts;
      this.publicCloudAccounts.forEach(ac => accounts.push(ac));
    }
    this.filterForm.addControl('cloud_accounts', new FormControl(accounts, [Validators.required]));
    this.filterForm.get('cloud_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(type => {
      this.filterForm.get('cloud_accounts').patchValue([]);
      if (type == 'gcp') {
        this.publicCloudAccounts = this.gcpCloudAccounts.filter(ac => ac.co2emission_enabled);
      } else if (type == 'aws') {
        this.publicCloudAccounts = this.awsCloudAccounts;
      }
    });
  }

  resetFilterForm() {
    this.buildForm();
  }

  dcChange() {
    let selectedDCIds = <string[]>this.filterForm.get('data_center').value;
    if (selectedDCIds == this.selectedFilterData.data_center) {
      return;
    }

    this.selectedFilterData.data_center = selectedDCIds;
    if (selectedDCIds.length) {
      this.filterForm.get('cabinets').reset();
      let dcCabinets = [];
      selectedDCIds.map(dcId => {
        const dcData = this.datacenters.find(dc => dc.datacenter_uuid == dcId);
        dcCabinets = dcCabinets.concat(dcData.cabinets);
      })
      this.cabinets = dcCabinets;
      let cbs: string[] = [];
      this.cabinets.map(cb => cbs.push(cb.cabinet_uuid));
      this.filterForm.get('cabinets').setValue(cbs);
    } else {
      this.cabinets = [];
    }
  }

  filterData() {
    this.viewType = this.filterForm.get('emission_by').value;
    if (this.viewType == 'datacenter') {
      const selectedCabintIds = <string[]>this.filterForm.get('cabinets').value;
      this.selectedFilterData.cabinets = selectedCabintIds && selectedCabintIds.length ? selectedCabintIds : [];
      const selectedDeviceTypes = <string[]>this.filterForm.get('device_types').value;
      this.selectedFilterData.device_types = selectedDeviceTypes && selectedDeviceTypes.length ? selectedDeviceTypes : [];
      this.getCo2EmissionByDC();
      this.getCo2EmissionByCabinet();
      this.getCo2EmissionByDCByQuarter();
      this.getCo2EmissionByDeviceType();
    } else { 
      this.cloudType = this.filterForm.get('cloud_type').value;
      const selectedCloudAccounts = this.filterForm.get('cloud_accounts').value;
      if (this.cloudType == 'gcp') {
        const selectedGcpAccounts = selectedCloudAccounts.map(ac => ac.uuid);
        this.selectedFilterData.cloud_accounts = selectedGcpAccounts && selectedGcpAccounts.length ? selectedGcpAccounts : [];
        if (this.selectedFilterData.cloud_accounts.length) {
          this.getCo2EmissionSummary();
          this.getCo2EmissionByProduct();
          this.getCo2EmissionByProject();
          this.getCo2EmissionByRegion();
          this.getCo2EmissionByQuarter();
          this.getCo2EmissionByMonth();
          this.getCo2EmissionByYear();
        }
      } else {
        const selectedAwsAccounts = selectedCloudAccounts.map(ac => ac.name);
        this.selectedFilterData.cloud_accounts = selectedAwsAccounts && selectedAwsAccounts.length ? selectedAwsAccounts : [];
        if (this.selectedFilterData.cloud_accounts.length) {
          this.getAwsCo2EmissionSummary();
          this.getAwsCo2EmissionByService();
          this.getAwsCo2EmissionByGeography();
          this.getAwsCo2EmissionByAccount();
          this.getAwsCo2EmissionByAccountId();
          this.getAwsCo2EmissionByQuarter();
          this.getAwsCo2EmissionByMonth();
          this.getAwsCo2EmissionByYear();
        }
      }
    }
  }

  getCo2EmissionByDC() {
    this.greenItEmissionService.getCo2EmissionByDC(this.selectedFilterData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.dcChartData = this.greenItEmissionService.convertToCo2EmissionByDCChartData(res);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.dcChartData = null;
      this.spinner.stop('main');
    })
  }

  getCo2EmissionByCabinet() {
    this.greenItEmissionService.getCo2EmissionByCabinet(this.selectedFilterData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.cabinetChartData = this.greenItEmissionService.convertToCo2EmissionByCabinetChartData(res);
    }, (err: HttpErrorResponse) => {
      this.cabinetChartData = null;
    })
  }

  getCo2EmissionByDCByQuarter() {
    this.greenItEmissionService.getCo2EmissionByDCByQuarter(this.selectedFilterData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.quarterChartData = this.greenItEmissionService.convertToCo2EmissionByDCByQuarterChartData(res);
    }, (err: HttpErrorResponse) => {
      this.quarterChartData = null;
    })
  }

  getCo2EmissionByDeviceType() {
    this.greenItEmissionService.getCo2EmissionByDeviceType(this.selectedFilterData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.deviceTypeChartData = this.greenItEmissionService.convertToCo2EmissionByDeviceTypeChartData(res);
    }, (err: HttpErrorResponse) => {
      this.deviceTypeChartData = null;
    })
  }

  getCo2EmissionSummary() {
    this.greenItEmissionService.getCo2EmissionSummary(this.selectedFilterData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.co2EmissionSummary = this.greenItEmissionService.convertToco2EmissionGcpSummary(res);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get CO2 by  summary data. Try again later'));
    });
  }

  getCo2EmissionByProduct() {
    this.spinner.start(this.co2ByProductData.loader);
    this.greenItEmissionService.getCo2EmissionByProduct(this.selectedFilterData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.co2ByProductData.listData = this.greenItEmissionService.convertTOCo2EmissionByProductListData(res);
      this.co2ByProductData.chartData = this.greenItEmissionService.convertToCo2EmissionByProductChartData(res);
      this.gcpHighestCo2Product = this.greenItEmissionService.convertToHighestCo2EmissionProduct(res);
      this.spinner.stop(this.co2ByProductData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.co2ByProductData.loader);
      this.notification.error(new Notification('Failed to get CO2 by product data. Try again later'));
    });
  }

  getCo2EmissionByProject() {
    this.spinner.start(this.co2ByProjectData.loader);
    this.greenItEmissionService.getCo2EmissionByProject(this.selectedFilterData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.co2ByProjectData.listData = this.greenItEmissionService.convertTOCo2EmissionByProjectListData(res);
      this.co2ByProjectData.chartData = this.greenItEmissionService.convertToCo2EmissionByProjectChartData(res);
      this.spinner.stop(this.co2ByProjectData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.co2ByProjectData.loader);
      this.notification.error(new Notification('Failed to get CO2 by product data. Try again later'));
    });
  }

  getCo2EmissionByRegion() {
    this.spinner.start(this.co2ByRegionData.loader);
    this.greenItEmissionService.getCo2EmissionByRegion(this.selectedFilterData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.co2ByRegionData.listData = this.greenItEmissionService.convertTOCo2EmissionByRegionListData(res);
      this.co2ByRegionData.chartData = this.greenItEmissionService.convertToCo2EmissionByRegionChartData(res);
      this.spinner.stop(this.co2ByRegionData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.co2ByRegionData.loader);
      this.notification.error(new Notification('Failed to get CO2 emission by region data. Try again later'));
    });
  }

  getCo2EmissionByQuarter() {
    this.spinner.start(this.co2ByQuarterData.loader);
    this.greenItEmissionService.getCo2EmissionByQuarter(this.selectedFilterData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.co2ByQuarterData.listData = this.greenItEmissionService.convertTOCo2EmissionByQuarterListData(res);
      this.co2ByQuarterData.chartData = this.greenItEmissionService.convertToCo2EmissionByQuarterChartData(res);
      this.spinner.stop(this.co2ByQuarterData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.co2ByQuarterData.loader);
      this.notification.error(new Notification('Failed to get CO2 emission by quarter data. Try again later'));
    });
  }

  getCo2EmissionByMonth() {
    this.spinner.start(this.co2ByMonthData.loader);
    this.greenItEmissionService.getCo2EmissionByMonth(this.selectedFilterData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.co2ByMonthData.listData = this.greenItEmissionService.convertTOCo2EmissionByMonthListData(res);
      this.co2ByMonthData.chartData = this.greenItEmissionService.convertToCo2EmissionByMonthChartData(res);
      this.spinner.stop(this.co2ByMonthData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.co2ByMonthData.loader);
      this.notification.error(new Notification('Failed to get CO2 emission by month data. Try again later'));
    });
  }

  getCo2EmissionByYear() {
    this.spinner.start(this.co2ByYearData.loader);
    this.greenItEmissionService.getCo2EmissionByYear(this.selectedFilterData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.co2ByYearData.listData = this.greenItEmissionService.convertTOCo2EmissionByYearListData(res);
      this.co2ByYearData.chartData = this.greenItEmissionService.convertToco2EmissionByYearChartData(res);
      this.spinner.stop(this.co2ByYearData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.co2ByYearData.loader);
      this.notification.error(new Notification('Failed to get CO2 emission by year data. Try again later'));
    });
  }

  getAwsCo2EmissionSummary() {
    this.greenItEmissionService.getAwsCo2EmissionSummary(this.selectedFilterData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.awsCo2EmissionSummary = this.greenItEmissionService.convertToAwsCo2EmissionBySummary(res);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get  Aws Summary data. Try again later'));
    })
  }

  getAwsCo2EmissionByService() {
    this.spinner.start(this.awsCo2ByServiceData.loader);
    this.greenItEmissionService.getAwsCo2EmissionByService(this.selectedFilterData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.awsCo2ByServiceData.chartData = this.greenItEmissionService.convertToAwsCo2EmissionByServiceChartData(res);
      this.awsCo2ByServiceData.listData = this.greenItEmissionService.convertTOAwsCo2EmissionByServiceListData(res);
      this.awsHighestCo2Service = this.greenItEmissionService.convertToAwsHighestCo2EmissionService(res);
      this.spinner.stop(this.awsCo2ByServiceData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.awsCo2ByServiceData.loader);
      this.notification.error(new Notification('Failed to get Aws CO2 emission by Service data. Try again later'));
    })
  }

  getAwsCo2EmissionByGeography() {
    this.spinner.start(this.awsCo2ByGeographyData.loader);
    this.greenItEmissionService.getAwsCo2EmissionByGeography(this.selectedFilterData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.awsCo2ByGeographyData.chartData = this.greenItEmissionService.convertToAwsco2EmissionByGeographyChartData(res);
      this.awsCo2ByGeographyData.listData = this.greenItEmissionService.convertToAwsCo2EmissionByGeographyListData(res);
      this.awsHighestCo2Geography = this.greenItEmissionService.convertToAwsHighestCo2EmissionGeography(res);
      this.spinner.stop(this.awsCo2ByGeographyData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.awsCo2ByGeographyData.loader);
      this.notification.error(new Notification('Failed to get Aws CO2 emission by Geography data. Try again later'));
    })
  }

  getAwsCo2EmissionByAccount() {
    this.spinner.start(this.awsCo2ByAccountData.loader);
    this.greenItEmissionService.getAwsCo2EmissionByAccount(this.selectedFilterData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.awsCo2ByAccountData.chartData = this.greenItEmissionService.convertToAwsco2EmissionByAccountChartData(res);
      this.awsCo2ByAccountData.listData = this.greenItEmissionService.convertToAwsCo2EmissionByAccountListData(res);
      this.spinner.stop(this.awsCo2ByAccountData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.awsCo2ByAccountData.loader);
      this.notification.error(new Notification('Failed to get Aws CO2 emission by Account data. Try again later'));
    })
  }

  getAwsCo2EmissionByAccountId() {
    this.spinner.start(this.awsCo2ByAccountIdData.loader);
    this.greenItEmissionService.getAwsCo2EmissionByAccountId(this.selectedFilterData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.awsCo2ByAccountIdData.chartData = this.greenItEmissionService.convertToAwsco2EmissionByAccountIdChartData(res);
      this.awsCo2ByAccountIdData.listData = this.greenItEmissionService.convertToAwsCo2EmissionByAccountIdListData(res);
      this.spinner.stop(this.awsCo2ByAccountIdData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.awsCo2ByAccountIdData.loader);
      this.notification.error(new Notification('Failed to get Aws CO2 emission by AccountId data. Try again later'));
    })
  }

  getAwsCo2EmissionByQuarter() {
    this.spinner.start(this.awsCo2ByQuarterData.loader);
    this.greenItEmissionService.getAwsCo2EmissionByQuarter(this.selectedFilterData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.awsCo2ByQuarterData.chartData = this.greenItEmissionService.convertToAwsco2EmissionByQuarterChartData(res);
      this.awsCo2ByQuarterData.listData = this.greenItEmissionService.convertToAwsCo2EmissionByQuarterListData(res);
      this.spinner.stop(this.awsCo2ByQuarterData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.awsCo2ByQuarterData.loader);
      this.notification.error(new Notification('Failed to get Aws CO2 emission by Quarter data. Try again later'));
    })
  }

  getAwsCo2EmissionByMonth() {
    this.spinner.start(this.awsCo2ByMonthData.loader);
    this.greenItEmissionService.getAwsCo2EmissionByMonth(this.selectedFilterData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.awsCo2ByMonthData.chartData = this.greenItEmissionService.convertToAwsco2EmissionByMonthChartData(res);
      this.awsCo2ByMonthData.listData = this.greenItEmissionService.convertToAwsCo2EmissionByMonthListData(res);
      this.spinner.stop(this.awsCo2ByMonthData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.awsCo2ByMonthData.loader);
      this.notification.error(new Notification('Failed to get Aws CO2 emission by Month data. Try again later'));
    })
  }

  getAwsCo2EmissionByYear() {
    this.spinner.start(this.awsCo2ByYearData.loader);
    this.greenItEmissionService.getAwsCo2EmissionByYear(this.selectedFilterData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.awsCo2ByYearData.chartData = this.greenItEmissionService.convertToAwsco2EmissionByYearChartData(res);
      this.awsCo2ByYearData.listData = this.greenItEmissionService.convertToAwsCo2EmissionByYearListData(res);
      this.spinner.stop(this.awsCo2ByYearData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.awsCo2ByYearData.loader);
      this.notification.error(new Notification('Failed to get Aws CO2 emission by Year data. Try again later'));
    })
  }

}
