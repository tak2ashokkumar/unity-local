import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TenatGroupType } from 'src/app/shared/SharedEntityTypes/tenant-mgmt.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { MtpTenantInfoDataType, MtpTenantsMgmtCrudService } from './mtp-tenants-mgmt-crud.service';
import { UnityModulesDataType } from './mtp-tenants-mgmt-crud.type';
import { cloneDeep as _clone } from 'lodash-es';
import { HttpErrorResponse } from '@angular/common/http';
import { AppLevelService } from 'src/app/app-level.service';

@Component({
  selector: 'mtp-tenants-mgmt-crud',
  templateUrl: './mtp-tenants-mgmt-crud.component.html',
  styleUrls: ['./mtp-tenants-mgmt-crud.component.scss'],
  providers: [MtpTenantsMgmtCrudService]
})
export class MtpTenantsMgmtCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();

  form: FormGroup;
  tenantId: string;
  groupTenantId: string;
  formErrors: any;
  formValidationMessages: any;
  nonFieldErr: string;
  unityModulesList: Array<UnityModulesDataType> = [];
  tenantGroupList: Array<TenatGroupType> = [];
  tenantInfo: MtpTenantInfoDataType;
  uploadedFileName: string;
  unityModuleSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'module_name',
    keyToSelect: 'module_id',
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
    private mtpTenantCrudSvc: MtpTenantsMgmtCrudService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private appService: AppLevelService) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.groupTenantId = params.get('groupId');
      this.tenantId = params.get('uuid');
    });
  }

  ngOnInit(): void {
    this.getDropdownData();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getDropdownData() {
    this.spinner.start('main');
    this.tenantGroupList = [];
    this.unityModulesList = [];
    this.mtpTenantCrudSvc.getDropdownData().pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(({ groups, unityModules }) => {
        if (groups) {
          this.tenantGroupList = _clone(groups);
        } else {
          this.tenantGroupList = [];
        }

        if (unityModules) {
          this.unityModulesList = _clone(unityModules);
        } else {
          this.unityModulesList = [];
          this.notification.error(new Notification("Error while fetching Unity Modules list"));
        }

        if (this.tenantId) {
          this.getTenantInfo();
        } else {
          this.buildForm();
        }
      });
  }

  getTenantInfo() {
    this.mtpTenantCrudSvc.getTenantInfo(this.tenantId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tenantInfo = res;
      this.buildForm();
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while fetching tenant Info. Please try again'));
    });
  }

  buildForm() {
    this.nonFieldErr = '';
    this.form = this.mtpTenantCrudSvc.buildForm(this.tenantInfo);
    this.formValidationMessages = this.mtpTenantCrudSvc.formValidationMessages;
    this.formErrors = this.mtpTenantCrudSvc.resetFormErrors();
    this.spinner.stop('main');
    setTimeout(() => {
      this.initLocation();
    }, 10);
  }

  initLocation() {
    let autocomplete = new google.maps.places.Autocomplete(document.getElementById('location') as HTMLInputElement, { types: [] });
    autocomplete.setFields(['geometry', 'formatted_address']);
    autocomplete.addListener('place_changed', (d) => {
      let place = autocomplete.getPlace();
      this.form.get('searchlocation').setValue(place.formatted_address);
      this.form.get('location').setValue(place.formatted_address);
      this.form.get('lat').setValue(place.geometry.location.lat());
      this.form.get('long').setValue(place.geometry.location.lng());
    });
  }

  reset() {
    if (this.tenantId) {
      this.buildForm();
    } else {
      if (this.form) {
        this.form.reset();
        this.uploadedFileName = '';
        this.form.get('_logo').setValue('');
      }
    }
  }

  removeLogo() {
    this.uploadedFileName = '';
    this.form.get('_logo').setValue('');
  }

  onFileSelected(file: FileList) {
    const selectedFile = file.item(0);
    this.uploadedFileName = file.item(0).name;
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const dataString = e.target.result;
        this.form.get('_logo').setValue(dataString);
      };
      reader.readAsDataURL(selectedFile);
    }
  }

  handleError(err: any) {
    this.formErrors = this.mtpTenantCrudSvc.resetFormErrors();
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
      this.goBack();
    }
    this.spinner.stop('main');
  }

  submit() {
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors) });
    } else {
      this.spinner.start('main');
      let obj = this.form.getRawValue();
      // this.form.removeControl('searchlocation');
      if (this.tenantId) {
        this.mtpTenantCrudSvc.editTenant(obj, this.tenantId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Tenant Updated Successfully.'));
          this.router.navigate(['../../../'], { relativeTo: this.route, queryParams: { tenantId: this.tenantId, groupId: this.groupTenantId } });
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
          // this.notification.error(new Notification('Error while Updating Tenant. Please try again'));
        });
      } else {
        this.mtpTenantCrudSvc.addTenant(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.spinner.stop('main');
          this.router.navigate(['../../../'], { relativeTo: this.route, queryParams: { tenantId: this.tenantId, groupId: this.groupTenantId } });
          this.notification.success(new Notification('Tenant Created Successfully.'));
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
          // this.notification.error(new Notification('Error while creating Tenant. Please try again'));
        });
      }
    }
  }

  goBack() {
    if (this.tenantId) {
      this.router.navigate(['../', 'overview', 'details'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

}