import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { GcpAccountResourceViewData, UsiPublicCloudGcpResourcesService } from './usi-public-cloud-gcp-resources.service';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';

@Component({
  selector: 'usi-public-cloud-gcp-resources',
  templateUrl: './usi-public-cloud-gcp-resources.component.html',
  styleUrls: ['./usi-public-cloud-gcp-resources.component.scss'],
  providers: [UsiPublicCloudGcpResourcesService]
})
export class UsiPublicCloudGcpResourcesComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  instanceId: string;
  currentCriteria: SearchCriteria;

  count: number;
  viewData: GcpAccountResourceViewData[] = [];
  constructor(private svc: UsiPublicCloudGcpResourcesService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.instanceId = params.get('instanceId');
    });
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit() {
    this.spinner.start('main');
    this.getResources();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getResources();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getResources();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getResources();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getResources();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getResources();
  }

  getResources() {
    this.svc.getResources(this.instanceId, this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.svc.convertToViewData(res.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.viewData = [];
      this.spinner.stop('main');
    })
  }

  loadResourceData(view: GcpAccountResourceViewData) {
    this.router.navigate(['gcp', 'instances', this.instanceId, 'resources', view.uuid], { relativeTo: this.route.parent });
  }

  goBack() {
    this.router.navigate(['gcp/instances'], { relativeTo: this.route.parent });
  }

}
