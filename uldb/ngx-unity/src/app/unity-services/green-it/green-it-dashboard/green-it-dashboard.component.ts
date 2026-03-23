import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MapService } from 'src/app/map.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { GreenITService } from '../green-it.service';
import { ChartData, DatacenterPublicCloudCo2EmissionDashboardSummaryViewdata, GreenItDashboardService, greenItSummaryView } from './green-it-dashboard.service';
import { Co2EmissionData } from './green-it-dashboard.type';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';


@Component({
  selector: 'green-it-dashboard',
  templateUrl: './green-it-dashboard.component.html',
  styleUrls: ['./green-it-dashboard.component.scss'],
  providers: [GreenITService, GreenItDashboardService]
})
export class GreenItDashboardComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  devicesChartData: ChartData;
  dcChartData: ChartData;
  pcChartData: ChartData;
  deviceTypeChartData: ChartData;
  quarterChartData: ChartData;
  yearChartData: ChartData;
  summaryData: greenItSummaryView = new greenItSummaryView();
  datacenterPublicCloudCo2Summary: DatacenterPublicCloudCo2EmissionDashboardSummaryViewdata = new DatacenterPublicCloudCo2EmissionDashboardSummaryViewdata();
  datacenterPublicCloudCo2SummarySpinner: boolean = false;
  constructor(private greenItService: GreenITService,
    private greenItDashboardService: GreenItDashboardService,
    private spinner: AppSpinnerService,
    public mapService: MapService,
    private router: Router,
    private route: ActivatedRoute,
    private storage: StorageService) {

  }

  ngOnInit() {
    setTimeout(() => {
      this.spinner.start('main');
      this.getDatacenterPublicCloudCo2Summary()
      this.getTop10Co2EmittedTagGroups();
      this.getCo2EmissionByDC();
      this.getCo2EmissionByPrivateCloud();
      this.getCo2EmissionByDeviceType();
      this.getCo2EmissionByQuarter();
      this.getCo2EmissionByYear();
    }, 0);
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(event: any) {
    setTimeout(() => {
      this.spinner.start('main');
      this.getDatacenterPublicCloudCo2Summary();
      this.getTop10Co2EmittedTagGroups();
      this.getCo2EmissionByDC();
      this.getCo2EmissionByPrivateCloud();
      this.getCo2EmissionByDeviceType();
      this.getCo2EmissionByQuarter();
      this.getCo2EmissionByYear();
    }, 0);
  }

  getTop10Co2EmittedTagGroups() {
    this.greenItDashboardService.getTop10Co2EmittedTagGroups().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.devicesChartData = this.greenItDashboardService.convertToTop10Co2EmittedTagGroupsChartData(res);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.devicesChartData = null;
      this.spinner.stop('main');
    })
  }

  getDatacenterPublicCloudCo2Summary() {
    this.greenItDashboardService.getDatacenterPublicCloudCo2Summary().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.datacenterPublicCloudCo2Summary = this.greenItDashboardService.convertToDatacenterPublicCloudCo2EmissionDashboard(data);
      this.datacenterPublicCloudCo2SummarySpinner = true;
    }, (err: HttpErrorResponse) => {
      this.datacenterPublicCloudCo2Summary = null;
    });
  }

  getCo2EmissionByDC() {
    this.greenItDashboardService.getCo2EmissionByDC().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.dcChartData = this.greenItDashboardService.convertToCo2EmissionByDCChartData(res);
      this.summaryData = this.greenItDashboardService.convertToSummaryViewData(res);
      this.getCo2EmissionByDeviceType();
    }, (err: HttpErrorResponse) => {
      this.dcChartData = null;
      this.summaryData = null;
      this.getCo2EmissionByDeviceType();
    })
  }

  getCo2EmissionByPrivateCloud() {
    this.greenItDashboardService.getCo2EmissionByPrivateCloud().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.pcChartData = this.greenItDashboardService.convertToCo2EmissionByPCChartData(res);
    }, (err: HttpErrorResponse) => {
      this.pcChartData = null;
    })
  }

  getCo2EmissionByDeviceType() {
    this.greenItDashboardService.getCo2EmissionByDeviceType().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.deviceTypeChartData = this.greenItDashboardService.convertToCo2EmissionByDeviceTypeChartData(res);
      if (this.summaryData) {
        let temp = 0;
        Object.entries(res).map(dt => {
          let e = (<Co2EmissionData>dt.getLast());
          if (temp < e.co2_emitted) {
            temp = e.co2_emitted;
            this.summaryData.deviceTypeWithHighestCo2Emission = this.greenItService.getDeviceTypeDisplayNames(<string>dt.getFirst());
          }
        })
      }
    }, (err: HttpErrorResponse) => {
      this.deviceTypeChartData = null;
    })
  }

  getCo2EmissionByQuarter() {
    this.greenItDashboardService.getCo2EmissionByQuarter().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.quarterChartData = this.greenItDashboardService.convertToCo2EmissionByQuarterChartData(res);
    }, (err: HttpErrorResponse) => {
      this.quarterChartData = null;
    })
  }

  getCo2EmissionByYear() {
    this.greenItDashboardService.getCo2EmissionByYear().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.yearChartData = this.greenItDashboardService.convertToCo2EmissionByYearChartData(res);
    }, (err: HttpErrorResponse) => {
      this.yearChartData = null;
    })
  }

  goTo(path: string) {
    switch(path) {
      case 'gcp':
        this.storage.put('selectedOption', 'gcp', StorageType.SESSIONSTORAGE);
        this.router.navigate(['emission-details'], { relativeTo: this.route.parent}); break;
      case 'aws':
        this.storage.put('selectedOption', 'aws', StorageType.SESSIONSTORAGE);
        this.router.navigate(['emission-details'], { relativeTo: this.route.parent}); break;
    }
  }
}
