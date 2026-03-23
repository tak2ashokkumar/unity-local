import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { DATACENTER_COST_SUMMARY_TICKET_METADATA, DATACENTER_SUMMARY_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { BillDetailsItemViewData, CostSummaryInfoViewData, DCCostAnalysisChartViewdata, DcCostAnalysisSummaryService, WidgetSummaryInfoViewData } from './dc-cost-analysis-summary.service';


@Component({
  selector: 'dc-cost-analysis-summary',
  templateUrl: './dc-cost-analysis-summary.component.html',
  styleUrls: ['./dc-cost-analysis-summary.component.scss'],
  providers: [DcCostAnalysisSummaryService]
})
export class DcCostAnalysisSummaryComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  selectedMonth: number = 0;
  months: { value: number; nameAndYear: string; iso8601Date: string }[] = [];

  widgetViewData: WidgetSummaryInfoViewData = new WidgetSummaryInfoViewData();
  dcCostViewData: CostSummaryInfoViewData[];
  dcChartViewData: DCCostAnalysisChartViewdata = new DCCostAnalysisChartViewdata();

  dcSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: "id",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };

  constructor(private router: Router,
    private datacenterSummaryService: DcCostAnalysisSummaryService,
    private ticketService: SharedCreateTicketService,
    private route: ActivatedRoute, private spinnerService: AppSpinnerService) { }

  ngOnInit(): void {
    this.generateMonthOptions();
    this.getInfo();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  generateMonthOptions() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    for (let i = 1; i <= 12; i++) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const yearOffset = monthIndex > currentMonth ? 1 : 0;
      const year = currentYear - yearOffset;
      const monthName = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(year, monthIndex, 1));
      const iso8601Date = `${year}-${(monthIndex + 1).toString().padStart(2, '0')}-01T18:30:00.000Z`;
      this.months.push({ value: (i - 1), nameAndYear: `${monthName} ${year}`, iso8601Date: iso8601Date });
    }
  }

  getInfo() {
    this.getWidgetSummaryInfo();
    this.getDatacenterSummaryInfo();
  }

  getWidgetSummaryInfo() {
    this.datacenterSummaryService.getWidgetSummary(this.months[this.selectedMonth].iso8601Date).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data) => {
      this.widgetViewData = this.datacenterSummaryService.convertToWidgetViewData(data);
      this.spinnerService.stop('main');
    }, er => {
      this.spinnerService.stop('main');
    });
  }

  getDatacenterSummaryInfo() {
    this.datacenterSummaryService.getDatacenterSummary(this.months[this.selectedMonth].iso8601Date).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data) => {
      this.dcCostViewData = this.datacenterSummaryService.convertToDCCostViewData(data.results);
      this.getDCChartData(this.dcCostViewData);
      this.spinnerService.stop('main');
    }, er => {
      this.spinnerService.stop('main');
    });
  }

  manageOpenWidget(index: number) {
    if (!this.dcCostViewData[index].isOpen) {
      this.dcCostViewData.forEach(d => {
        d.isOpen = false;
      })
    }
    this.dcCostViewData[index].isOpen = !this.dcCostViewData[index].isOpen;
  }

  getDCChartData(datacenters: CostSummaryInfoViewData[]) {
    if (!datacenters.length) {
      return;
    }
    this.datacenterSummaryService.getDCChartData(datacenters).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data) => {
      this.dcChartViewData = this.datacenterSummaryService.convertToDCChartViewData(datacenters, data);
      this.spinnerService.stop('main');
    }, er => {
      this.spinnerService.stop('main');
    });
  }

  onDCChange() {
    let selectedDatacenters = this.dcChartViewData.form.getRawValue();
    let dcs: CostSummaryInfoViewData[] = [];
    selectedDatacenters.datacenters.forEach(sdId => {
      let dc = this.dcCostViewData.find(dc => dc.id == sdId)
      if (dc) {
        dcs.push(dc);
      }
    })
    this.getDCChartData(dcs);
  }

  createTicket(data: BillDetailsItemViewData, dcData: CostSummaryInfoViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(data.deviceType, data.deviceObject.name), metadata: DATACENTER_COST_SUMMARY_TICKET_METADATA(dcData.name, dcData.location, data.deviceType, data.deviceObject.name)
    });
  }

  createDCTicket(dcData: CostSummaryInfoViewData) {
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(dcData.name, dcData.location), metadata: DATACENTER_SUMMARY_TICKET_METADATA(dcData.name, dcData.location)
    });
  }

  goToCostPlanner() {
    this.router.navigate(['datacenter/cost-planners'], { relativeTo: this.route.parent });
  }
}
