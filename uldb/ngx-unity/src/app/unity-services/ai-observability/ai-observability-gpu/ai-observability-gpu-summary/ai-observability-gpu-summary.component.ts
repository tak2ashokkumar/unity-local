import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { AiObservabilityGpuSummaryService, AvgFanSpeedUsageWidgetViewData, AvgMemoryUsageWidgetViewData, AvgPowerUsageWidgetViewData, AvgTemperatureUsageWidgetViewData, AvgUtilizationWidgetViewData, DropDownsViewData, DurationDropdownViewData, GpuSummaryWidgetViewData } from './ai-observability-gpu-summary.service';
import { Subject } from 'rxjs';
import { GpuListType } from './ai-observability-gpu-summary.type';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'ai-observability-gpu-summary',
  templateUrl: './ai-observability-gpu-summary.component.html',
  styleUrls: ['./ai-observability-gpu-summary.component.scss'],
  providers: [AiObservabilityGpuSummaryService]
})
export class AiObservabilityGpuSummaryComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  durationDropdownViewData: DurationDropdownViewData;
  dropdownsViewData: DropDownsViewData = new DropDownsViewData();

  gpuList: GpuListType[] = []
  gpuSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: "uuid",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };

  gpuTexts: IMultiSelectTexts = {
    defaultTitle: 'Select GPU',
  };

  isInitialPageLoad: boolean = true;

  gpuSummaryWidgetData: GpuSummaryWidgetViewData = new GpuSummaryWidgetViewData();
  avgUtilizationWidgetData: AvgUtilizationWidgetViewData = new AvgUtilizationWidgetViewData();
  avgTemperatureUsageWidgetData: AvgTemperatureUsageWidgetViewData = new AvgTemperatureUsageWidgetViewData();
  avgMemoryUsageWidgetData: AvgMemoryUsageWidgetViewData = new AvgMemoryUsageWidgetViewData();
  avgPowerUsageWidgetData: AvgPowerUsageWidgetViewData = new AvgPowerUsageWidgetViewData();
  avgFanSpeedUsageWidgetData: AvgFanSpeedUsageWidgetViewData = new AvgFanSpeedUsageWidgetViewData();

  constructor(private svc: AiObservabilityGpuSummaryService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService) { }

  ngOnInit(): void {
    this.spinner.start('main');
    this.durationDropdownViewData = this.svc.getDurationDropdownViewData();
    this.getGpuList();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.getGpuList();
  }

  getGpuList() {
    this.svc.getGpuList().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.gpuList = res;
      this.dropdownsViewData.selectedGpuValue = res.map(gpu => gpu.uuid);
      setTimeout(() => {
        this.getAllWidgetsData();
      }, 3);
      this.isInitialPageLoad = false;
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.isInitialPageLoad = false;
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get GPU list. Try again later'));
    })
  }

  ondurationDropdownChanged(event: any) {
    this.dropdownsViewData.selectedDateRangeFormData = event;
    if (!this.isInitialPageLoad) {
      this.getAllWidgetsData();
    }
  }

  onGpuFilterChange() {
    this.getAllWidgetsData();
  }

  getAllWidgetsData() {
    this.getGpuSummary();
    this.getAvgUtilization();
    this.getAvgTemperatureUsage();
    this.getAvgMemoryUsage();
    this.getAvgPowerUsage();
    this.getAvgFanSpeedUsage();
  }

  getGpuSummary() {
    this.startSummarySpinner();
    this.svc.getGpuSummary(this.dropdownsViewData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.gpuSummaryWidgetData = this.svc.convertToGpuSummaryViewData(res);
      this.stopSummarySpinner();
    }, (err: HttpErrorResponse) => {
      this.stopSummarySpinner();
      this.gpuSummaryWidgetData = new GpuSummaryWidgetViewData();
      this.notification.error(new Notification('Failed to get Summary data. Try again later'));
    })
  }

  startSummarySpinner() {
    this.spinner.start(this.gpuSummaryWidgetData.avgUtilizationPerLoader);
    this.spinner.start(this.gpuSummaryWidgetData.avgTemperatureLoader);
    this.spinner.start(this.gpuSummaryWidgetData.avgPowerDrawLoader);
    this.spinner.start(this.gpuSummaryWidgetData.avgMemoryUsedLoader);
  }

  stopSummarySpinner() {
    this.spinner.stop(this.gpuSummaryWidgetData.avgUtilizationPerLoader);
    this.spinner.stop(this.gpuSummaryWidgetData.avgTemperatureLoader);
    this.spinner.stop(this.gpuSummaryWidgetData.avgPowerDrawLoader);
    this.spinner.stop(this.gpuSummaryWidgetData.avgMemoryUsedLoader);
  }

  getAvgUtilization() {
    this.spinner.start(this.avgUtilizationWidgetData.loader);
    this.avgUtilizationWidgetData.chartData = null;
    this.svc.getAvgUtilization(this.dropdownsViewData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.avgUtilizationWidgetData.chartData = this.svc.converToAvgUtilizationPercentageChartViewData(res, this.dropdownsViewData);
      this.spinner.stop(this.avgUtilizationWidgetData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.avgUtilizationWidgetData.loader);
      this.notification.error(new Notification('Failed to get Average Utilization data. Try again later'));
    })
  }

  getAvgTemperatureUsage() {
    this.spinner.start(this.avgTemperatureUsageWidgetData.loader);
    this.avgTemperatureUsageWidgetData.chartData = null;
    this.svc.getAvgTemperatureUsage(this.dropdownsViewData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.avgTemperatureUsageWidgetData.chartData = this.svc.converToAvgTemperatureChartViewData(res, this.dropdownsViewData);
      this.spinner.stop(this.avgTemperatureUsageWidgetData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.avgTemperatureUsageWidgetData.loader);
      this.notification.error(new Notification('Failed to get Temperature Usage data. Try again later'));
    })
  }

  getAvgMemoryUsage() {
    this.spinner.start(this.avgMemoryUsageWidgetData.loader);
    this.avgMemoryUsageWidgetData.chartData = null;
    this.svc.getAvgMemoryUsage(this.dropdownsViewData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.avgMemoryUsageWidgetData.chartData = this.svc.converToAvgMemoryChartViewData(res, this.dropdownsViewData);
      this.spinner.stop(this.avgMemoryUsageWidgetData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.avgMemoryUsageWidgetData.loader);
      this.notification.error(new Notification('Failed to get Memory Usage data. Try again later'));
    })
  }

  getAvgPowerUsage() {
    this.spinner.start(this.avgPowerUsageWidgetData.loader);
    this.avgPowerUsageWidgetData.chartData = null;
    this.svc.getAvgPowerUsage(this.dropdownsViewData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.avgPowerUsageWidgetData.chartData = this.svc.converToAvgPowerChartViewData(res, this.dropdownsViewData);
      this.spinner.stop(this.avgPowerUsageWidgetData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.avgPowerUsageWidgetData.loader);
      this.notification.error(new Notification('Failed to get Power Usage data. Try again later'));
    })
  }

  getAvgFanSpeedUsage() {
    this.spinner.start(this.avgFanSpeedUsageWidgetData.loader);
    this.avgFanSpeedUsageWidgetData.chartData = null;
    this.svc.getAvgFanSpeedUsage(this.dropdownsViewData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.avgFanSpeedUsageWidgetData.chartData = this.svc.converToAvgFanSpeedChartViewData(res, this.dropdownsViewData);
      this.spinner.stop(this.avgFanSpeedUsageWidgetData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.avgFanSpeedUsageWidgetData.loader);
      this.notification.error(new Notification('Failed to get Fan Speed Usage data. Try again later'));
    })
  }

}
