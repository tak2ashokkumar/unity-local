import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { CyberarcViewData, UsiVaultsCyberarcService } from './usi-vaults-cyberarc.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';

@Component({
  selector: 'usi-vaults-cyberarc',
  templateUrl: './usi-vaults-cyberarc.component.html',
  styleUrls: ['./usi-vaults-cyberarc.component.scss'],
  providers: [UsiVaultsCyberarcService]
})
export class UsiVaultsCyberarcComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;

  viewData: CyberarcViewData[] = [];
  selectedView: CyberarcViewData;
  @ViewChild('deleteConfirm') deleteConfirm: ElementRef;
  deleteModalRef: BsModalRef;
  count: number = 0;

  constructor(private svc: UsiVaultsCyberarcService,
    private spinner: AppSpinnerService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private notification: AppNotificationService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };

  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getCyberarcVaults();

  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.getCyberarcVaults();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getCyberarcVaults();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getCyberarcVaults();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getCyberarcVaults();
  }


  getCyberarcVaults() {
    this.svc.getCyberarcVaults(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.svc.convertToViewData(res.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
    });
  }

  goToCreate() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  goToEdit(view: CyberarcViewData) {
    this.router.navigate([view.vaultId, 'edit'], { relativeTo: this.route });
  }

  delete(view: CyberarcViewData) {
    this.selectedView = view;
    this.deleteModalRef = this.modalService.show(this.deleteConfirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.deleteModalRef.hide();
    this.spinner.start('main');
    this.svc.deleteVault(this.selectedView.vaultId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.notification.success(new Notification('Cyberarc Vault deleted successfully.'));
      this.getCyberarcVaults();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to delete Cyberarc Vault!! Please try again.'));
    });
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

}
