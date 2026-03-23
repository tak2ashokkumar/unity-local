import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { credentialsTypesList, UnitySetupCredentialsService, UnitySetupCredentialsViewData } from './unity-setup-credentials.service';
import { HttpErrorResponse } from '@angular/common/http';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { LabelValueType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';

@Component({
  selector: 'unity-setup-credentials',
  templateUrl: './unity-setup-credentials.component.html',
  styleUrls: ['./unity-setup-credentials.component.scss'],
  providers: [UnitySetupCredentialsService]
})
export class UnitySetupCredentialsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;

  typeSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "label",
    keyToSelect: "value",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true
  };

  typeTexts: IMultiSelectTexts = {
    defaultTitle: 'Select Type',
  };

  credentialsTypesList: LabelValueType[] = credentialsTypesList;

  count: number = 0;
  viewData: UnitySetupCredentialsViewData[] = [];
  selectedView: UnitySetupCredentialsViewData;
  devicesList: string[] = [];

  @ViewChild('confirmDeleteRef') confirmDeleteRef: ElementRef;
  confirmDeleteModalRef: BsModalRef;
  constructor(private svc: UnitySetupCredentialsService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private modalSvc: BsModalService,) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{}], multiValueParam: { type: [] } };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getCredentials();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getCredentials();
  }

  OnFilterChange() {
    this.spinner.start('main');
    this.currentCriteria.pageNo = 1;
    this.getCredentials();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo === pageNo) {
      return;
    }
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getCredentials();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getCredentials();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{}], multiValueParam: { type: [] } };
    this.getCredentials();
  }

  getCredentials() {
    this.svc.getCredentials(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.svc.convertToViewData(res.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification(err.error.error));
    });
  }

  addCredential() {
    this.router.navigate(['add'], { relativeTo: this.route });
  }

  editCredential(view: UnitySetupCredentialsViewData) {
    this.router.navigate([view.id, 'edit'], { relativeTo: this.route });
  }

  deleteCredential(view: UnitySetupCredentialsViewData) {
    this.selectedView = view;
    this.confirmDeleteModalRef = this.modalSvc.show(this.confirmDeleteRef, Object.assign({}, { class: '', backdrop: true, keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.spinner.start('main');
    this.confirmDeleteModalRef.hide();
    this.svc.deleteCredential(this.selectedView.id).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getCredentials();
      this.spinner.stop('main');
      this.notification.success(new Notification('Credentials Deleted sucessfully'));
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while deleting. Please try again!!'));
    });
  }

  showDevices(view: UnitySetupCredentialsViewData) {
    this.devicesList = view.devicesList;
  }

}
