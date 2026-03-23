import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject, throwError } from 'rxjs';
import { catchError, switchMap, take, takeUntil } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { ClientSidePage } from 'src/app/shared/table-functionality/client-side-page.service';
import { ClientSideSearchPipe } from 'src/app/shared/table-functionality/client-side-search.pipe';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { VcenterContentLibraryService, VcenterContentLibraryViewdata } from './vcenter-content-library.service';

@Component({
  selector: 'vcenter-content-library',
  templateUrl: './vcenter-content-library.component.html',
  styleUrls: ['./vcenter-content-library.component.scss'],
  providers: [VcenterContentLibraryService]
})
export class VcenterContentLibraryComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  pcId: string;
  currentCriteria: SearchCriteria;
  viewData: VcenterContentLibraryViewdata[] = [];
  filteredViewData: VcenterContentLibraryViewdata[] = [];
  pagedviewData: VcenterContentLibraryViewdata[] = [];
  fieldsToFilterOn: string[] = ['name'];

  constructor(private route: ActivatedRoute,
    private router: Router,
    private clientSideSearchPipe: ClientSideSearchPipe,
    private clientSidePage: ClientSidePage,
    private notification: AppNotificationService,
    private appService: AppLevelService,
    private libSvc: VcenterContentLibraryService,
    private spinner: AppSpinnerService) {
    this.route.parent.parent.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
      this.pcId = params.get('pcId');
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getLibraries();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private filterAndPage() {
    this.filteredViewData = this.clientSideSearchPipe.transform(this.viewData, this.currentCriteria.searchValue, this.fieldsToFilterOn);
    this.pagedviewData = this.clientSidePage.page(this.filteredViewData, this.currentCriteria);
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.filterAndPage();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.pagedviewData = this.clientSidePage.page(this.filteredViewData, this.currentCriteria);
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.pagedviewData = this.clientSidePage.page(this.filteredViewData, this.currentCriteria);
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getLibraries();
  }

  getLibraries() {
    this.libSvc.getLibraries(this.pcId).pipe(catchError((e: HttpErrorResponse) => {
      return throwError(e);
    }), switchMap(res => {
      return this.appService.pollForTask(res.task_id, 3, 300).pipe(take(1));
    }), take(1), takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.viewData = this.libSvc.convertToViewdata(res.result.data);
      this.filterAndPage();
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification(err.error.detail));
      // this.notification.error(new Notification('Error while fetching libraries. Please try again!!'));
    });
  }

  goToFiles(view: VcenterContentLibraryViewdata) {
    this.router.navigate([view.libId, 'files'], { relativeTo: this.route });
  }

  goToSummary() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
