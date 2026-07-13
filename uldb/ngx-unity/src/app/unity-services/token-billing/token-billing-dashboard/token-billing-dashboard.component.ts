import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { BsDropdownDirective } from 'ngx-bootstrap/dropdown';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { TokenBillingDashboardService } from './token-billing-dashboard.service';
import {
  CreditSummaryWidgetData,
  LangfuseDashboardResponse,
  ModelCostWidgetData,
  ModelUsageWidgetData,
  TokenSummaryWidgetData,
  TokenTrendWidgetData,
  UsageByAppWidgetData,
  UserConsumptionWidgetData,
} from './token-billing-dashboard.types';

type BillingDashboardRangeValue = 'last24h' | 'last7d' | 'last30d' | 'currentMonth' | 'custom';
type GraphFilterDropdown = 'model' | 'user';

interface BillingDashboardRangeOption {
  label: string;
  value: BillingDashboardRangeValue;
}

const TIME_RANGE_OPTIONS: BillingDashboardRangeOption[] = [
  { label: 'Last 24h', value: 'last24h' },
  { label: 'Last 7d', value: 'last7d' },
  { label: 'Last 30d', value: 'last30d' },
  { label: 'Current Month', value: 'currentMonth' },
  { label: 'Custom', value: 'custom' },
];

@Component({
  selector: 'token-billing-dashboard',
  templateUrl: './token-billing-dashboard.component.html',
  styleUrls: ['./token-billing-dashboard.component.scss'],
})
export class TokenBillingDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();
  @ViewChild('modelFilterDropdown') private modelFilterDropdown?: BsDropdownDirective;
  @ViewChild('userFilterDropdown') private userFilterDropdown?: BsDropdownDirective;

  timeRangeOptions: BillingDashboardRangeOption[] = TIME_RANGE_OPTIONS;
  selectedRange: BillingDashboardRangeValue = 'last24h';
  customFromDate = '';
  customToDate = '';

  tokenSummaryData = new TokenSummaryWidgetData();
  modelCostData = new ModelCostWidgetData();
  creditSummaryData = new CreditSummaryWidgetData();
  tokenTrendData = new TokenTrendWidgetData();
  usageByAppData = new UsageByAppWidgetData();
  modelUsageData = new ModelUsageWidgetData();
  modelTokenUsageData = new UserConsumptionWidgetData();
  isDashboardLoading = true;

  private lastDashboardData: LangfuseDashboardResponse = null;

  constructor(
    private svc: TokenBillingDashboardService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private userInfo: UserInfoService,
  ) { }

  ngOnInit(): void {
    const today = this.toYmd(new Date());
    this.customFromDate = today;
    this.customToDate = today;
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.loadAll());
  }

  onTimeRangeChange(): void {
    this.closeFilterDropdowns();
    if (this.selectedRange !== 'custom') {
      const range = this.getSelectedDateRange();
      this.customFromDate = range.fromDate;
      this.customToDate = range.toDate;
      this.loadAll();
    }
  }

  onCustomDateChange(): void {
    this.closeFilterDropdowns();
    if (this.selectedRange === 'custom' && this.customFromDate && this.customToDate) {
      this.loadAll();
    }
  }

  refreshData(): void {
    this.closeFilterDropdowns();
    this.loadAll();
  }

  loadAll(): void {
    this.closeFilterDropdowns();
    const range = this.getSelectedDateRange();
    if (!range.fromDate || !range.toDate) return;

    const prevSelectedModels = this.modelUsageData.selectedModels.length ? this.modelUsageData.selectedModels : undefined;
    const prevSelectedUsers = this.modelTokenUsageData.selectedUsers.length ? this.modelTokenUsageData.selectedUsers : undefined;

    this.resetDashboardData(prevSelectedModels, prevSelectedUsers);
    this.isDashboardLoading = true;
    this.startAllSpinners();

    this.svc.getDashboardData({
      orgId: this.userInfo.userOrgId,
      userId: this.userInfo.userDetails.id,
      fromDate: range.fromDate,
      toDate: range.toDate,
    }).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        res => {
          // const effective = this.svc.injectMockIfEmpty(res); // mock fallback — re-enable to demo with mock data
          const effective = res;
          this.lastDashboardData = effective;
          this.tokenSummaryData = this.svc.buildTokenSummaryWidgetData(effective);
          this.modelCostData = this.svc.buildModelCostWidgetData(effective);
          this.creditSummaryData = this.svc.buildCreditSummaryWidgetData(effective);
          this.tokenTrendData = this.svc.buildTokenTrendWidgetData(effective);
          this.usageByAppData = this.svc.buildUsageByAppWidgetData(effective);
          this.modelUsageData = this.svc.buildModelUsageWidgetData(effective, prevSelectedModels);
          this.modelTokenUsageData = this.svc.buildUserConsumptionWidgetData(effective, prevSelectedUsers);
          this.stopAllSpinners();
        },
        (_err: HttpErrorResponse) => {
          this.stopAllSpinners();
          this.notification.error(new Notification('Failed to load Token Billing data. Please try again.'));
        },
      );
  }

  isModelSelected(model: string): boolean {
    return this.modelUsageData.selectedModels.includes(model);
  }

  toggleModel(model: string): void {
    const idx = this.modelUsageData.selectedModels.indexOf(model);
    if (idx > -1) {
      this.modelUsageData.selectedModels.splice(idx, 1);
    } else {
      this.modelUsageData.selectedModels.push(model);
    }
    if (this.lastDashboardData) {
      const selected = [...this.modelUsageData.selectedModels];
      this.modelUsageData = this.svc.buildModelUsageWidgetData(this.lastDashboardData, selected);
      this.modelUsageData.selectedModels = selected;
      this.modelFilterDropdown?.show();
    }
  }

  isUserSelected(user: string): boolean {
    return this.modelTokenUsageData.selectedUsers.includes(user);
  }

  toggleUser(user: string): void {
    const idx = this.modelTokenUsageData.selectedUsers.indexOf(user);
    if (idx > -1) {
      this.modelTokenUsageData.selectedUsers.splice(idx, 1);
    } else {
      this.modelTokenUsageData.selectedUsers.push(user);
    }
    if (this.lastDashboardData) {
      const selected = [...this.modelTokenUsageData.selectedUsers];
      this.modelTokenUsageData = this.svc.buildUserConsumptionWidgetData(this.lastDashboardData, selected);
      this.modelTokenUsageData.selectedUsers = selected;
      this.userFilterDropdown?.show();
    }
  }

  onFilterDropdownOpenChange(dropdown: GraphFilterDropdown, isOpen: boolean): void {
    if (!isOpen) return;
    const otherDropdown = dropdown === 'model' ? this.userFilterDropdown : this.modelFilterDropdown;
    otherDropdown?.hide();
  }

  closeFilterDropdowns(): void {
    this.modelFilterDropdown?.hide();
    this.userFilterDropdown?.hide();
  }

  formatCost(val: number): string { return this.svc.formatCost(val); }
  formatCredit(val: number): string { return this.svc.formatCredit(val); }
  formatRowCost(val: number): string { return this.svc.formatRowCost(val); }
  formatTokens(val: number): string { return this.svc.formatTokens(val); }

  ngOnDestroy(): void {
    this.stopAllSpinners();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private resetDashboardData(selectedModels?: string[], selectedUsers?: string[]): void {
    this.tokenSummaryData = new TokenSummaryWidgetData();
    this.modelCostData = new ModelCostWidgetData();
    this.creditSummaryData = new CreditSummaryWidgetData();
    this.tokenTrendData = new TokenTrendWidgetData();
    this.usageByAppData = new UsageByAppWidgetData();
    this.modelUsageData = new ModelUsageWidgetData();
    this.modelTokenUsageData = new UserConsumptionWidgetData();
    this.modelUsageData.selectedModels = selectedModels ? [...selectedModels] : [];
    this.modelTokenUsageData.selectedUsers = selectedUsers ? [...selectedUsers] : [];
  }

  private startAllSpinners(): void {
    this.spinner.start(this.tokenSummaryData.loader);
    this.spinner.start(this.modelCostData.loader);
    this.spinner.start(this.creditSummaryData.loader);
    this.spinner.start(this.tokenTrendData.loader);
    this.spinner.start(this.modelUsageData.loader);
    this.spinner.start(this.usageByAppData.loader);
    this.spinner.start(this.modelTokenUsageData.loader);
  }

  private stopAllSpinners(): void {
    this.spinner.stop(this.tokenSummaryData.loader);
    this.spinner.stop(this.modelCostData.loader);
    this.spinner.stop(this.creditSummaryData.loader);
    this.spinner.stop(this.tokenTrendData.loader);
    this.spinner.stop(this.modelUsageData.loader);
    this.spinner.stop(this.usageByAppData.loader);
    this.spinner.stop(this.modelTokenUsageData.loader);
    this.isDashboardLoading = false;
  }

  private getSelectedDateRange(): { fromDate: string; toDate: string } {
    const today = new Date();
    if (this.selectedRange === 'custom') {
      return { fromDate: this.customFromDate, toDate: this.customToDate };
    }
    if (this.selectedRange === 'currentMonth') {
      return {
        fromDate: this.toYmd(new Date(today.getFullYear(), today.getMonth(), 1)),
        toDate: this.toYmd(today),
      };
    }
    const daysBack = this.selectedRange === 'last7d' ? 6 : this.selectedRange === 'last30d' ? 29 : 1;
    const from = new Date(today);
    from.setDate(today.getDate() - daysBack);
    return { fromDate: this.toYmd(from), toDate: this.toYmd(today) };
  }

  private toYmd(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }
}
