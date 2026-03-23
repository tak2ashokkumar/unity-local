import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { ModulePermissionSetView, ModulePermissionSetViewData, UsumPermissionSetsCrudService, viewPermissionEnableBasedOnMultiplePermissionName, viewPermissionEnabledBasedOnOnePermissionName } from './usum-permission-sets-crud.service';
import { FormArray, FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { ModulesAndPermissionsType } from '../usum-permission-sets.type';
import { PermissionSetType } from 'src/app/shared/SharedEntityTypes/user-mgmt.type';
import { cloneDeep as _clone } from 'lodash-es';
import { UnityModules } from 'src/app/app.component';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';

@Component({
  selector: 'usum-permission-sets-crud',
  templateUrl: './usum-permission-sets-crud.component.html',
  styleUrls: ['./usum-permission-sets-crud.component.scss'],
  providers: [UsumPermissionSetsCrudService]
})
export class UsumPermissionSetsCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  permissionSetId: string;

  action: 'Create' | 'Edit';
  permissionSetDetails: PermissionSetType;
  modulesAndPermissionsList: ModulesAndPermissionsType[] = [];
  modulePermissionSets: ModulePermissionSetViewData[] = [];

  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;
  nonFieldErr: string = '';

  entityGroupTypes = [];
  entityGroupTypeSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: "uuid",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-sm btn-default btn-block',
    dynamicTitleMaxItems: 3,
    displayAllSelectedText: true,
    showCheckAll: false,
    showUncheckAll: false,
    appendToBody: true,
  };
  entityGroupTypeSelectionTexts: IMultiSelectTexts = {
    defaultTitle: 'Select Type',
    checkedPlural: 'Entity Group selected'
  };

  constructor(private crudSvc: UsumPermissionSetsCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.permissionSetId = params.get('permissionSetId');
      this.action = this.permissionSetId ? 'Edit' : 'Create';
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getEntityGroups();
    this.getModulesPermissionSets();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getEntityGroups() {
    this.crudSvc.getEntityGtoups().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.entityGroupTypes = res;
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get entity groups details'));
    })
  }

  getModulesPermissionSets() {
    this.crudSvc.getModulesPermissionSets().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.modulesAndPermissionsList = res;
      this.modulePermissionSets = this.crudSvc.convertToModulePermissionSetsViewData(res);
      if (this.permissionSetId) {
        this.getPermissionSetDetails();
      } else {
        this.buildForm();
      }
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get Module details'));
    })
  }

  getPermissionSetDetails() {
    this.crudSvc.getPermissionSetDetails(this.permissionSetId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.permissionSetDetails = res;
      if (res && res.permissions?.length) {
        res.permissions.map(rpms => {
          let module = this.modulePermissionSets.find(mps => mps.moduleName == rpms.module__name);
          if (module) {
            let permissionSet = module.permissionSets.find(mps => mps.permission == rpms.name);
            if (permissionSet) {
              permissionSet.isSelected = true;
            }
          }
        })
      }
      this.buildForm();
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to fetch Permission details'));
    })
  }

  buildForm() {
    this.form = this.crudSvc.buildForm(this.permissionSetDetails);
    this.formErrors = this.crudSvc.resetFormErrors();
    this.formValidationMessages = this.crudSvc.formValidationMessages;
    this.spinner.stop('main');
  }

  selectPermission(mps: ModulePermissionSetViewData, ps: ModulePermissionSetView) {
    ps.isSelected = !ps.isSelected;
    if (ps.isSelected) {
      this.handleNextLevelTaskSelection(mps, ps);
    }
    if (this.nonFieldErr) {
      let selected = _clone(this.modulePermissionSets.filter(mps => mps.permissionSets.find(ps => ps.isSelected)));
      this.nonFieldErr = selected.length ? '' : 'Permission Set selection is required';
    }
  }

  handleNextLevelTaskSelection(mps: ModulePermissionSetViewData, ps: ModulePermissionSetView) {
    if (mps.moduleName == UnityModules.DEVOPS_AUTOMATION) {
      this.handleDEVOpsAutomationTaskSelection(mps, ps);
    } if (mps.moduleName == UnityModules.UNITY_SETUP) {
      this.handleUnitySetupTaskSelection(ps);
    } else {
      let isNextLevelTask = ps.permission.includes('Manage') || ps.permission.includes('Download')
        || ps.permission.includes('Add') || ps.permission.includes('Sync') || ps.permission.includes('Order')
        || ps.permission.includes('Remote') || ps.permission.includes('Register') || ps.permission.includes('Cost')
        || ps.permission.includes('Execute');
      if (isNextLevelTask) {
        let viewPermissionSet = mps.permissionSets.find(mpset => mpset.permission.includes('View'));
        viewPermissionSet.isSelected = true;
      }
    }
  }

  handleDEVOpsAutomationTaskSelection(mps: ModulePermissionSetViewData, ps: ModulePermissionSetView) {
    let entity = ps.permission.split(' ').slice(1).join(' ');
    switch (entity) {
      case 'Tasks':
      case 'Workflow':
      case 'Scripts':
        mps.permissionSets.forEach(mpset => {
          if (ps.permission.includes('View')) {
            let select = mpset.permission == `View ${entity}` || mpset.permission == 'View DevOps Automation';
            if (select) {
              mpset.isSelected = true;
            }
          } else {
            let select = mpset.permission == `View ${entity}` || mpset.permission == `Manage ${entity}`
              || mpset.permission == `Execute ${entity}` || mpset.permission == 'View DevOps Automation';
            if (select) {
              mpset.isSelected = true;
            }
          }
        });
        break;
      default:
        mps.permissionSets.forEach(mpset => {
          if (ps.permission.includes('View')) { // for View Devops Automation
            if (mpset.permission.includes('View')) {
              mpset.isSelected = true;
            }
          } else { //for Manage Devops Automation
            if (mpset.permission.includes('View') || mpset.permission.includes('Manage')) {
              mpset.isSelected = true;
            }
          }
        })
    }
  }

  handleUnitySetupTaskSelection(ps: ModulePermissionSetView) {
    this.modulePermissionSets.map(mps => {
      mps.permissionSets.forEach(mpset => {
        if (ps.permission.includes('View')) {
          let select = mpset.permission == 'View Users' || mpset.permission == 'View Onboarding'
            || mpset.permission == 'View UnityCollector' || mpset.permission == 'View Credentials'
            || mpset.permission == 'View Integrations' || mpset.permission == 'View Notifications'
            || mpset.permission == 'View Connections';
          if (select) {
            mpset.isSelected = true;
          }
        } else { // Manage UnitySetup Selected 
          let select = mpset.permission == 'View UnitySetup'
            || mpset.permission == 'View Users' || mpset.permission == 'Manage Users' || mpset.permission == 'Create Users'
            || mpset.permission == 'View Onboarding' || mpset.permission == 'Manage Onboarding'
            || mpset.permission == 'View UnityCollector' || mpset.permission == 'Manage UnityCollector' || mpset.permission == 'Register UnityCollector'
            || mpset.permission == 'View Credentials' || mpset.permission == 'Manage Credentials' || mpset.permission == 'Manage Monitoring'
            || mpset.permission == 'View Integrations' || mpset.permission == 'Manage Integrations' || mpset.permission == 'Add Integrations' || mpset.permission == 'Sync Integrations'
            || mpset.permission == 'View Notifications' || mpset.permission == 'Manage Notifications'
            || mpset.permission == 'View Connections' || mpset.permission == 'Manage Connections'
          if (select) {
            mpset.isSelected = true;
          }
        }
      })
    })
  }


  onSubmit() {
    let selected = _clone(this.modulePermissionSets.filter(mps => mps.permissionSets.find(ps => ps.isSelected)));
    if (!selected.length) {
      this.nonFieldErr = 'Permission Set selection is required';
    }
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
        selected = this.modulePermissionSets.filter(mps => mps.permissionSets.find(ps => ps.isSelected));
        this.nonFieldErr = selected.length ? '' : 'Permission Set selection is required';
      });
    } else {
      let obj = Object.assign({}, this.crudSvc.convertToAPIData(this.form.getRawValue(), selected));
      if (this.permissionSetId) {
        this.crudSvc.save(obj, this.permissionSetId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Permission Set updated successfully.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.crudSvc.save(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Permission Set created successfully.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  handleError(err: any) {
    this.formErrors = this.crudSvc.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.form.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  goBack() {
    if (this.permissionSetId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

}