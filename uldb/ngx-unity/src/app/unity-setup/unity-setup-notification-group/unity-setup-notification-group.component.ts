import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { UnitySetupNotificationGroupService, UnitySetupNotificationViewdata } from './unity-setup-notification-group.service';
import { UnitySetupUser } from 'src/app/shared/SharedEntityTypes/user.type';
import { ActivatedRoute, Router } from '@angular/router';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';

@Component({
  selector: 'unity-setup-notification-group',
  templateUrl: './unity-setup-notification-group.component.html',
  styleUrls: ['./unity-setup-notification-group.component.scss'],
  providers: [UnitySetupNotificationGroupService]
})
export class UnitySetupNotificationGroupComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  addEdit: 'Add' | 'Edit' = 'Add';
  nonFieldErr: string = '';

  @ViewChild('confirmToggle') confirmToggle: ElementRef;
  @ViewChild('confirmToggleAll') confirmToggleAll: ElementRef;
  confirmMsg: string;
  @ViewChild('confirmDelete') confirmDelete: ElementRef;
  confirmDeleteMsg: string;
  confirmModalRef: BsModalRef;

  @ViewChild('create') create: ElementRef;
  createModalRef: BsModalRef;
  createFormErrors: any;
  createValidationMessages: any;
  createForm: FormGroup;

  currentCriteria: SearchCriteria;
  count: number;
  viewData: UnitySetupNotificationViewdata[] = [];
  selectedGroup: UnitySetupNotificationViewdata;
  userList: UnitySetupUser[] = [];
  selectedUsers: UnitySetupUser[] = [];
  noUsers = false;
  selectedActionAll: string;
  enabledCount: number = 0;
  popOverList: string[] = [];

  alertTypeSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'label',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    selectAsObject: false,
    keyToSelect: 'value'
  };

  modeSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'label',
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: false,
    showUncheckAll: false,
    selectAsObject: false,
    keyToSelect: 'value'
  };

  modeOptions = [{
    label: 'Email',
    value: 'email'
  },
  {
    label: 'SMS',
    value: 'sms'
  }];

  typeOptions = [
    {
      label: 'Info',
      value: 'info'
    },
    {
      label: 'Warning',
      value: 'warning'
    },
    {
      label: 'Critical',
      value: 'critical'
    }
  ]

  // Text configuration
  myTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'item selected',
    checkedPlural: 'items selected',
    searchPlaceholder: 'Find',
    defaultTitle: 'Select',
    allSelected: 'All Selected',
  };

  constructor(private notifGrpSvc: UnitySetupNotificationGroupService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private router: Router,
    private route: ActivatedRoute) { 
      this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getGroups();
    this.getUserList();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getGroups();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getGroups();
  }
  
  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getGroups();
  }

  pageChange(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getGroups();
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getGroups();
  }

  getGroups() {
    this.notifGrpSvc.getNotificationGroup(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      let data = this.notifGrpSvc.convertToViewdata(res.results);
      this.viewData = data.viewData;
      this.enabledCount = data.enabledCount;
      this.spinner.stop('main');
    }, err => {
      this.notification.error(new Notification('Something went wrong. Please try again!!'));
      this.spinner.stop('main');
    });
  }

  getUserList() {
    this.notifGrpSvc.getUserList().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.userList = res;
    }, err => {
      this.userList = [];
    });
  }

  setUserFieldValidation() {
    if (this.selectedUsers.length) {
      this.createForm.get('users').setValidators([]);
    } else {
      this.createForm.get('users').setValidators([Validators.required, NoWhitespaceValidator]);
    }
    this.createForm.get('users').updateValueAndValidity();
  }

  typeaheadOnSelect(e: TypeaheadMatch): void {
    this.createForm.get('users').setValue('');
    if (this.selectedUsers.filter(user => user.email == e.item.email).length) {
      return;
    }
    this.selectedUsers.push(e.item);
    this.setUserFieldValidation();
  }

  typeaheadNoResults(event: boolean): void {
    this.noUsers = event;
  }

  manageSelectedUsers(index: number) {
    this.selectedUsers.splice(index, 1);
    this.setUserFieldValidation();
  }

  createGroup() {
    this.router.navigate(['add'], { relativeTo: this.route });
    // this.addEdit = 'Add';
    // this.selectedUsers = [];
    // this.createFormErrors = this.notifGrpSvc.resetFormErrors();
    // this.nonFieldErr = '';
    // this.createValidationMessages = this.notifGrpSvc.validationMessages;
    // this.createForm = this.notifGrpSvc.createForm();
    // this.createModalRef = this.modalService.show(this.create, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  editGroup(view: UnitySetupNotificationViewdata) {
    this.router.navigate([view.uuid, 'edit'], { relativeTo: this.route });
    // this.addEdit = 'Edit';
    // this.selectedUsers = [];
    // this.selectedGroup = view;
    // this.createFormErrors = this.notifGrpSvc.resetFormErrors();
    // this.nonFieldErr = '';
    // this.createValidationMessages = this.notifGrpSvc.validationMessages;
    // this.createForm = this.notifGrpSvc.createForm(view);
    // this.createForm.addControl('uuid', new FormControl(view.uuid));
    // this.selectedUsers = this.userList.filter(user => {
    //   return view.users.indexOf(user.email) >= 0;
    // });
    // this.setUserFieldValidation();
    // this.createModalRef = this.modalService.show(this.create, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  handleError(err: any) {
    this.createFormErrors = this.notifGrpSvc.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.createForm.controls) {
          this.createFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.createModalRef.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  submitForm() {
    if (this.createForm.invalid) {
      this.createFormErrors = this.utilService.validateForm(this.createForm, this.createValidationMessages, this.createFormErrors);
      this.createForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.createFormErrors = this.utilService.validateForm(this.createForm, this.createValidationMessages, this.createFormErrors); });
    } else {
      this.spinner.start('main');
      const data = this.createForm.getRawValue();
      data.users = this.selectedUsers;
      if (this.addEdit == 'Add') {
        this.notifGrpSvc.createGroup(data).pipe(takeUntil(this.ngUnsubscribe)).subscribe(response => {
          this.createModalRef.hide();
          this.notification.success(new Notification('Group created successfully.'));
          this.spinner.stop('main');
          this.getGroups();
        }, (err: HttpErrorResponse) => {
          this.spinner.stop('main');
          this.handleError(err.error);
        });
      }
      else {
        this.notifGrpSvc.updateGroup(data.uuid, data)
          .pipe(takeUntil(this.ngUnsubscribe)).subscribe(group => {
            this.spinner.stop('main');
            this.createModalRef.hide();
            this.getGroups();
            this.notification.success(new Notification('Group updated successfully'));
          }, (err: HttpErrorResponse) => {
            this.spinner.stop('main');
            this.handleError(err.error);
          });
      }
    }
  }

  deleteGroup(view: UnitySetupNotificationViewdata) {
    this.selectedGroup = view;
    this.confirmDeleteMsg = `If you delete ${view.groupName}, Notification will not be sent onward. Are you sure want to delete ${view.groupName}?`;
    this.confirmModalRef = this.modalService.show(this.confirmDelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDeleteGroup() {
    this.confirmModalRef.hide();
    this.notifGrpSvc.deleteGroup(this.selectedGroup.uuid)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(group => {
        this.spinner.stop('main');
        this.getGroups();
        this.notification.success(new Notification('Group deleted successfully'));
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Error while deleting group. Please try again!!'));
      });
  }

  showUsers(view: UnitySetupNotificationViewdata) {
    this.popOverList = view.extraUsersList;
  }

  toggleAllNotificationGroup(action: string) {
    this.selectedActionAll = action;
    this.confirmMsg = `Are you sure you want to ${action} all notification?`;
    this.confirmModalRef = this.modalService.show(this.confirmToggleAll, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmtoggleAllNotificationGroup() {
    this.notifGrpSvc.toggleAllGroup({ disable: this.selectedActionAll == 'disable' })
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(group => {
        this.spinner.stop('main');
        this.confirmModalRef.hide();
        this.getGroups();
        this.notification.success(new Notification(`All groups ${this.selectedActionAll}d successfully`));
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification(`Error while ${this.selectedActionAll}ing all group. Please try again!!`));
      });
  }

  toggleNotificationGroup(view: UnitySetupNotificationViewdata) {
    this.selectedGroup = view;
    let action = view.status ? 'disable' : 'enable';
    this.confirmMsg = `Are you sure you want to ${action} ${view.groupName} notification group?`;
    this.confirmModalRef = this.modalService.show(this.confirmToggle, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmtoggleNotificationGroup() {
    this.confirmModalRef.hide();
    let data = { disable: this.selectedGroup.status };
    this.notifGrpSvc.toggleGroup(this.selectedGroup.uuid, data)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(group => {
        this.spinner.stop('main');
        this.getGroups();
        this.notification.success(new Notification(`${this.selectedGroup.groupName} group ${this.selectedGroup.status ? 'disable' : 'enable'}d successfully`));
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification(`Error while ${this.selectedGroup.status ? 'disable' : 'enable'}ing ${this.selectedGroup.groupName} group. Please try again!!`));
      });
  }
  
  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }
}