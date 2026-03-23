import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { AiObservabilityLlmSummaryService, AvgTokensSummaryViewData, CostByApplicationWidgetViewData, CostByEnvironmentWidgetViewData, DropDownsViewData, DurationDropdownViewData, GenerationByCategoryWidgetViewData, GenerationByProviderWidgetViewData, GenerationByTopAIModelsWidgetViewData, LlmSummaryWidgetViewData, ModelsByTimeWidgetData, RequestsByTimeWidgetData, TokensUsageWidgetViewData } from './ai-observability-llm-summary.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { LlmListType } from './ai-observability-llm-summary.type';

@Component({
  selector: 'ai-observability-llm-summary',
  templateUrl: './ai-observability-llm-summary.component.html',
  styleUrls: ['./ai-observability-llm-summary.component.scss'],
  providers: [AiObservabilityLlmSummaryService]
})
export class AiObservabilityLlmSummaryComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  durationDropdownViewData: DurationDropdownViewData;
  dropdownsViewData: DropDownsViewData = new DropDownsViewData();

  llmList: LlmListType[] = []
  llmSettings: IMultiSelectSettings = {
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

  llmTexts: IMultiSelectTexts = {
    defaultTitle: 'Select LLM',
  };

  isInitialPageLoad: boolean = true;

  llmSummaryWidgetData: LlmSummaryWidgetViewData = new LlmSummaryWidgetViewData();
  requestsByTimeWidgetData: RequestsByTimeWidgetData = new RequestsByTimeWidgetData();
  generationByCategoryWidgetData: GenerationByCategoryWidgetViewData = new GenerationByCategoryWidgetViewData();
  generationByProviderWidgetData: GenerationByProviderWidgetViewData = new GenerationByProviderWidgetViewData();
  costByEnvironmentWidgetData: CostByEnvironmentWidgetViewData = new CostByEnvironmentWidgetViewData();
  costByApplicationWidgetData: CostByApplicationWidgetViewData = new CostByApplicationWidgetViewData();
  avgTokensSummaryWidgetData: AvgTokensSummaryViewData = new AvgTokensSummaryViewData();
  tokensUsageWidgetData: TokensUsageWidgetViewData = new TokensUsageWidgetViewData();
  topAIModelsWidgetData: GenerationByTopAIModelsWidgetViewData = new GenerationByTopAIModelsWidgetViewData();
  modelsByTimeWidgetData: ModelsByTimeWidgetData = new ModelsByTimeWidgetData();

  constructor(private svc: AiObservabilityLlmSummaryService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService) { }

  ngOnInit(): void {
    this.spinner.start('main');
    this.durationDropdownViewData = this.svc.getDurationDropdownViewData();
    this.getLlmsList();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.getLlmsList();
  }

  getLlmsList() {
    this.svc.getLlmsList().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.llmList = res;
      this.dropdownsViewData.selectedLlmValue = res.map(llm => llm.uuid);
      setTimeout(() => {
        this.getAllWidgetsData();
      }, 3);
      this.isInitialPageLoad = false;
    }, (err: HttpErrorResponse) => {
      this.isInitialPageLoad = false;
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get LLM list. Try again later'));
    })
  }

  ondurationDropdownChanged(event: any) {
    this.dropdownsViewData.selectedDateRangeFormData = event;
    if (!this.isInitialPageLoad) {
      this.getAllWidgetsData();
    }
  }

  onLlmFilterChange() {
    this.getAllWidgetsData();
  }

  getAllWidgetsData() {
    this.getLlmSummary();
    this.getRequestsByTime();
    this.getGenerationByCategory();
    this.getGenerationByProvider();
    this.getCostByEnvironment();
    this.getCostByApplication();
    this.getAvgTokensSummary();
    this.getTokensUsage();
    this.getTopAIModels();
    this.getModelsByTime();
    this.isInitialPageLoad = false;
    this.spinner.stop('main');
  }

  getLlmSummary() {
    this.startSummarySpinner();
    this.llmSummaryWidgetData.totalRequest = null;
    this.llmSummaryWidgetData.avgRequestDuration = null;
    this.llmSummaryWidgetData.avgTokensPerRequest = null;
    this.llmSummaryWidgetData.totalCost = null;
    this.llmSummaryWidgetData.avgCostPerRequest = null;
    this.svc.getLlmSummary(this.dropdownsViewData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.llmSummaryWidgetData = this.svc.convertToLlmSummaryViewData(res);
      this.stopSummarySpinner();
    }, (err: HttpErrorResponse) => {
      this.stopSummarySpinner();
      this.notification.error(new Notification('Failed to get Summary data. Try again later'));
    })
  }

  startSummarySpinner() {
    this.spinner.start(this.llmSummaryWidgetData.totalRequestLoader);
    this.spinner.start(this.llmSummaryWidgetData.avgRequestDurationLoader);
    this.spinner.start(this.llmSummaryWidgetData.avgTokensPerRequestLoader);
    this.spinner.start(this.llmSummaryWidgetData.totalCostLoader);
    this.spinner.start(this.llmSummaryWidgetData.avgCostPerRequestLoader);
  }

  stopSummarySpinner() {
    this.spinner.stop(this.llmSummaryWidgetData.totalRequestLoader);
    this.spinner.stop(this.llmSummaryWidgetData.avgRequestDurationLoader);
    this.spinner.stop(this.llmSummaryWidgetData.avgTokensPerRequestLoader);
    this.spinner.stop(this.llmSummaryWidgetData.totalCostLoader);
    this.spinner.stop(this.llmSummaryWidgetData.avgCostPerRequestLoader);
  }

  getRequestsByTime() {
    this.spinner.start(this.requestsByTimeWidgetData.loader);
    this.requestsByTimeWidgetData.chartData = null;
    this.svc.getRequestsByTime(this.dropdownsViewData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.requestsByTimeWidgetData.chartData = this.svc.convertToRequestsByTimeChartData(res, this.dropdownsViewData);
      this.spinner.stop(this.requestsByTimeWidgetData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.requestsByTimeWidgetData.loader);
      this.notification.error(new Notification('Failed to get Requests By Time data. Try again later'));
    })
  }

  getGenerationByCategory() {
    this.spinner.start(this.generationByCategoryWidgetData.loader);
    this.generationByCategoryWidgetData.chartData = null;
    this.svc.getGenerationByCategory(this.dropdownsViewData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.generationByCategoryWidgetData.chartData = this.svc.convertToGenerationByCategoryChartData(res);
      this.spinner.stop(this.generationByCategoryWidgetData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.generationByCategoryWidgetData.loader);
      this.notification.error(new Notification('Failed to get Generation By Category data. Try again later'));
    })
  }

  getGenerationByProvider() {
    this.spinner.start(this.generationByProviderWidgetData.loader);
    this.generationByProviderWidgetData.chartData = null;
    this.svc.getGenerationByProvider(this.dropdownsViewData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.generationByProviderWidgetData.chartData = this.svc.convertToGenerationByProviderChartData(res);
      this.spinner.stop(this.generationByProviderWidgetData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.generationByProviderWidgetData.loader);
      this.notification.error(new Notification('Failed to get Generation By Provider data. Try again later'));
    })
  }

  getCostByEnvironment() {
    this.spinner.start(this.costByEnvironmentWidgetData.loader);
    this.costByEnvironmentWidgetData.chartData = null;
    this.svc.getCostByEnvironment(this.dropdownsViewData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.costByEnvironmentWidgetData.chartData = this.svc.convertToCostByEnvironmentChartData(res);
      this.spinner.stop(this.costByEnvironmentWidgetData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.costByEnvironmentWidgetData.loader);
      this.notification.error(new Notification('Failed to get Cost By Environment data. Try again later'));
    })
  }

  getCostByApplication() {
    this.spinner.start(this.costByApplicationWidgetData.loader);
    this.costByApplicationWidgetData.chartData = null;
    this.svc.getCostByApplication(this.dropdownsViewData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.costByApplicationWidgetData.chartData = this.svc.convertToCostByApplicationChartData(res);
      this.spinner.stop(this.costByApplicationWidgetData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.costByApplicationWidgetData.loader);
      this.notification.error(new Notification('Failed to get Cost By Application data. Try again later'));
    })
  }

  getAvgTokensSummary() {
    this.spinner.start(this.avgTokensSummaryWidgetData.AvgPromptTokensLoader);
    this.spinner.start(this.avgTokensSummaryWidgetData.AvgCompletionTokensLoader);
    this.avgTokensSummaryWidgetData.AvgPromptTokens = null;
    this.avgTokensSummaryWidgetData.AvgCompletionTokens = null;
    this.svc.getAvgTokensSummary(this.dropdownsViewData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.avgTokensSummaryWidgetData = this.svc.convertToAvgTokensSummaryViewData(res);
      this.spinner.stop(this.avgTokensSummaryWidgetData.AvgPromptTokensLoader);
      this.spinner.stop(this.avgTokensSummaryWidgetData.AvgCompletionTokensLoader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.avgTokensSummaryWidgetData.AvgPromptTokensLoader);
      this.spinner.stop(this.avgTokensSummaryWidgetData.AvgCompletionTokensLoader);
      this.notification.error(new Notification('Failed to get Average Tokens Summary. Try again later'));
    })
  }

  getTokensUsage() {
    this.spinner.start(this.tokensUsageWidgetData.loader);
    this.tokensUsageWidgetData.chartData = null;
    this.svc.getTokensUsage(this.dropdownsViewData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tokensUsageWidgetData.chartData = this.svc.convertToTokensUsageChartData(res, this.dropdownsViewData);
      this.spinner.stop(this.tokensUsageWidgetData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.tokensUsageWidgetData.loader);
      this.notification.error(new Notification('Failed to get Tokens Usage data. Try again later'));
    })
  }

  getTopAIModels() {
    this.spinner.start(this.topAIModelsWidgetData.loader);
    this.topAIModelsWidgetData.chartData = null;
    this.svc.getTopAIModels(this.dropdownsViewData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.topAIModelsWidgetData.chartData = this.svc.convertToTopAIModelsChartData(res);
      this.spinner.stop(this.topAIModelsWidgetData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.topAIModelsWidgetData.loader);
      this.notification.error(new Notification('Failed to get Top AI Models data. Try again later'));
    })
  }

  getModelsByTime() {
    this.spinner.start(this.modelsByTimeWidgetData.loader);
    this.modelsByTimeWidgetData.chartData = null;
    this.svc.getModelsByTime(this.dropdownsViewData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.modelsByTimeWidgetData.chartData = this.svc.convertToModelsByTimeChartData(res, this.dropdownsViewData);
      this.spinner.stop(this.modelsByTimeWidgetData.loader);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop(this.modelsByTimeWidgetData.loader);
      this.notification.error(new Notification('Failed to get Models By Time data. Try again later'));
    })
  }

}
