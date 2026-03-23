import { Component, OnDestroy, OnInit } from '@angular/core';
import { UsioVeeamBackupVmsService, VeeamAccountBackupVMsViewData } from './usio-veeam-backup-vms.service';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'usio-veeam-backup-vms',
  templateUrl: './usio-veeam-backup-vms.component.html',
  styleUrls: ['./usio-veeam-backup-vms.component.scss'],
  providers: [UsioVeeamBackupVmsService]
})
export class UsioVeeamBackupVmsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;

  backupId: string;

  count: number;
  viewData: VeeamAccountBackupVMsViewData[] = [];

  selectedView: VeeamAccountBackupVMsViewData;
  constructor(private svc: UsioVeeamBackupVmsService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.backupId = params.get('backupId');
    })
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getBackupVMs();
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
    this.getBackupVMs();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo != pageNo) {
      this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getBackupVMs();
    }
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getBackupVMs();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getBackupVMs();
  }

  getBackupVMs() {
    this.svc.getBackupVMs(this.currentCriteria, this.backupId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.svc.convertToViewData(res.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Backup vms. Please try again.'));
    });
  }

  goToBackupVMsHistory(view: VeeamAccountBackupVMsViewData) {
    this.selectedView = view;
    this.router.navigate([this.selectedView.backupId, 'vm-backup-history'], { relativeTo: this.route });
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

}
