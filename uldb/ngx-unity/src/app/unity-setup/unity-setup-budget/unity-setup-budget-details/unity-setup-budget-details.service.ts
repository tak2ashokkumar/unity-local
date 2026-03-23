import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { ChartConfigService, UnityChartData } from 'src/app/shared/chart-config.service';
import { BudgetDetailsType } from './unity-setup-budget-details.type';

@Injectable()
export class UnitySetupBudgetDetailsService {

  constructor(private http: HttpClient,
    private chartConfigService: ChartConfigService,
    private utilSvc: AppUtilityService) { }

  getBudgetDetail(budgetId: string) {
    return this.http.get<BudgetDetailsType>(`/customer/budget/${budgetId}/`);
  }

  convertToViewData(data: BudgetDetailsType): BudgetDetailsViewData {
    let td: BudgetDetailsViewData = new BudgetDetailsViewData();
    td.uuid = data.uuid;
    td.name = data.name;
    td.scope = data.scope;
    td.cloudAccount = data.cloud_account;
    td.cloud = data.cloud_type;
    td.cloudIsCustom = data.cloud_type === 'Custom' ? true : false;
    td.cloudImg = this.utilSvc.getCloudLogo(data.cloud_type);
    td.cloudName = data.cloud_account?.name ? data.cloud_account.name : 'N/A';
    td.period = data.period;
    td.periodSelectionStart = data.period_selection_start ? this.utilSvc.toUnityOneDateFormat(data.period_selection_start, 'DD MMM YYYY') : 'N/A';
    td.periodSelectionEnd = data.period_selection_end ? this.utilSvc.toUnityOneDateFormat(data.period_selection_end, 'DD MMM YYYY') : 'N/A';
    td.createdBy = {
      firstName: data.created_by.first_name,
      lastName: data.created_by.last_name,
      fullName: `${data.created_by.first_name} ${data.created_by.last_name}`
    };
    td.createdAt = data.created_at ? this.utilSvc.toUnityOneDateFormat(data.created_at, 'DD MMM YYYY') : 'N/A';
    td.updatedBy = {
      firstName: data.updated_by.first_name,
      lastName: data.updated_by.last_name,
      fullName: `${data.updated_by.first_name} ${data.updated_by.last_name}`
    };
    td.updatedAt = data.updated_at ? this.utilSvc.toUnityOneDateFormat(data.updated_at, 'DD MMM YYYY') : 'N/A';

    td.description = data.description

    td.customer = data.customer;
    td.invoice = data.invoice;

    if (data.budget_amount_detail) {
      td.budgetAmountDetail = data.budget_amount_detail.map(item => {
        let detailItem = new BudgetAmountDetailItem();
        detailItem.amount = parseFloat(item.amount);
        detailItem.difference = item.difference == 'NA' ? 'NA' : parseFloat(item.difference);
        detailItem.name = item.name;
        detailItem.spent = parseFloat(item.spent);
        detailItem.class = detailItem.spent === 0 ? 'tr-grey' : detailItem.amount > detailItem.spent ? 'tr-green' : 'tr-red';
        return detailItem;
      });
    } else {
      td.budgetAmountDetail = [];
    }

    return td;
  }

  convertToBudgetAmountDetailChartData(res: BudgetDetailsType): UnityChartData {
    let view: UnityChartData = new UnityChartData();
    view.type = 'bar';
    view.legend = true;
    let dataAmount: number[] = [];
    let dataSpent: number[] = [];
    let labels: string[] = [];

    res.budget_amount_detail.forEach(detail => {
      const amount = parseFloat(detail.amount) || 0;
      const spent = parseFloat(detail.spent) || 0;
      dataAmount.push(amount);
      dataSpent.push(spent);
      labels.push(detail.name);
    });
    view.lables = labels;
    view.datasets = [
      { data: dataAmount, label: 'Budget Amount', backgroundColor: '#9B9B9B', hoverBackgroundColor: '#7f7f7f', maxBarThickness: 20, barPercentage: 1, categoryPercentage: 0.8, order: 2 },
      { data: dataSpent, label: 'Actual Spent', backgroundColor: '#4A90E2', hoverBackgroundColor: '#2862a5', maxBarThickness: 20, barPercentage: 1, categoryPercentage: 0.8, order: 3 },
      {
        data: dataSpent, label: 'Spent', backgroundColor: '#0CBB7000', borderColor: '#0CBB70', type: 'line', lineTension: 0, order: 1,
        // pointRadius: 2, // Controls the size of the dots on the line
        // pointBackgroundColor: '#0CBB70', // Color of the dots
        // pointBorderColor: '#4A90E2', // Border color of the dots
        // pointStyle: 'circle', // Shape of the dots (circle, triangle, etc.)
      }
    ];

    view.options = this.chartConfigService.getDefaultVerticalBarChartOptions();
    view.options.layout.padding = { top: 20, right: 0, bottom: 10, left: 0 };
    view.options.plugins.datalabels.display = false;
    view.options.animation = {};
    // view.options.tooltips = { enabled : false };
    view.options.scales.xAxes[0].ticks.minRotation = 45;
    let maxAmount = Math.max(...dataAmount, ...dataSpent);
    view.options.scales.yAxes[0].ticks = {
      min: 0,
      max: Math.ceil(maxAmount / 100) * 100,
      stepSize: 100
    }
    view.options.legend.labels = {
      ...view.options.legend.labels,
      filter: (item, chart) => {
        return item.text !== 'Spent';
      }
    };

    if (dataAmount.length < 12) {
      view.datasets.forEach(d => {
        if (!d.type) {
          d.barThickness = 20;
        }
      });
    }

    return view;
  }
}
export class BudgetDetailsViewData {
  name: string;
  description: string;
  budgetAmount: BudgetAmount;
  scope: string;
  period: string;
  periodSelectionStart: string;
  periodSelectionEnd: string;
  invoice: string;
  status: boolean;
  createdBy: CreatedBy;
  updatedBy: UpdatedBy;
  customer: number;
  cloudId: number;
  cloudAccount: CloudAccount;
  uuid: string;
  cloudType: string;
  totalBudget: number;
  sameForAll: boolean;
  sameForAllAmount: string;
  updatedAt: string;
  createdAt: string;
  budgetAmountDetail: BudgetAmountDetailItem[];

  chartData: UnityChartData;
  cloudIsCustom: boolean;
  // cloudAccount:string;
  cloudImg: any;
  cloud: string;
  cloudName: string;
}

export class BudgetAmount {
  [key: string]: number;
}

export class CloudAccount {
  name: string;
  uuid: string;
}

export class BudgetAmountDetailItem {
  amount: number;
  difference: number | string;
  name: string;
  spent: number;
  class: string;
}

export class CreatedBy {
  firstName: string;
  lastName: string;
  fullName: string;
}

export class UpdatedBy {
  firstName: string;
  lastName: string;
  fullName: string;
}
