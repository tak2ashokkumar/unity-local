import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
// import { AzureAccountResourceViewData, UsiPublicCloudAzureResourcesService } from './usi-public-cloud-azure-resources.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { PrivateCloudsViewData, UsiPrivateCloudsResourcesService } from './usi-private-clouds-resources.service';

@Component({
  selector: 'usi-private-clouds-resources',
  templateUrl: './usi-private-clouds-resources.component.html',
  styleUrls: ['./usi-private-clouds-resources.component.scss']
})
export class UsiPrivateCloudsResourcesComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  instanceId: string;
  currentCriteria: SearchCriteria;
  count: number;
  viewData: PrivateCloudsViewData[] = [];
  cloudNameForEndpoint: string;
  cloudNameForDisplay: string;

  constructor(private svc: UsiPrivateCloudsResourcesService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.instanceId = params.get('instanceId');
    });
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getCloudName();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getCloudName();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getCloudName();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getCloudName();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getCloudName();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getCloudName();
  }

  getCloudName() {
    let currentUrl = this.router.url;
    if (currentUrl.includes('vmware-vcenter')) {
      this.cloudNameForEndpoint = 'vcenter';
      this.cloudNameForDisplay = 'VMware Vcenter';
    } else if (currentUrl.includes('unity-vcenter')) {
      this.cloudNameForEndpoint = 'unity-vcenter';
      this.cloudNameForDisplay = 'United Private Cloud Vcenter';
    }
    this.getResources();
  }

  getResources() {
    this.svc.getResources(this.instanceId, this.currentCriteria, this.cloudNameForEndpoint).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.svc.convertToViewData(res.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.viewData = [];
      this.spinner.stop('main');
    })
  }

  // loadResourceData(view: PrivateCloudsViewData) {
  //   this.router.navigate([view.uuid], { relativeTo: this.route });
  // }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}
