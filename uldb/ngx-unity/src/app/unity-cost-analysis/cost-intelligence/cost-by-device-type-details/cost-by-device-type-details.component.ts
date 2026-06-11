import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { CostByDeviceTypeDetailsService, CostDetailsByDeviceTypeViewData } from './cost-by-device-type-details.service';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';

@Component({
  selector: 'cost-by-device-type-details',
  templateUrl: './cost-by-device-type-details.component.html',
  styleUrls: ['./cost-by-device-type-details.component.scss'],
  providers: [CostByDeviceTypeDetailsService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CostByDeviceTypeDetailsComponent implements OnInit, OnDestroy {
  private readonly ngUnsubscribe = new Subject<void>();
  deviceType: string;
  count: number;
  currentCriteria: SearchCriteria;
  detailsViewData: CostDetailsByDeviceTypeViewData[];

  constructor(private svc: CostByDeviceTypeDetailsService,
    private router: Router,
    private route: ActivatedRoute,
    private spinnerSvc: AppSpinnerService,
    private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.deviceType = params.get('deviceType');
    });
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'device_type': this.deviceType }] };
    this.getCostDetailsByDeviceType();
  }

  ngOnDestroy(): void {
    this.spinnerSvc.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSorted($event: SearchCriteria): void {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getCostDetailsByDeviceType();
  }

  onSearched(event: string): void {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getCostDetailsByDeviceType();
  }

  pageChange(pageNo: number): void {
    this.spinnerSvc.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getCostDetailsByDeviceType();
  }

  pageSizeChange(pageSize: number): void {
    this.spinnerSvc.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getCostDetailsByDeviceType();
  }

  refreshData(pageNo: number): void {
    this.spinnerSvc.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getCostDetailsByDeviceType();
  }

  getCostDetailsByDeviceType(): void {
    this.spinnerSvc.start('main');
    this.detailsViewData = [];
    this.svc.getCostDetailsByDeviceType(this.currentCriteria)
      .pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.stopMain()))
      .subscribe(res => {
        if (res) {
          this.count = res.count;
          this.detailsViewData = this.svc.convertToCostByDeviceTypeViewData(res.results);
        }
      }, () => { });
  }

  goBack(): void {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  trackByIndex(index: number): number {
    return index;
  }

  private stopMain(): void {
    this.spinnerSvc.stop('main');
    this.cdr.markForCheck();
  }

}
