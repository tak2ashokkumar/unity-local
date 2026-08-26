import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Order } from './orders.type';
import { OrdersService } from './orders.service';

@Component({
  selector: 'orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit, OnDestroy {
  orders: Order[] = [];
  selectedOrder: Order | null = null;
  searchQuery = '';
  activeStatus = 'All';
  pageSize = 10;
  currentPage = 1;
  isStatusFilterOpen = false;
  isLoading = false;
  hasLoadError = false;
  readonly pageSizes = [10, 20, 50];
  private readonly destroy$ = new Subject<void>();

  constructor(
    private ordersService: OrdersService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get statusOptions(): string[] {
    return ['All', ...Array.from(new Set(this.orders.map(order => order.status)))];
  }

  get filteredOrders(): Order[] {
    const query = this.searchQuery.trim().toLowerCase();
    return this.orders.filter(order => {
      const matchesStatus = this.activeStatus === 'All' || order.status === this.activeStatus;
      const searchable = [
        order.order_number,
        order.requested_by,
        this.orderRitm(order),
        this.orderRequest(order),
        order.priority,
        order.catalog_name
      ].join(' ').toLowerCase();
      return matchesStatus && (!query || searchable.includes(query));
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredOrders.length / this.pageSize));
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index + 1);
  }

  get pagedOrders(): Order[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredOrders.slice(start, start + this.pageSize);
  }

  get firstVisibleEntry(): number {
    return this.filteredOrders.length ? (this.currentPage - 1) * this.pageSize + 1 : 0;
  }

  get lastVisibleEntry(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredOrders.length);
  }

  loadOrders(resetFilters = false): void {
    if (resetFilters) {
      this.searchQuery = '';
      this.activeStatus = 'All';
      this.currentPage = 1;
    }

    this.isLoading = true;
    this.hasLoadError = false;
    // this.ordersService.getOrders()
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe(
    //     response => {
    //       this.orders = response.results || [];
    //       this.orders = this.orders.map((o: any) => {
    //         const cost_breakup = (o?.cost_breakup || []).map((c: any) => ({
    //           ...c,
    //           // only override the fields you need to change, e.g.:
    //           unit: this.formatUnit(c),
    //           usage: this.formatUsage(c, o),
    //           rate: c?.price,
    //           amount: this.getAmount(c, o)
    //         }));
    //         const total_amount = cost_breakup.reduce(
    //           (sum: number, c: any) => sum + (Number(c.amount) || 0),
    //           0
    //         );
    //         return {
    //           ...o,
    //           total_amount: total_amount,
    //           cost_breakup
    //         };
    //       });
    //       this.isLoading = false;
    //       this.keepPageInRange();
    //     },
    //     () => {
    //       this.orders = [];
    //       this.isLoading = false;
    //       this.hasLoadError = true;
    //     }
    //   );

    this.ordersService.getOrders().pipe(takeUntil(this.destroy$)).subscribe(
      response => {
        this.orders = response.results || [];
        this.isLoading = false;
        this.keepPageInRange();
      },
      () => {
        this.orders = [];
        this.isLoading = false;
        this.hasLoadError = true;
      }
    );
  }

  // formatUsage(cost, order) {
  //   if (cost?.source === 'Config') {
  //     return `${order?.configuration[`${cost?.config_key}`]}x${this.getUnit(cost?.rate_frequency)}`;
  //   }
  //   if (cost?.source === 'Fixed') {
  //     return '-';
  //   }
  //   if (cost?.source === 'Static') {
  //     return `${cost?.count}x${this.getUnit(cost?.rate_frequency)}`;
  //   }
  // }

  // getAmount(cost, order) {
  //   if (cost?.source === 'Config') {
  //     return order?.configuration[`${cost?.config_key}`] * cost?.price;
  //   }
  //   if (cost?.source === 'Fixed') {
  //     return cost?.price;
  //   }
  //   if (cost?.source === 'Static') {
  //     return cost?.count * cost?.price;
  //   }
  // }

  // formatUnit(cost) {
  //   return `${cost?.label}/${this.getUnit(cost?.rate_frequency)}`;
  // }

  // getUnit(f) {
  //   if (f === 'Monthly') {
  //     return 'mo';
  //   }
  //   if (f === 'Hourly') {
  //     return 'hr';
  //   }
  //   if (f === 'Daily') {
  //     return 'd';
  //   }
  // }

  onSearchChange(): void {
    this.currentPage = 1;
  }

  onPageSizeChange(): void {
    this.currentPage = 1;
  }

  selectStatus(status: string): void {
    this.activeStatus = status;
    this.currentPage = 1;
    this.isStatusFilterOpen = false;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  openPricingDetails(order: Order): void {
    this.selectedOrder = order;
    document.body.classList.add('printing-invoice');
  }

  closePricingDetails(): void {
    this.selectedOrder = null;
    document.body.classList.remove('printing-invoice');
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closePricingDetails();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.selectedOrder) {
      this.closePricingDetails();
    }
  }

  orderRitm(order: Order): string {
    return order.approval_meta?.ritm || 'NA';
  }

  orderRequest(order: Order): string {
    return order.approval_meta?.request || 'NA';
  }

  taxPercentage(order: Order): number {
    const price = Number(order.price || 0);
    const tax = Number(order.tax_amount || 0);
    return price ? (tax / price) * 100 : 0;
  }

  statusClass(status: string): string {
    return `status-${(status || '').toLowerCase().replace(/\s+/g, '-')}`;
  }

  priorityClass(priority: string): string {
    return (priority || '').toLowerCase();
  }

  printPricingDetails(): void {
    const originalTitle = document.title;
    document.title = this.selectedOrder ? this.selectedOrder.order_number : originalTitle;
    window.print();
    // restore after print dialog closes (setTimeout since print() is blocking in most browsers but not all)
    setTimeout(() => {
      document.title = originalTitle;
    }, 500);
  }

  downloadPricingCsv(order: Order): void {
    // const rows: string[][] = [['Component', 'Unit', 'Usage', 'Rate', 'Amount']];
    // order.cost_breakup.forEach(component => rows.push([
    //   component.label,
    //   component.unit,
    //   component.subtitle,
    //   String(component.rate),
    //   String(component.price)
    // ]));
    // rows.push(['Total', '', '', '', order.total_amount]);

    const rows: string[][] = [['Component', 'Unit', 'Usage', 'Rate', 'Amount']];
    order.cost_breakdown.forEach(component => rows.push([
      component.label,
      component.unit,
      component.usage,
      String(component.rate),
      String(component.amount)
    ]));
    rows.push(['Total', '', '', '', order.total_amount]);

    const csv = rows
      .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${order.order_number}-pricing.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private keepPageInRange(): void {
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

}
