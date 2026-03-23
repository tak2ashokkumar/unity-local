import { Component, OnDestroy, OnInit } from '@angular/core';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { AiObservabilityVectorDbSummaryService, DropDownsViewData, DurationDropdownViewData, VectorDbGenerationByApplicationWidgetViewData, VectorDbGenerationByEnvironmentWidgetViewData, VectorDbGenerationByOperationWidgetViewData, VectorDbGenerationBySystemWidgetViewData, VectorDbSummaryWidgetViewData } from './ai-observability-vector-db-summary.service';
import { Subject } from 'rxjs';
import { VectorDbListType } from './ai-observability-vector-db-summary.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'ai-observability-vector-db-summary',
  templateUrl: './ai-observability-vector-db-summary.component.html',
  styleUrls: ['./ai-observability-vector-db-summary.component.scss'],
  providers: [AiObservabilityVectorDbSummaryService]
})
export class AiObservabilityVectorDbSummaryComponent implements OnInit,OnDestroy {
  private ngUnsubscribe = new Subject();

  durationDropdownViewData: DurationDropdownViewData;
  dropdownsViewData: DropDownsViewData = new DropDownsViewData();
  isInitialPageLoad: boolean = true;

  vectorDbList: VectorDbListType[] = []
  vectorDbSettings: IMultiSelectSettings = {
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

  vectorDbTexts: IMultiSelectTexts = {
    defaultTitle: 'Select Vector DB',
    allSelected: 'All Selected',
  };

  vectorDbSummaryWidgetData: VectorDbSummaryWidgetViewData = new VectorDbSummaryWidgetViewData();
  vectorDbGenerationByOperationWidgetData: VectorDbGenerationByOperationWidgetViewData = new VectorDbGenerationByOperationWidgetViewData();
  vectorDbGenerationBySystemWidgetWidgetData: VectorDbGenerationBySystemWidgetViewData = new VectorDbGenerationBySystemWidgetViewData();
  VectorDbGenerationByApplicationWidgetData: VectorDbGenerationByApplicationWidgetViewData = new VectorDbGenerationByApplicationWidgetViewData();
  VectorDbGenerationByEnvironmentWidgetData: VectorDbGenerationByEnvironmentWidgetViewData = new VectorDbGenerationByEnvironmentWidgetViewData();

  constructor(private vectorDbsvc: AiObservabilityVectorDbSummaryService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService) { }

  ngOnInit(): void {
    this.spinner.start('main');
    this.durationDropdownViewData = this.vectorDbsvc.getDateDropdownOptions();
    this.getServiceNamesByTypeVectorDb();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.getServiceNamesByTypeVectorDb();
  }

  getServiceNamesByTypeVectorDb() {
    this.vectorDbsvc.getServiceNamesByTypeVectorDb().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.vectorDbList = res;
      this.dropdownsViewData.selectedVectorDbValue = res.map(service => service.uuid);
      setTimeout(() => {
        this.getAllWidgetsData();
      }, 3);
      this.isInitialPageLoad = false;
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.isInitialPageLoad = false;
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Vector DB list. Try again later'));
    })
  }

  ondurationDropdownChanged(event: any) {
    this.dropdownsViewData.selectedDateRangeFormData = event;
    if (!this.isInitialPageLoad) {
      this.getAllWidgetsData();
    }
  }

  onVectorDbFilterChange() {
    this.getAllWidgetsData();
  }

  getAllWidgetsData() {
    this.getVectorDbSummary()
    this.getVectorDbGenerationByOperation();
    this.getVectorDbGenerationBySystem();
    this.getVectorDbGenerationByApplication();
    this.getVectorDbGenerationByEnvironment();
  }

  getVectorDbSummary() {
    this.spinner.start(this.vectorDbSummaryWidgetData?.totalRequestLoader);
    this.spinner.start(this.vectorDbSummaryWidgetData.avgRequestDurationLoader);
    this.vectorDbSummaryWidgetData.totalRequest = null;
    this.vectorDbSummaryWidgetData.avgRequestDuration = null;
    this.vectorDbsvc.getVectorDbSummary(this.dropdownsViewData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.vectorDbSummaryWidgetData = this.vectorDbsvc.convertToVectorDbSummaryWidgetViewData(res);
      this.stopSummarySpinner();
    }, (err: HttpErrorResponse) => {
      this.stopSummarySpinner();
      this.notification.error(new Notification('Failed to Summary data. Try again later'));
    });
  }

  stopSummarySpinner() {
    this.spinner.stop(this.vectorDbSummaryWidgetData?.totalRequestLoader);
    this.spinner.stop(this.vectorDbSummaryWidgetData?.avgRequestDurationLoader);
  }

  getVectorDbGenerationByOperation() {
    this.spinner.start(this.vectorDbGenerationByOperationWidgetData.loader);
    this.vectorDbGenerationByOperationWidgetData.chartData = null;
    this.vectorDbsvc.getVectorDbGenerationByOperation(this.dropdownsViewData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.vectorDbGenerationByOperationWidgetData.chartData = this.vectorDbsvc.convertToGenerationByOperationChartData(res);
      this.spinner.stop(this.vectorDbGenerationByOperationWidgetData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.vectorDbGenerationByOperationWidgetData.loader);
      this.notification.error(new Notification('Failed to Generation By Operation data. Try again later'));
    });
  }

  getVectorDbGenerationBySystem() {
    this.spinner.start(this.vectorDbGenerationBySystemWidgetWidgetData.loader);
    this.vectorDbGenerationBySystemWidgetWidgetData.chartData = null;
    this.vectorDbsvc.getVectorDbGenerationBySystem(this.dropdownsViewData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.vectorDbGenerationBySystemWidgetWidgetData.chartData = this.vectorDbsvc.convertToGenerationBySystemTypeChartData(res);
      this.spinner.stop(this.vectorDbGenerationBySystemWidgetWidgetData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.vectorDbGenerationBySystemWidgetWidgetData.loader);
      this.notification.error(new Notification('Failed to Generation By System data. Try again later'));
    });
  }

  getVectorDbGenerationByApplication() {
    this.spinner.start(this.VectorDbGenerationByApplicationWidgetData.loader);
    this.VectorDbGenerationByApplicationWidgetData.chartData = null;
    this.vectorDbsvc.getVectorDbGenerationByApplication(this.dropdownsViewData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.VectorDbGenerationByApplicationWidgetData.chartData = this.vectorDbsvc.convertToGenerationByApplicationTypeChartData(res);
      this.spinner.stop(this.VectorDbGenerationByApplicationWidgetData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.VectorDbGenerationByApplicationWidgetData.loader);
      this.notification.error(new Notification('Failed to Generation By Application data. Try again later'));
    });
  }

  getVectorDbGenerationByEnvironment() {
    this.spinner.start(this.VectorDbGenerationByEnvironmentWidgetData.loader);
    this.VectorDbGenerationByEnvironmentWidgetData.chartData = null;
    this.vectorDbsvc.getVectorDbGenerationByEnvironment(this.dropdownsViewData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.VectorDbGenerationByEnvironmentWidgetData.chartData = this.vectorDbsvc.convertToGenerationByEnvironmentTypeChartData(res);
      this.spinner.stop(this.VectorDbGenerationByEnvironmentWidgetData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.VectorDbGenerationByEnvironmentWidgetData.loader);
      this.notification.error(new Notification('Failed to Generation By Environment data. Try again later'));
    });
  }

}
