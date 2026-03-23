import { Component, OnInit } from '@angular/core';
import { DashboardQueryLogViewData, MODULE_OPTIONS, PERIOD_OPTIONS, QueryDetailsViewData, QueryStatisticsSummaryViewData, UnitySetupQueryStatisticsService } from './unity-setup-query-statistics.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { TopQueries, UnityChatBotResponse } from './unity-setup-query-statistics.type';
import { ChatHistoryData, UnityChatBotResponseChartData, UnityChatBotResponseTableData } from 'src/app/unity-chatbot/unity-chatbot.type';
import { UnityChartDetails } from 'src/app/shared/unity-chart-config.service';
import { ChatbotTableViewData, UcTableService } from 'src/app/unity-chatbot/uc-table/uc-table.service';
import { UcChartsService } from 'src/app/unity-chatbot/uc-charts/uc-charts.service';
import { FormGroup } from '@angular/forms';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';

@Component({
  selector: 'unity-setup-query-statistics',
  templateUrl: './unity-setup-query-statistics.component.html',
  styleUrls: ['./unity-setup-query-statistics.component.scss'],
  providers: [UnitySetupQueryStatisticsService, UcTableService, UcChartsService]
})
export class UnitySetupQueryStatisticsComponent implements OnInit {
  currentCriteria: SearchCriteria;
  private ngUnsubscribe = new Subject();
  viewData: DashboardQueryLogViewData[] = [];
  count: number;
  selectedQuery: any = null;
  showDrawer = false;
  queryDetailsViewData: QueryDetailsViewData;
  chatHistoryData: Array<ChatHistoryData> = [];
  topQueriesviewData: TopQueries[] = [];
  summaryViewData: QueryStatisticsSummaryViewData;
  tokenChartData: UnityChartDetails;
  likeAndDislikeChartData: UnityChartDetails;
  queryChartData: UnityChartDetails;
  widgetFilterform: FormGroup;
  periodOptions = PERIOD_OPTIONS;
  modules = MODULE_OPTIONS;

  moduleListSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "label",
    keyToSelect: "value",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true,
    maxHeight: '250px'
  };

  moduleSelectionTexts: IMultiSelectTexts = {
    defaultTitle: 'Select Modules',
  };

  constructor(private svc: UnitySetupQueryStatisticsService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private tableService: UcTableService,
    private chartService: UcChartsService,) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ status: null, reaction: null }], multiValueParam: { 'module': [] } };
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.buildWidgetFilterForm();
      this.getChatbotLikeDislikeTrend();
    }, 1000)
    // this.getTopUsedQueries();
    // this.getTokenUsed();
    this.getSummaryData();
    this.getqueryStatistics();
  }

  onSearched(event: string) {
    this.spinner.start('query-statistics');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getqueryStatistics();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo !== pageNo) {
      this.spinner.start('query-statistics');
      this.currentCriteria.pageNo = pageNo;
      this.getqueryStatistics();
    }
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('query-statistics');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getqueryStatistics();
  }

  refreshData(pageNo: number) {
    this.spinner.start('query-statistics');
    this.currentCriteria.pageNo = pageNo;
    this.buildWidgetFilterForm();
    this.getSummaryData();
    this.getqueryStatistics();
    this.getChatbotLikeDislikeTrend();
  }

  onFilterChange() {
    this.currentCriteria.pageNo = 1;
    this.getqueryStatistics();
  }

  buildWidgetFilterForm() {
    this.widgetFilterform = this.svc.createWidgetFilterForm();
    this.getQuerySuccessRatio();
    this.manageWidgetFilterForm();
  }

  getSummaryData() {
    this.spinner.start('summary-data');
    this.svc.getSummaryData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.summaryViewData = this.svc.convertToSummaryViewdata(data);
      this.spinner.stop('summary-data');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('summary-data');
      this.notification.error(new Notification('Failed to fetch Summary Data'));
    });
  }

  getqueryStatistics() {
    // this.spinner.start('query-statistics');
    this.svc.getqueryStatistics(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      this.viewData = this.svc.convertToViewdata(data.results);
      this.spinner.stop('query-statistics');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('query-statistics');
      this.notification.error(new Notification('Failed to fetch Query Statistics'));
    });
  }

  getQuerySuccessRatio() {
    this.spinner.start('query-ratio');
    this.svc.getQuerySuccessRatio(this.widgetFilterform.get('filter_date').value).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.queryChartData = this.svc.convertToQuerySuccessRatioChartdata(this.widgetFilterform.get('filter_date').value, data);
      this.spinner.stop('query-ratio');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('query-ratio');
      this.notification.error(new Notification('Failed to Query Success Ratio'));
    });
  }

  manageWidgetFilterForm() {
    this.widgetFilterform.get('filter_date').valueChanges.pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((data: any) => {
        this.getQuerySuccessRatio();
      });
  }

  getTokenUsed() {
    this.svc.getTokenUsed().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.tokenChartData = this.svc.convertToTokenUsedChartsdata(data);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to fetch Query Statistics'));
    });
  }

  getChatbotLikeDislikeTrend() {
    this.spinner.start('like-dislike');
    this.svc.getChatbotLikeDislikeTrend().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.likeAndDislikeChartData = this.svc.convertToLikeDislikeTrendChartsData(data);
      this.spinner.stop('like-dislike');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('like-dislike');
      this.notification.error(new Notification('Failed to fetch Like Dislike Trend Data'));
    });
  }

  getTopUsedQueries() {
    this.svc.getTopUsedQueries().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.topQueriesviewData = data;
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to fetch Top Used Queries'));
    });
  }

  openQueryDetails(view: DashboardQueryLogViewData) {
    this.selectedQuery = view;
    this.showDrawer = true;
    this.svc.getQueryDetails(view).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.queryDetailsViewData = this.svc.convertToQueryDetailsViewdata(data);
      this.manageResponse(data.response);
      this.queryDetailsViewData.chatHistoryData = this.chatHistoryData;
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to fetch Query Details'));
    });
  }

  closeDrawer(): void {
    this.showDrawer = false;
  }

  manageResponse(data: UnityChatBotResponse[]) {
    this.chatHistoryData = [];
    if (data.length && data.length == 1) {
      if (data[0].type == 'text') {
        this.chatHistoryData.push({ user: 'bot', message: (data[0].data as string), type: 'text' });
      } else if (data[0].type == 'table') {
        const tableData = this.tableService.convertToTableViewData(data[0].data as UnityChatBotResponseTableData);
        this.chatHistoryData.push({ user: 'bot', message: (tableData as ChatbotTableViewData), type: 'table' });
      } else if (data[0].type == 'pie_chart') {
        const chartData = this.chartService.convertToPieChartViewData(data[0].data as UnityChatBotResponseChartData);
        this.chatHistoryData.push({ user: 'bot', message: (chartData as UnityChartDetails), type: 'chart' });
      } else if (data[0].type == 'bar_chart') {
        const chartData = this.chartService.convertToBarChartViewData(data[0].data as UnityChatBotResponseChartData);
        this.chatHistoryData.push({ user: 'bot', message: (chartData as UnityChartDetails), type: 'chart' });
      } else if (data[0].type == 'donut_chart') {
        const chartData = this.chartService.convertToPieChartViewData(data[0].data as UnityChatBotResponseChartData, data[0].type);
        this.chatHistoryData.push({ user: 'bot', message: (chartData as UnityChartDetails), type: 'chart' });
      } else {
        // this.chatHistoryData.push({ user: 'bot', message: 'Sorry, I am having trouble right now.', type: 'text' });
      }
    } else if (data.length && data.length > 1) {
      let responseArray = data;
      responseArray = data.sort((a, b) => a.order - b.order);
      responseArray.forEach(r => {
        if (r.type == 'text') {
          this.chatHistoryData.push({ user: 'bot', message: (r.data as string), type: 'text' });
        } else if (r.type == 'table') {
          const tableData = this.tableService.convertToTableViewData(r.data as UnityChatBotResponseTableData);
          this.chatHistoryData.push({ user: 'bot', message: (tableData as ChatbotTableViewData), type: 'table' });
        } else if (r.type == 'pie_chart') {
          const chartData = this.chartService.convertToPieChartViewData(r.data as UnityChatBotResponseChartData);
          this.chatHistoryData.push({ user: 'bot', message: (chartData as UnityChartDetails), type: 'chart' });
        } else if (r.type == 'bar_chart') {
          const chartData = this.chartService.convertToBarChartViewData(r.data as UnityChatBotResponseChartData);
          this.chatHistoryData.push({ user: 'bot', message: (chartData as UnityChartDetails), type: 'chart' });
        } else if (r.type == 'donut_chart') {
          const chartData = this.chartService.convertToPieChartViewData(r.data as UnityChatBotResponseChartData, r.type);
          this.chatHistoryData.push({ user: 'bot', message: (chartData as UnityChartDetails), type: 'chart' });
        }
      })
    } else {
      this.chatHistoryData.push({ user: 'bot', message: 'Sorry, I am having trouble right now.', type: 'text' });
    }
  }

}
