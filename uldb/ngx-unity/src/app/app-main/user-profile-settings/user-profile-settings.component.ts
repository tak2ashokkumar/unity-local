import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppDashboardListType } from 'src/app/app-dashboard/app-dashboard.type';
import { AppLevelService } from 'src/app/app-level.service';
import { UnityModules, UnityPermissionSet } from 'src/app/app.component';
import { TicketMgmtList } from 'src/app/shared/SharedEntityTypes/ticket-mgmt-list.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { TabData } from 'src/app/shared/tabdata';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { LlmConfigViewData, providerImages, UserProfileSettingsService, UserProfileViewData } from './user-profile-settings.service';
import { UnityOrganizationSettings, UnityOrganizationSettingsTicketInstance } from './user-profile-settings.type';
import { ActivatedRoute, Route, Router } from '@angular/router';

@Component({
  selector: 'user-profile-settings',
  templateUrl: './user-profile-settings.component.html',
  styleUrls: ['./user-profile-settings.component.scss'],
  providers: [UserProfileSettingsService]
})
export class UserProfileSettingsComponent implements OnInit, OnDestroy {
  public tabItems: TabData[] = tabItems;
  public ngUnsubscribe = new Subject();
  user: UserProfileViewData = new UserProfileViewData();
  orgSettings: UnityOrganizationSettings;
  itsmInstances: TicketMgmtList[] = [];

  @ViewChild('changePasswordTemplate') changePasswordTemplate: ElementRef;
  changePasswordModalRef: BsModalRef;
  changePasswordForm: FormGroup;
  changePasswordFormErrors: any;
  changePasswordValidationMessages: any;

  @ViewChild('changeTZTemplate') changeTZTemplate: ElementRef;
  changeTZModalRef: BsModalRef;
  changeTZForm: FormGroup;

  @ViewChild('resetForm') resetForm: ElementRef;
  autoTicketingForm: FormGroup;
  autoTicketingFormErrors: any;
  autoTicketingValidationMessages: any

  userList: User[] = [];
  selectedUsers: User[] = [];
  noUsers = false;

  timeZoneList: string[] = [];
  profileCollapsed: boolean = true;

  dashboardList: AppDashboardListType[] = [];
  selectedDashboard: AppDashboardListType;
  @ViewChild('confirmDefaultDashboardRef') confirmDefaultDashboardRef: ElementRef;
  defaultDashboardModalRef: BsModalRef;

  supportedLlmsViewData: LlmConfigViewData[] = []
  userOwnedLlms: LlmConfigViewData[] = [];

  delId: string = '';
  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  modelDeleteModalRef: BsModalRef;
  providerImages = providerImages;

  severityTypeSettings: IMultiSelectSettings = {
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

  severityOptions = [
    {
      label: 'Critical',
      value: 'critical'
    },
    {
      label: 'Warning',
      value: 'warning'
    },
    {
      label: 'Information',
      value: 'information'
    },
  ]

  severityTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'item selected',
    checkedPlural: 'items selected',
    searchPlaceholder: 'Find',
    defaultTitle: 'Select',
    allSelected: 'All Selected',
  };

  aimlPermissionSet: UnityPermissionSet;
  monitoringPermissionSet: UnityPermissionSet;
  constructor(private profileSvc: UserProfileSettingsService,
    private utilService: AppUtilityService,
    private modalService: BsModalService,
    private appService: AppLevelService,
    public userInfo: UserInfoService,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService,
    private router: Router,
    private route: ActivatedRoute) {
    this.aimlPermissionSet = new UnityPermissionSet(UnityModules.AIML_EVENT_MANAGEMENT);
    this.monitoringPermissionSet = new UnityPermissionSet(UnityModules.MONITORING);
  }

  ngOnInit() {
    this.spinner.start('main');
    this.timeZoneList = this.utilService.getTimezones();
    this.getUserProfile();
    this.getOrganizationSettings();
    this.getItsmList();
    this.getDashboardList();
    this.getLLMList();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getUserProfile() {
    this.profileSvc.getUserProfile().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.user = this.profileSvc.convertToViewData(res);
    }, err => {
    }, () => {
      this.spinner.stop('main');
    });
  }

  get isGlobalReadOnly(): boolean {
    if (!this.user || !this.user.activeRbacRoles) {
      return false;
    }

    if (Array.isArray(this.user.activeRbacRoles)) {
      return this.user.activeRbacRoles.includes('Global Read-Only');
    }

    return this.user.activeRbacRoles === 'Global Read-Only';
  }

  getOrganizationSettings() {
    this.profileSvc.getOrganizationSettings().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.orgSettings = res[0];
      console.log(this.orgSettings)
      if (this.orgSettings.auto_ticketing_enabled) {
        this.buildAutoTicketingForm();
      }
    }, (err: HttpErrorResponse) => {
      this.orgSettings = null;
      this.notification.error(new Notification('Failed to fetch organization settings'));
    });
  }

  getItsmList() {
    this.profileSvc.getTcktMgmtList().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.itsmInstances = res;
    }, (err: HttpErrorResponse) => {
      this.itsmInstances = [];
      this.notification.error(new Notification('Failed to fetch ITSM Instances.'));
    });
  }

  getDashboardList() {
    this.profileSvc.getDashboardList().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      let index = res.findIndex(d => d.uuid === this.userInfo.defaultDashboard);
      if (index > -1) {
        res[index].is_default = true;
      }
      this.dashboardList = res;
    }, (err: HttpErrorResponse) => {
      this.dashboardList = [];
      this.notification.error(new Notification('Failed to fetch Dashboard List.'));
    });
  }

  toggleRemediationSwitch() {
    if (!this.orgSettings) {
      return;
    }
    this.orgSettings.auto_remediation_enabled = !this.orgSettings.auto_remediation_enabled;
    let action = this.orgSettings.auto_remediation_enabled ? 'enable' : 'disable';
    this.profileSvc.updateOrgSettings(this.orgSettings).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.orgSettings = res
      this.notification.success(new Notification(`Auto remediation ${action} successfully.`));
    }, (err: HttpErrorResponse) => {
      this.orgSettings.auto_remediation_enabled = !this.orgSettings.auto_remediation_enabled;
      this.notification.error(new Notification(`Failed to ${action} auto remediation settings.`));
    });
  }


  toggleRcaAISwitch() {
    if (!this.orgSettings) {
      return;
    }
    this.orgSettings.attach_rca_to_ticket = !this.orgSettings.attach_rca_to_ticket;
    let action = this.orgSettings.attach_rca_to_ticket ? 'enable' : 'disable';
    this.profileSvc.updateOrgSettings(this.orgSettings).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.orgSettings = res
      this.notification.success(new Notification(`AI-generated RCA report ${action} successfully.`));
    }, (err: HttpErrorResponse) => {
      this.orgSettings.auto_remediation_enabled = !this.orgSettings.auto_remediation_enabled;
      this.notification.error(new Notification(`Failed to ${action} AI-generated RCA report settings.`));
    });
  }

  toggleTicketingSwitch() {
    if (!this.orgSettings) {
      return;
    }
    this.orgSettings.auto_ticketing_enabled = !this.orgSettings.auto_ticketing_enabled;
    let action = this.orgSettings.auto_ticketing_enabled ? 'enable' : 'disable';
    this.profileSvc.updateOrgSettings(this.orgSettings).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.orgSettings = res
      if (this.orgSettings.auto_ticketing_enabled) {
        this.buildAutoTicketingForm();
      } else {
        this.closeAutoTicketingForm();
      }
      this.notification.success(new Notification(`Auto ticketing ${action} successfully.`));
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification(`Failed to ${action} auto ticketing settings.`));
    });
  }

  resetToDefaultAutoTicketingSettings() {
    this.orgSettings.auto_ticketing_enabled = true;
    this.orgSettings.ticketing_instance = null;
    this.orgSettings.auto_ticketing_severity = null;
    this.orgSettings.auto_ticketing_delay = 70;
    this.profileSvc.updateOrgSettings(this.orgSettings).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.orgSettings = res;
      if (this.orgSettings.auto_ticketing_enabled) {
        this.buildAutoTicketingForm();
      } else {
        this.closeAutoTicketingForm();
      }
      this.notification.success(new Notification(`Auto ticketing settings set to default values.`));
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification(`Failed to set default values for Auto Ticketing settings.`));
    });
  }

  buildAutoTicketingForm() {
    this.autoTicketingForm = this.profileSvc.buildAutoTicketingForm(this.orgSettings);
    this.autoTicketingFormErrors = this.profileSvc.resetAutoTicketingFormErrors();
    this.autoTicketingValidationMessages = this.profileSvc.autoTicketingFormValidationMessages;
  }

  compareInstances(val1: UnityOrganizationSettingsTicketInstance, val2: UnityOrganizationSettingsTicketInstance) {
    return val1 && val2 && val1.uuid === val2.uuid;
  }

  closeAutoTicketingForm() {
    this.autoTicketingForm = null;
    this.autoTicketingFormErrors = null;
    this.autoTicketingValidationMessages = null;
  }

  saveSettings(settings: UnityOrganizationSettings) {
    if (this.autoTicketingForm.invalid) {
      this.autoTicketingFormErrors = this.utilService.validateForm(this.autoTicketingForm, this.autoTicketingValidationMessages, this.autoTicketingFormErrors);
      this.autoTicketingForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.autoTicketingFormErrors = this.utilService.validateForm(this.autoTicketingForm, this.autoTicketingValidationMessages, this.autoTicketingFormErrors); });
    } else {
      let obj = Object.assign({}, this.orgSettings, this.autoTicketingForm.getRawValue());
      this.profileSvc.saveSettings(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.orgSettings = res;
        if (this.orgSettings.auto_ticketing_enabled) {
          this.buildAutoTicketingForm();
        } else {
          this.closeAutoTicketingForm();
        }
        this.notification.success(new Notification('Auto ticketing settings updated successfully'));
      }, (err: HttpErrorResponse) => {
        this.notification.error(new Notification('Failed to update  Auto ticketing settings.'));
      });
    }
  }

  changePasswordBuildForm() {
    this.changePasswordForm = this.profileSvc.buildchangePasswordForm();
    this.changePasswordFormErrors = this.profileSvc.resetChangePasswordFormErrors();
    this.changePasswordValidationMessages = this.profileSvc.changePasswordValidationMessages;
    this.changePasswordModalRef = this.modalService.show(this.changePasswordTemplate, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  onChangePasswordSubmit() {
    if (this.changePasswordForm.invalid) {
      this.changePasswordFormErrors = this.utilService.validateForm(this.changePasswordForm, this.changePasswordValidationMessages, this.changePasswordFormErrors);
      this.changePasswordForm.valueChanges
        .subscribe((data: any) => { this.changePasswordFormErrors = this.utilService.validateForm(this.changePasswordForm, this.changePasswordValidationMessages, this.changePasswordFormErrors); });
      return;
    } else {
      this.changePasswordFormErrors = this.profileSvc.resetChangePasswordFormErrors();
      this.spinner.start('main');
      this.profileSvc.updatePassword(this.changePasswordForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.spinner.stop('main');
        this.changePasswordModalRef.hide();
        this.notification.success(new Notification('Password changed successfully. You will be redirected to the login page to authenticate with the new password.'));
        this.appService.logout();
      }, (err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.changePasswordModalRef.hide();
        this.notification.error(new Notification(err.error));
      });
    }
  }

  changeTimeZone() {
    this.changeTZForm = this.profileSvc.buildChangeTZForm(this.user);
    this.changeTZModalRef = this.modalService.show(this.changeTZTemplate, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  onChangeTZSubmit() {
    this.spinner.start('main');
    this.profileSvc.updateTimezone(this.changeTZForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.changeTZModalRef.hide();
      this.userInfo.loadUserData();
      this.notification.success(new Notification('Timezone changed successfully.'));
      this.getUserProfile();
    }, err => {
      this.spinner.stop('main');
      this.changeTZModalRef.hide();
      this.notification.error(new Notification('Error while updating the timezone.'));
    });
  }

  setDefaultDashboard(dashboard: AppDashboardListType) {
    this.selectedDashboard = dashboard;
    this.defaultDashboardModalRef = this.modalService.show(this.confirmDefaultDashboardRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmSetDefaultDashboard() {
    this.defaultDashboardModalRef.hide();
    this.spinner.start('main');
    this.profileSvc.setDefaultDashboard(this.selectedDashboard.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.notification.success(new Notification('Default dashboard set successfully.'));
      this.userInfo.defaultDashboard = this.selectedDashboard.uuid;
      this.getDashboardList();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to set default dashboard.'));
      this.spinner.stop('main');
    });
  }

  getLLMList() {
    this.profileSvc.getLLMList().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.userOwnedLlms = this.profileSvc.convertToLLMListViewData(res.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get Supported Llms'));
      this.spinner.stop('main');
    });
  }

  enableModel(model: any) {
    this.profileSvc.enableModel(model.id).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getLLMList();
      this.spinner.stop('main');
      this.notification.success(new Notification('Model Enabled successfully.'));
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Something wrong happened!! Please try again.'));
    });
  }

  editModel(model: any) {
    this.router.navigate(['edit-model', model.id], { relativeTo: this.route });
  }

  deleteModel(model: any) {
    this.delId = model.id;
    this.modelDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmModelDelete() {
    this.modelDeleteModalRef.hide();
    this.spinner.start('main');
    this.profileSvc.deleteModel(this.delId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.getLLMList();
      this.notification.success(new Notification('Model deleted successfully.'));
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Something wrong happened!! Please try again.'));
    });
  }

  goToAddModel() {
    this.router.navigate(['add-model'], { relativeTo: this.route })
  }
}

export const tabItems: TabData[] = [
  {
    name: 'Profile Settings',
    url: '/profile'
  }
];