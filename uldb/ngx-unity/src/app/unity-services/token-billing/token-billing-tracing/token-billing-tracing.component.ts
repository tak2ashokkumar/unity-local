import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { TokenBillingTracingService } from './token-billing-tracing.service';
import { RequestBreakdown } from '../token-billing-dashboard/token-billing-dashboard.types';

const LOADER = 'tbTracingLoader';
const PAGE_SIZE = 10;
const STANDARD_PAGE_SIZES = [10, 25, 50, 100];
const POLL_INTERVAL_MS = 30000;

type SortDirection = '' | 'asc' | 'desc';
type SortColumn = 'query_name' | 'input_tokens' | 'output_tokens' | 'total_tokens' | 'total_cost_usd';
type BillingTraceRangeValue = 'last24h' | 'last7d' | 'last30d' | 'currentMonth' | 'custom';

interface BillingTraceRangeOption {
  label: string;
  value: BillingTraceRangeValue;
}

const TIME_RANGE_OPTIONS: BillingTraceRangeOption[] = [
  { label: 'Last 24h', value: 'last24h' },
  { label: 'Last 7d', value: 'last7d' },
  { label: 'Last 30d', value: 'last30d' },
  { label: 'Current Month', value: 'currentMonth' },
  { label: 'Custom', value: 'custom' },
];

@Component({
  selector: 'token-billing-tracing',
  templateUrl: './token-billing-tracing.component.html',
  styleUrls: ['./token-billing-tracing.component.scss'],
})
export class TokenBillingTracingComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();

  @ViewChild('traceDetails') traceDetails: TemplateRef<any>;

  loader = LOADER;
  pageSize = PAGE_SIZE;
  timeRangeOptions: BillingTraceRangeOption[] = TIME_RANGE_OPTIONS;
  selectedRange: BillingTraceRangeValue = 'last24h';
  customFromDate = '';
  customToDate = '';
  rows: RequestBreakdown[] = [];
  filteredRows: RequestBreakdown[] = [];
  pagedRows: RequestBreakdown[] = [];
  searchValue = '';
  sortColumn: SortColumn = 'total_cost_usd';
  sortDirection: SortDirection = 'desc';
  currentPage = 1;
  errorMessage = '';
  selectedRow: RequestBreakdown = null;
  modalRef: BsModalRef;

  get pageSizeOptions(): number[] {
    const total = this.filteredRows.length;
    if (!total) return [PAGE_SIZE];

    const firstSizeAtOrAboveTotal = STANDARD_PAGE_SIZES.find(size => size >= total);
    return firstSizeAtOrAboveTotal
      ? STANDARD_PAGE_SIZES.filter(size => size <= firstSizeAtOrAboveTotal)
      : STANDARD_PAGE_SIZES;
  }

  constructor(
    private svc: TokenBillingTracingService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private userInfo: UserInfoService,
    private modalService: BsModalService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    const today = this.toYmd(new Date());
    this.customFromDate = today;
    this.customToDate = today;
    this.loadData();
    interval(POLL_INTERVAL_MS)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(() => this.loadData(true));
  }

  onTimeRangeChange(): void {
    this.currentPage = 1;
    if (this.selectedRange !== 'custom') {
      const range = this.getSelectedDateRange();
      this.customFromDate = range.fromDate;
      this.customToDate = range.toDate;
      this.loadData();
    } else {
      this.applyFilters();
    }
  }

  onCustomDateChange(): void {
    if (this.selectedRange === 'custom' && this.customFromDate && this.customToDate) {
      this.currentPage = 1;
      this.loadData();
    }
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  refreshData(): void {
    this.loadData();
  }

  goBack(): void {
    this.router.navigate(['/services/token-billing/dashboard']);
  }

  loadData(silent = false): void {
    const range = this.getSelectedDateRange();
    if (!range.fromDate || !range.toDate) return;

    if (!silent) {
      this.errorMessage = '';
      this.spinner.start(this.loader);
    }
    this.svc.getTracingData({
      orgId: this.userInfo.userOrgId,
      userId: this.userInfo.userDetails.id,
      fromDate: range.fromDate,
      toDate: range.toDate,
    }).pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        res => {
          this.errorMessage = '';
          this.rows = res || [];
          this.applyFilters();
          if (!silent) this.spinner.stop(this.loader);
        },
        (_err: HttpErrorResponse) => {
          if (!silent) this.spinner.stop(this.loader);
          this.errorMessage = 'Failed to load tracing data. Please try again.';
          if (!silent) {
            this.notification.error(new Notification('Failed to load tracing data. Please try again.'));
          }
        },
      );
  }

  sortBy(column: SortColumn): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  pageChange(pageNo: number): void {
    this.currentPage = pageNo;
    this.setPagedRows();
  }

  pageSizeChange(pageSize: number): void {
    this.pageSize = Number(pageSize) || PAGE_SIZE;
    this.currentPage = 1;
    this.setPagedRows();
  }

  showDetails(row: RequestBreakdown): void {
    this.selectedRow = row;
    this.modalRef = this.modalService.show(this.traceDetails, Object.assign({}, { class: 'modal-lg', keyboard: true }));
  }

  isMaxCostRow(row: RequestBreakdown): boolean {
    if (!this.filteredRows.length) return false;
    const maxCost = Math.max(...this.filteredRows.map(r => Number(r.total_cost_usd) || 0));
    return (Number(row.total_cost_usd) || 0) === maxCost && maxCost > 0;
  }

  formatCost(val: number | null | undefined): string { return this.svc.formatCost(val); }

  private applyFilters(): void {
    const term = (this.searchValue || '').toLowerCase().trim();
    this.filteredRows = this.rows.filter(row => !term || (row.query_name || '').toLowerCase().includes(term));
    this.sortRows();
    this.normalizePageSize();
    if (this.currentPage > this.totalPages()) this.currentPage = this.totalPages();
    this.setPagedRows();
  }

  private sortRows(): void {
    if (!this.sortColumn || !this.sortDirection) return;
    const direction = this.sortDirection === 'asc' ? 1 : -1;
    this.filteredRows = [...this.filteredRows].sort((a, b) => {
      const aVal = a[this.sortColumn];
      const bVal = b[this.sortColumn];
      if (this.sortColumn === 'query_name') {
        return String(aVal || '').localeCompare(String(bVal || '')) * direction;
      }
      return ((Number(aVal) || 0) - (Number(bVal) || 0)) * direction;
    });
  }

  private setPagedRows(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.pagedRows = this.filteredRows.slice(start, start + this.pageSize);
  }

  private normalizePageSize(): void {
    const options = this.pageSizeOptions;
    if (!options.includes(this.pageSize)) {
      this.pageSize = options[options.length - 1] || PAGE_SIZE;
    }
  }

  private totalPages(): number {
    return Math.max(Math.ceil(this.filteredRows.length / this.pageSize), 1);
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

  ngOnDestroy(): void {
    this.modalRef?.hide();
    this.spinner.stop(this.loader);
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
