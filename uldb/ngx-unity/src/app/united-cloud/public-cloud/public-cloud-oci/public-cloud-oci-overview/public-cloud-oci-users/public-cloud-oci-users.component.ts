import { Component, OnInit } from '@angular/core';
import { PublicCloudOciUsersService, OCIUserViewData } from './public-cloud-oci-users.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { Subject } from 'rxjs';
import { ParamMap, ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { OCIUserType } from './oci-user.type';
import { SearchCriteria, PAGE_SIZES } from 'src/app/shared/table-functionality/search-criteria';
import { ClientSidePage } from 'src/app/shared/table-functionality/client-side-page.service';
import { ClientSideSearchPipe } from 'src/app/shared/table-functionality/client-side-search.pipe';

@Component({
  selector: 'public-cloud-oci-users',
  templateUrl: './public-cloud-oci-users.component.html',
  styleUrls: ['./public-cloud-oci-users.component.scss'],
  providers: [PublicCloudOciUsersService]
})
export class PublicCloudOciUsersComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  accountId: string;
  count: number = 0;
  viewData: OCIUserViewData[] = [];
  filteredviewData: OCIUserViewData[] = [];
  pagedviewData: OCIUserViewData[] = [];
  currentCriteria: SearchCriteria;

  fieldsToFilterOn: string[] = ['name', 'email', 'description'];
  constructor(private userSvc: PublicCloudOciUsersService,
    private route: ActivatedRoute,
    private clientSideSearchPipe: ClientSideSearchPipe,
    private clientSidePage: ClientSidePage,
    private spinnerService: AppSpinnerService) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.accountId = params.get('accountId');
    });
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit() {
    this.spinnerService.start('main');
    this.getUsers();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private filterAndPage() {
    this.filteredviewData = this.clientSideSearchPipe.transform(this.viewData, this.currentCriteria.searchValue, this.fieldsToFilterOn);
    this.pagedviewData = this.clientSidePage.page(this.filteredviewData, this.currentCriteria);
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.filterAndPage();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.pagedviewData = this.clientSidePage.page(this.filteredviewData, this.currentCriteria);
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.pagedviewData = this.clientSidePage.page(this.filteredviewData, this.currentCriteria);
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getUsers();
  }

  getUsers() {
    this.userSvc.getUsers(this.accountId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: OCIUserType[]) => {
      this.count = data.length;
      this.viewData = this.userSvc.convertToViewData(data);
      this.filterAndPage();
      this.spinnerService.stop('main');
    }, err => {
      this.spinnerService.stop('main');
    });
  }

}
