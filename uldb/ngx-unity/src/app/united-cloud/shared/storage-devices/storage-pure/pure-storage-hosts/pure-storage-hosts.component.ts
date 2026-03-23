import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { UnityChartDetails } from 'src/app/shared/unity-chart-config.service';
import { StoragePureService } from '../storage-pure.service';
import { PureStorageArrayHostViewData, PureStorageHostsService } from './pure-storage-hosts.service';

@Component({
  selector: 'pure-storage-hosts',
  templateUrl: './pure-storage-hosts.component.html',
  styleUrls: ['./pure-storage-hosts.component.scss'],
  providers: [PureStorageHostsService, StoragePureService]
})
export class PureStorageHostsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  arrayId: string;
  count: number;
  loaderName: string = 'pure-storage-hosts';
  currentCriteria: SearchCriteria;

  viewData: PureStorageArrayHostViewData[] = [];
  selectedView: PureStorageArrayHostViewData;
  selectedViewChartData: UnityChartDetails;
  constructor(private svc: PureStorageHostsService,
    private pureStorageSvc: StoragePureService,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.arrayId = params.get('arrayId');
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'array_uuid': this.arrayId }] };
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.spinner.start(this.loaderName);
      this.getHosts();
    })
  }

  ngOnDestroy(): void {
    this.spinner.stop(this.loaderName);
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getHosts();
  }

  pageChange(pageNo: number) {
    this.spinner.start(this.loaderName);
    this.currentCriteria.pageNo = pageNo;
    this.getHosts();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start(this.loaderName);
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getHosts();
  }

  refreshData() {
    this.spinner.start(this.loaderName);
    this.getHosts();
  }

  getHosts() {
    this.svc.getHosts(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.svc.convertToViewData(res.results);
      this.spinner.stop(this.loaderName);
    }, err => {
      this.viewData = [];
      this.spinner.stop(this.loaderName);
    })
  }

  goToDetails(view: PureStorageArrayHostViewData) {
    this.spinner.start(this.loaderName);
    this.selectedViewChartData = this.pureStorageSvc.getArrayComponentChartData(view.graphData);
    this.selectedView = view;
  }

  goBack() {
    this.selectedView = null;
  }

}
