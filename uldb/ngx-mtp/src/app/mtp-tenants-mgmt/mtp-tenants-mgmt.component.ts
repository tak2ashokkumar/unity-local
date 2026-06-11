import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Event, NavigationEnd, ParamMap, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, Subscription } from 'rxjs';
import { map, switchMap, take, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from '../shared/app-notification/app-notification.service';
import { Notification } from '../shared/app-notification/notification.type';
import { AppSpinnerService } from '../shared/app-spinner/app-spinner.service';
import { AppUtilityService } from '../shared/app-utility/app-utility.service';
import { IMultiSelectSettings } from '../shared/multiselect-dropdown/types';
import { PAGE_SIZES, SearchCriteria } from '../shared/table-functionality/search-criteria';
import { MtpTenantsMgmtService, TenantGroupViewData } from './mtp-tenants-mgmt.service';
import { TenantByGroupType } from '../shared/SharedEntityTypes/tenant-mgmt.type';

@Component({
  selector: 'tenants-mgmt',
  templateUrl: './mtp-tenants-mgmt.component.html',
  styleUrls: ['./mtp-tenants-mgmt.component.scss']
})
export class MtpTenantsMgmtComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  private subscr: Subscription;

  currentCriteria: SearchCriteria;

  isInitialLoad: boolean = true;
  @ViewChild('createGroupRef') createGroupRef: ElementRef;
  createGroupModalRef: BsModalRef;
  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;
  groups: TenantGroupViewData[]
  selectedGroupId: string;
  selectedTenantId: string;
  selectedTenantGroupUuid: string;
  isOpen: boolean = false;
  @ViewChild('deleteGroupRef') deleteGroupRef: ElementRef;
  deleteGroupModalRef: BsModalRef;
  allGroupsLoaded: boolean = false;

  unityModuleSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    selectAsObject: true,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };

  constructor(private router: Router,
    private route: ActivatedRoute,
    private modalService: BsModalService,
    private cdr: ChangeDetectorRef,
    private mtpTenantMgmtSvc: MtpTenantsMgmtService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notificationService: AppNotificationService,) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
    this.mtpTenantMgmtSvc.deleteAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.reloadGroupsAfterDelete();
    });
    this.subscr = this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        if (event.url == '/tenantsmgmt' && !this.isInitialLoad) {
          this.goToFirstTenant();
        }
      }
    });
    this.route.queryParamMap.pipe(take(1)).subscribe((params: ParamMap) => {
      if (params.has('tenantId') && params.has('groupId')) {
        this.selectedTenantId = params.get('tenantId');
        this.selectedTenantGroupUuid = params.get('groupId');
        this.allGroupsLoaded = false;
      } else {
        this.selectedTenantGroupUuid = null;
        this.selectedTenantId = null;
      }
    });
    this.mtpTenantMgmtSvc.tenantToggleAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((uuid: string) => {
      this.mtpTenantMgmtSvc.populateSingleTenantGroup(this.groups, this.selectedTenantGroupUuid).pipe(take(1)).subscribe(res => {
        this.groups = res;
        this.cdr.detectChanges();
        this.gotoTenant(uuid);
      });
    });

    this.mtpTenantMgmtSvc.tenantDetailsLoadedSourceAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((uuid: string) => {
      if (!this.allGroupsLoaded) this.populateRemainingTenants(this.selectedTenantGroupUuid)
    });
  }

  ngOnInit(): void {
    if (this.selectedTenantId) {
      this.getSpecificTenantGroup(this.selectedTenantGroupUuid);
    } else {
      this.getFirstTenantGroup(null); // includes goToFirstTenant()
    }
    this.isInitialLoad = false;
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    if (this.subscr && !this.subscr.closed) {
      this.subscr.unsubscribe();
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }


  getFirstTenantGroup(groupId: string) {
    this.groups = [];
    this.spinner.start('main');

    this.mtpTenantMgmtSvc.getFirstTenantGroups(groupId).pipe(take(1)).subscribe(res => {
      this.groups = res;

      this.spinner.stop('main');
      this.goToFirstTenant();
    });
  }
  getSpecificTenantGroup(groupId: string) {
    this.groups = [];
    this.spinner.start('main');

    this.mtpTenantMgmtSvc.getFirstTenantGroups(groupId).pipe(take(1)).subscribe(res => {
      this.groups = res;
      this.gotoTenant(this.selectedTenantId)
      this.spinner.stop('main');
    });
  }


  populateRemainingTenants(uuidToskip?: string) {
    const uuid = uuidToskip ? uuidToskip : null;
    this.mtpTenantMgmtSvc.populateRemainingTenants(this.groups, uuid).pipe(take(1)).subscribe(res => {
      this.groups = res;

      this.checkDelete();
    });

    this.allGroupsLoaded = true;
  }



  toggleGroup(index: number) {
    this.groups[index].isOpen = !this.groups[index].isOpen;
  }

  goToFirstTenant() {
    this.selectedTenantId = null;
    for (let i = 0; i < this.groups.length; i++) {
      if (this.groups[i].tenants && this.groups[i].tenants.length) {
        this.groups[i].deleteButtonEnabled = false;
        this.groups[i].deleteButtonTooltipMessage = 'Group having tenants cannot be deleted';
        if (!this.selectedTenantId) {
          this.groups[i].isOpen = true;
          this.selectedTenantId = this.groups[i].tenants[0].uuid;
        } else {
          this.groups[i].isOpen = false;
        }
      } else {
        this.groups[i].isOpen = false;
        this.groups[i].deleteButtonEnabled = true;
        this.groups[i].deleteButtonTooltipMessage = 'Delete';
      }
    }

    if (this.selectedTenantId) {
      this.gotoTenant(this.selectedTenantId);
    }
  }

  // markLoadingFlags(groups: TenantGroupViewData[], loadedUuid?: string) {
  //   return groups.map((group, index) => ({
  //     ...group,
  //     isTenantsLoading: loadedUuid ? group.uuid !== loadedUuid : index !== 0
  //   }));
  // }

  addGroup(isModel?: boolean) {
    this.form = this.mtpTenantMgmtSvc.buildForm();
    this.formValidationMessages = this.mtpTenantMgmtSvc.formValidationMessages;
    this.formErrors = this.mtpTenantMgmtSvc.resetFormErrors();
    this.isOpen = true;
    this.selectedGroupId = null;
  }

  editGroup(group: TenantGroupViewData) {
    this.selectedGroupId = group.uuid;
    this.form = this.mtpTenantMgmtSvc.buildForm(group.name);
    this.formValidationMessages = this.mtpTenantMgmtSvc.formValidationMessages;
    this.formErrors = this.mtpTenantMgmtSvc.resetFormErrors();
    this.createGroupModalRef = this.modalService.show(this.createGroupRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  reloadGroups(goToCurrentTenant: boolean) {
    this.mtpTenantMgmtSvc.getFirstTenantGroups().pipe(take(1)).subscribe(res => {
      this.groups = res;

      // After initial assignment, populate remaining tenants and clear loaders
      this.mtpTenantMgmtSvc.populateRemainingTenants(this.groups).pipe(take(1)).subscribe(res2 => {
        this.groups = res2
        this.cdr.detectChanges();

        if (goToCurrentTenant) {
          this.gotoTenant(this.selectedTenantId);
        } else {
          this.goToFirstTenant();
        }
      });
    });
  }


  reloadGroupsAfterDelete() {
    let selectedTenantGroup = this.groups.find(group =>
      group.tenants.some(tenant => tenant.uuid === this.selectedTenantId)
    );
    let isMatchingGroupFound = false;

    if (selectedTenantGroup?.tenants?.length) {

      this.mtpTenantMgmtSvc.populateSingleTenantGroup(this.groups, selectedTenantGroup.uuid).pipe(take(1)).subscribe(res => { // pass original result to next operator
        this.groups = res;
        for (let i = 0; i < this.groups.length; i++) {
          if (this.groups[i].uuid === selectedTenantGroup.uuid && this.groups[i].tenants.length > 0) {
            isMatchingGroupFound = true;
            this.gotoTenant(this.groups[i].tenants[0].uuid);
            break;
          }
        }
        if (!isMatchingGroupFound) {
          this.goToFirstTenant();
        }
      });
    } else {
      this.goToFirstTenant();
    }
  }


  cancelGroup() {
    if (this.selectedGroupId) {
      this.createGroupModalRef.hide();
    } else {
      this.isOpen = false;
    }
  }

  deleteGroup(group: TenantGroupViewData) {
    if (!group.deleteButtonEnabled) {
      return;
    }
    this.selectedGroupId = group.uuid;
    this.deleteGroupModalRef = this.modalService.show(this.deleteGroupRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.spinner.start('main');
    this.mtpTenantMgmtSvc.deleteGroup(this.selectedGroupId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.reloadGroups(false);
      this.deleteGroupModalRef.hide();
      this.spinner.stop('main');
      this.notificationService.success(new Notification('Group deleted successfully.'));
    }, err => {
      this.spinner.stop('main');
      this.notificationService.error(new Notification('Error while deleting Group . Please try again'));
    });
  };

  gotoTenant(tenantUuid: string) {
    this.selectedTenantId = null;
    for (let i = 0; i < this.groups.length; i++) {
      if (this.groups[i].tenants && this.groups[i].tenants.length) {
        this.groups[i].deleteButtonEnabled = false;
        this.groups[i].deleteButtonTooltipMessage = 'Group having tenants cannot be deleted';
      } else {
        this.groups[i].deleteButtonEnabled = true;
        this.groups[i].deleteButtonTooltipMessage = 'Delete';
      }
      const group = this.groups[i];
      for (let j = 0; j < group.tenants.length; j++) {
        const tenant = group.tenants[j];
        if (tenant.uuid == tenantUuid) {
          group.isOpen = true;
          this.selectedTenantId = tenantUuid;
          this.selectedTenantGroupUuid = group.uuid
          break;
        } else {
          group.isOpen = false;
        }
      }
      if (!group.tenants.length) {
        group.isOpen = false;
      }
    }
    if (tenantUuid) {
      this.router.navigate([this.selectedTenantGroupUuid, tenantUuid, 'overview', 'details'], { relativeTo: this.route.parent });
    }
  }

  addTenant() {
    this.router.navigate(['create'], { relativeTo: this.route.parent });
  }

  submit() {
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors); });
    } else {
      this.spinner.start('main');
      let obj = this.form.getRawValue();
      if (this.selectedGroupId) {
        this.mtpTenantMgmtSvc.saveGroup(obj, this.selectedGroupId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          if (this.createGroupModalRef) {
            this.createGroupModalRef.hide();
          }
          this.reloadGroups(true);
          this.spinner.stop('main');
          this.notificationService.success(new Notification('Group updated successfully.'));
        }, err => {
          this.spinner.stop('main');
          this.notificationService.error(new Notification('Failed to update Group. Please try again'));
        });
      } else {
        this.mtpTenantMgmtSvc.saveGroup(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.isOpen = false;
          this.reloadGroups(true);
          this.spinner.stop('main');
          this.notificationService.success(new Notification('Group created successfully.'));
        }, err => {
          this.spinner.stop('main');
          this.notificationService.error(new Notification('Failed to create Group. Please tryagain'));
        });
      }
    }
  }

  impersonateTenant(tenant: TenantByGroupType) {
    if (tenant.absolute_url) {
      window.open(tenant.absolute_url, "_blank")
    } else {
      let impersonateUrl = `${window.location.protocol}//${window.location.host}/managed-base/?user=${tenant.user_uuid}`;
      window.open(impersonateUrl, "_blank")
    }
  }

  checkDelete() {
    for (let i = 0; i < this.groups.length; i++) {
      if (this.groups[i].tenants && this.groups[i].tenants.length) {
        this.groups[i].deleteButtonEnabled = false;
        this.groups[i].deleteButtonTooltipMessage = 'Group having tenants cannot be deleted';
      } else {
        this.groups[i].isOpen = false;
        this.groups[i].deleteButtonEnabled = true;
        this.groups[i].deleteButtonTooltipMessage = 'Delete';
      }
    }
  }
}