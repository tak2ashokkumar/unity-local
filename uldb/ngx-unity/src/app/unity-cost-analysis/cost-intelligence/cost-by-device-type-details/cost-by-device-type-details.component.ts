import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { CostByDeviceTypeDetailsService, CostDetailsByDeviceTypeViewData } from './cost-by-device-type-details.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';

@Component({
  selector: 'cost-by-device-type-details',
  templateUrl: './cost-by-device-type-details.component.html',
  styleUrls: ['./cost-by-device-type-details.component.scss'],
  providers: [CostByDeviceTypeDetailsService]
})
export class CostByDeviceTypeDetailsComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  deviceType: string;
  count: number;
  currentCriteria: SearchCriteria;
  detailsViewData: CostDetailsByDeviceTypeViewData[];

  constructor(private svc: CostByDeviceTypeDetailsService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,) {

    this.route.paramMap.subscribe((params: ParamMap) => {
      this.deviceType = params.get('deviceType');
    });
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'device_type': this.deviceType }] };    
  }

  ngOnInit(): void {
    this.getCostDetailsByDeviceType();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getCostDetailsByDeviceType();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getCostDetailsByDeviceType();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getCostDetailsByDeviceType();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getCostDetailsByDeviceType();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getCostDetailsByDeviceType();
  }

  getCostDetailsByDeviceType() {
    this.spinner.start('main');
    this.detailsViewData = [];
    this.svc.getCostDetailsByDeviceType(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if(res){
        this.count = res.count;
        this.detailsViewData = this.svc.convertToCostByDeviceTypeViewData(res.results);
      }
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
    })
  }


  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

}
