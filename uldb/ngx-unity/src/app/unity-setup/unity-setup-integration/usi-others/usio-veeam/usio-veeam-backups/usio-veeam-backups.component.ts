import { Component, OnDestroy, OnInit } from '@angular/core';
import { statusList, UsioVeeamBackupsService, VeeamAccountBackupViewData } from './usio-veeam-backups.service';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { takeUntil } from 'rxjs/operators';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';

@Component({
  selector: 'usio-veeam-backups',
  templateUrl: './usio-veeam-backups.component.html',
  styleUrls: ['./usio-veeam-backups.component.scss'],
  providers: [UsioVeeamBackupsService]
})
export class UsioVeeamBackupsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;

  veeamId: string;

  statusList = statusList;

  count: number = 0;
  viewData: VeeamAccountBackupViewData[] = [];

  selectedView: VeeamAccountBackupViewData;

  StatusSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "label",
    keyToSelect: "value",
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: false,
    showUncheckAll: false,
    appendToBody: true
  };

  statusTypeTexts: IMultiSelectTexts = {
    defaultTitle: 'Status',
  };

  constructor(private svc: UsioVeeamBackupsService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.veeamId = params.get('veeamId');
    })
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'veeam_uuid': this.veeamId }], multiValueParam: { 'backup_job_status': [] } };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getBackups();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getBackups();
  }

  onFilterChange() {
    this.spinner.start('main');
    this.currentCriteria.pageNo = 1;
    this.getBackups();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo != pageNo) {
      this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getBackups();
    }
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getBackups();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getBackups();
  }

  getBackups() {
    this.svc.getBackups(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.svc.convertToViewData(res.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Backups. Please try again.'));
    });
  }

  goToBackupVMs(view: VeeamAccountBackupViewData) {
    this.selectedView = view;
    this.router.navigate([this.selectedView.backupId, 'backup-vms'], { relativeTo: this.route });
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

}
