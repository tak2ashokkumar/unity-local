import { Component, OnDestroy, OnInit } from '@angular/core';
import { AwsAccountResourceViewData, UsiPublicCloudAwsResourcesService } from './usi-public-cloud-aws-resources.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { Subject } from 'rxjs';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'usi-public-cloud-aws-resources',
  templateUrl: './usi-public-cloud-aws-resources.component.html',
  styleUrls: ['./usi-public-cloud-aws-resources.component.scss'],
  providers: [UsiPublicCloudAwsResourcesService]
})
export class UsiPublicCloudAwsResourcesComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  instanceId: string;
  currentCriteria: SearchCriteria;

  count: number;
  viewData: AwsAccountResourceViewData[] = [];
  constructor(private svc: UsiPublicCloudAwsResourcesService,
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

  loadResourceData(view: AwsAccountResourceViewData) {
    this.router.navigate(['aws', 'instances', this.instanceId, 'resources', view.uuid], { relativeTo: this.route.parent });
  }

  goBack() {
    this.router.navigate(['aws/instances'], { relativeTo: this.route.parent });
  }

}
