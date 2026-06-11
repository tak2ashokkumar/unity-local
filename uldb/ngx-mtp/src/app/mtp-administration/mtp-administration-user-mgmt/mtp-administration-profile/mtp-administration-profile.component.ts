import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { MtpAdministrationProfileViewData, UserAdministrationProfileService, UserProfileActivityLogViewData, basicDetailsFormData } from './mtp-administration-profile.service';

@Component({
  selector: 'mtp-administration-profile',
  templateUrl: './mtp-administration-profile.component.html',
  styleUrls: ['./mtp-administration-profile.component.scss'],
  providers: [UserAdministrationProfileService]
})
export class MtpAdministrationProfileComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  isCollapsed = false;

  view: MtpAdministrationProfileViewData = new MtpAdministrationProfileViewData();
  basicDetailsForm: FormGroup;
  basicDetailsFormErrors: any;
  basicDetailsFormValidationMessages: any

  actions: string[];
  users: string[];
  currentCriteria: SearchCriteria;
  count: number;
  log: UserProfileActivityLogViewData;
  viewDataActivity: UserProfileActivityLogViewData[] = [];
  @ViewChild('loginfo') loginfo: ElementRef;
  modalRef: BsModalRef;

  actionSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    selectAsObject: true
  };

  // Text configuration
  myTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'item selected',
    checkedPlural: 'items selected',
    searchPlaceholder: 'Find',
    defaultTitle: 'Select',
    allSelected: 'All selected',
  };

  constructor(private spinnerService: AppSpinnerService,
    private userAdministrationProfileService: UserAdministrationProfileService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private notificationService: AppNotificationService,
    private router: Router,
    private route: ActivatedRoute) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit() {
    this.spinnerService.start('main');
    this.getUserProfileData();
    this.getActivityLogData();
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.getActivityLogData();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getActivityLogData();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getActivityLogData();
  }

  pageChange(pageNo: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getActivityLogData();
  }

  pageSizeChange(pageSize: number) {
    this.spinnerService.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getActivityLogData();
  }

  getUserProfileData() {
    this.userAdministrationProfileService.getUserProfileData().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      if (res && res.results.length) {
        this.view = this.userAdministrationProfileService.convertUserProfileToViewData(res.results.getFirst());
        this.buildBasicDetailsForm();
      } else {
        this.view = null;
      }
      this.spinnerService.stop('main');
    }, err => {
      this.view = null;
      this.spinnerService.stop('main');
    });
  }

  buildBasicDetailsForm() {
    this.basicDetailsForm = this.userAdministrationProfileService.buildBasicDetailsForm(this.view);
    this.basicDetailsFormErrors = this.userAdministrationProfileService.resetBasicDetailsFormErrors();
    this.basicDetailsFormValidationMessages = this.userAdministrationProfileService.basicDetailsValidationMessages;
  }

  updateBasicDetails() {
    if (this.basicDetailsForm.invalid) {
      this.basicDetailsFormErrors = this.utilService.validateForm(this.basicDetailsForm, this.basicDetailsFormValidationMessages, this.basicDetailsFormErrors);
      this.basicDetailsForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.basicDetailsFormErrors = this.utilService.validateForm(this.basicDetailsForm, this.basicDetailsFormValidationMessages, this.basicDetailsFormErrors); });
    } else {
      let obj = <basicDetailsFormData>Object.assign({}, this.basicDetailsForm.getRawValue());
      this.userAdministrationProfileService.updateBasicDetails(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.spinnerService.stop('main');
        this.getUserProfileData();
        this.notificationService.success(new Notification('Details updated successfully.'));
      }, err => {
        this.spinnerService.stop('main');
        this.notificationService.error(new Notification('Faced some problem updating Details.'));
      });;
    }
  }

  resetPassword() {
    this.userAdministrationProfileService.resetPassword().pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.spinnerService.stop('main');
      this.notificationService.success(new Notification('Reset Link sent on registered email id successfully.'));
    }, err => {
      this.spinnerService.stop('main');
      this.notificationService.error(new Notification("Couldn't send reset link."));
    });
  }

  getActivityLogData() {
    this.userAdministrationProfileService.getActivityLogData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data) => {
      this.count = data.count;
      this.viewDataActivity = this.userAdministrationProfileService.convertActivityLogToViewData(data.results);
      // this.actions=this.viewDataActivity.map((log) => log.action);
      // console.log(this.actions);
      // this.users=this.viewDataActivity.map((log) => log.actor_email);
      // console.log(this.users);
      this.spinnerService.stop('main');
    }, err => {
      this.spinnerService.stop('main');
    });
  }

  showInfo(view: UserProfileActivityLogViewData) {
    this.log = view;
    this.modalRef = this.modalService.show(this.loginfo, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}
