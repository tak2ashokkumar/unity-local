import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from '../table-functionality/search-criteria';
import { VmBackupHistoryService, VMBackupHistoryViewData } from './vm-backup-history.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppSpinnerService } from '../app-spinner/app-spinner.service';
import { AppNotificationService } from '../app-notification/app-notification.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from '../app-notification/notification.type';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'vm-backup-history',
  templateUrl: './vm-backup-history.component.html',
  styleUrls: ['./vm-backup-history.component.scss']
})
export class VmBackupHistoryComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;

  pcId: string;
  backupId: string;
  isPrivateCloudOrDevicePage: boolean = false;

  count: number;
  viewData: VMBackupHistoryViewData[] = [];

  selectedView: VMBackupHistoryViewData;
  constructor(private svc: VmBackupHistoryService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.backupId = params.get('backupId');
    });
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'backup_job_uuid': this.backupId }] };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    if (this.router.url.includes('vcenter') || this.router.url.includes('vmware')) {
      this.isPrivateCloudOrDevicePage = true;
    }
    this.getVMBackupHistory();
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
    this.getVMBackupHistory();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo != pageNo) {
      this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getVMBackupHistory();
    }
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getVMBackupHistory();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getVMBackupHistory();
  }

  getVMBackupHistory() {
    this.svc.getVMBackupHistory(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.svc.convertToViewData(res.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Backup history. Please try again.'));
    });
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

}
