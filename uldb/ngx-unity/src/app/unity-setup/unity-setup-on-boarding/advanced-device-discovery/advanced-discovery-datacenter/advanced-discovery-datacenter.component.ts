import { Component, OnInit, OnDestroy } from '@angular/core';
import { AdvancedDiscoveryDatacenterService, DatacenterViewData } from './advanced-discovery-datacenter.service';
import { Subject } from 'rxjs';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { DcCrudService } from 'src/app/shared/dc-crud/dc-crud.service';
import { CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'advanced-discovery-datacenter',
  templateUrl: './advanced-discovery-datacenter.component.html',
  styleUrls: ['./advanced-discovery-datacenter.component.scss'],
  providers: [AdvancedDiscoveryDatacenterService]
})
export class AdvancedDiscoveryDatacenterComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  count: number = 0;
  viewData: DatacenterViewData[] = [];

  constructor(private dcService: AdvancedDiscoveryDatacenterService,
    private spinner: AppSpinnerService,
    private crudSvc: DcCrudService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: 0 };
  }

  ngOnInit() {
    this.spinner.start('main');
    this.getDatacenters();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getDatacenters();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getDatacenters();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getDatacenters();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.getDatacenters();
  }

  onCrud(event: CRUDActionTypes) {
    if (event == CRUDActionTypes.DELETE) {
      this.count--;
    } else {
      this.spinner.start('main');
      if (event == CRUDActionTypes.ADD) {
        this.currentCriteria.pageNo = 1;
      }
      this.getDatacenters();
    }
  }

  getDatacenters() {
    this.dcService.getDataCenters(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.length;
      this.viewData = this.dcService.convertToViewData(res);
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
    });
  }

  addDatacenter() {
    this.crudSvc.addOrEditDataCenter(null);
  }

  editDatacenter(dcId: string) {
    this.crudSvc.addOrEditDataCenter(dcId);
  }

  deleteDatacenter(dcId: string) {
    this.crudSvc.deleteDataCenter(dcId);
  }

}
