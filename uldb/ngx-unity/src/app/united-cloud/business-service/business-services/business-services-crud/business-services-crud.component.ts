import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { cloneDeep as _clone } from 'lodash-es';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { NgSelectDropdownType } from '../business-services.type';
import { APP_ENV, APPLICATION_TYPE_CHOICES, BUSINESS_CRITICALITY, BusinessServicesCrudService, CLOUD_TYPES, DEPLOYMENT_MODEL } from './business-services-crud.service';

@Component({
  selector: 'business-services-crud',
  templateUrl: './business-services-crud.component.html',
  styleUrls: ['./business-services-crud.component.scss'],
  providers: [BusinessServicesCrudService]
})
export class BusinessServicesCrudComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  serviceId: string = ''
  actionMessage: 'Create' | 'Update';
  businessServiceList: any[] = [];
  rbacGroup: any[] = [];
  licenseCostCenter: any[] = [];
  buildingBlock: any[] = [];
  appList: any[] = [];
  form: FormGroup;
  businessServiceForm: FormGroup;
  groupForm: FormGroup;
  formErrors: any;
  licenseCostCenterForm: any;
  businessServiceformErrors: any;
  groupformErrors: any;
  licenseCostCenterformErrors: any;
  validationMessages: any;
  businessServicevalidationMessages: any;
  licenseCostCentervalidationMessages: any;
  groupvalidationMessages: any;
  businessCriticality = BUSINESS_CRITICALITY;
  appTypeChoice = APPLICATION_TYPE_CHOICES;
  appEnv = APP_ENV;
  deploymentModel = DEPLOYMENT_MODEL;
  cloudTypes = CLOUD_TYPES;
  nonFieldErr: string = '';
  licenseCostCenterFieldLength: number = 0;
  businessServiceData: any;
  businessServiceModal: BsModalRef;
  groupModal: BsModalRef;
  lcModal: BsModalRef;
  @ViewChild('createBusinessService') createBusinessService: ElementRef;
  @ViewChild('createGroup') createGroup: ElementRef;
  @ViewChild('createLc') createLc: ElementRef;

  businessDropDownOptions: NgSelectDropdownType;
  licenseDropDownOptions: NgSelectDropdownType;
  customNgSelectValues: Record<string, string[]> = {};
  // indexedLicenseOptions: Record<number, any[]> = {};
  indexedLicenseOptions: any[][] = [];

  disabledBusinessService: any[] = [];
  disabledLicenseCostCentre: any[] = [];

  constructor(private route: ActivatedRoute,
    private router: Router,
    private svc: BusinessServicesCrudService,
    private spinner: AppSpinnerService,
    private modalService: BsModalService,
    private utilityService: AppUtilityService,
    private notification: AppNotificationService,
    private builder: FormBuilder,
    private cdRef: ChangeDetectorRef) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => this.serviceId = params.get('serviceId'));
  }

  ngOnInit(): void {
    this.getSelectedDropdownList();
    // setTimeout(() => {
    //   this.getDropdownList();
    // }, 100)
    if (this.serviceId) {
      this.actionMessage = 'Update';
      this.getDropdownData();
      this.getBusinessServiceData();
    } else {
      this.actionMessage = 'Create';
      this.getDropdownData();
    }
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getDropdownList() {
    this.svc.getDropdownData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.businessDropDownOptions = this.svc.convertDropdownData(res, this.disabledBusinessService);
      this.licenseDropDownOptions = this.svc.convertDropdownData(res, this.disabledLicenseCostCentre);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Error While fetching Dropdown list'));
    })
  }

  getSelectedDropdownList() {
    this.svc.getSelectedDropdownData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.disabledBusinessService = res.business_list;
      this.disabledLicenseCostCentre = res.license_list;
      this.getDropdownList();
    }, (err: HttpErrorResponse) => {
      this.disabledBusinessService = [];
      this.disabledLicenseCostCentre = [];
      this.notification.error(new Notification('Error While fetching Dropdown list'));
    })
  }

  getDropdownData() {
    this.spinner.start('main');
    this.svc.getBusinessDropdownData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(({ buildingBlock, appList }) => {
      if (this.buildingBlock) {
        this.buildingBlock = _clone(buildingBlock);
      } else {
        this.buildingBlock = [];
        this.notification.error(new Notification("Error while fetching Building Blocks "));
      }
      if (appList) {
        this.appList = _clone(appList);
      } else {
        this.appList = [];
        this.notification.error(new Notification("Error while fetching Applications"));
      }
      if (!this.serviceId) {
        setTimeout(() => {
          this.buildForm(null);
        }, 500)
      }
      this.spinner.stop('main');
    });
  }

  getBusinessServiceData() {
    this.spinner.start('main');
    this.svc.getBusinessServiceData(this.serviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
      this.businessServiceData = this.svc.reversePayload(data);
      setTimeout(() => {
        this.buildForm(this.businessServiceData);
      }, 500)
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.handleError(err.error);
    });
  }

  //-----------------------------BUSINESS SERVICE FORM BUILDING--------------------------------

  buildForm(data: any) {
    this.form = this.svc.buildForm(data);
    this.formErrors = this.svc.resetFormErrors();
    if (this.serviceId) {
      for (let index = 0; index < this.licenseCostCentersField.length; index++) {
        this.formErrors.license_cost_centers.push(this.svc.getLicenseCostCenterErrors());
        const appField = this.licenseCostCentersField.at(index).get('application') as FormArray;
        for (let j = 0; j < appField.length; j++) {
          this.formErrors.license_cost_centers[index].application.push(this.svc.getApplicationErrors());
        }
      }
      // this.updateLicenseCentreDropdowns(0,'');
    }
    this.initializeLicenseDropdowns();
    this.licenseCostCentersField.controls.forEach((ctrl, index) => {
      ctrl.get('license_centre')?.valueChanges.subscribe(selected => {
        this.updateLicenseCentreDropdowns();
      });
    });
    this.validationMessages = this.svc.formValidationMessages;
  }

  initializeLicenseDropdowns() {
    this.indexedLicenseOptions[0] = this.licenseDropDownOptions['license_cost_center'];
  }


  updateLicenseCentreDropdowns(removedVal?: string) {
    // gather all selected values from the array
    const selectedValues = this.licenseCostCentersField.controls
      .map(ctrl => ctrl.get('license_centre')?.value).filter(v => !!v);

    // loop through each form group in array
    this.licenseCostCentersField.controls.forEach((ctrl, idx) => {
      const currentValue = ctrl.get('license_centre')?.value;

      // build the dropdown list for this index
      const dropdown = this.licenseDropDownOptions['license_cost_center'].map(opt => ({
        ...opt,
        disabled: opt.disabled || (selectedValues.includes(opt.name) && opt.name !== currentValue)
      }));
      // if (removedVal && !dropdown.find(opt => opt.name === removedVal)) {
      //   console.log('coming inside remove val')
      //   dropdown.push({ name: removedVal, disabled: false });
      // }
      if (removedVal) {
        const existingOption = dropdown.find(opt => opt.name === removedVal);
        if (existingOption) {
          // if it exists, just enable it
          existingOption.disabled = false;
        } else {
          // if it doesn't exist, add it as enabled
          dropdown.push({ name: removedVal, disabled: false });
        }
      }

      // stash it in a per-index structure
      this.indexedLicenseOptions[idx] = dropdown;

      // ensure the control keeps its selected value if set
      if (currentValue && !dropdown.find(opt => opt.name === currentValue)) {
        dropdown.push({ name: currentValue, disabled: false });
      }
    });

    this.cdRef.detectChanges();
  }




  get licenseCostCentersField(): FormArray {
    return this.form.get('license_cost_centers') as FormArray;
  }

  get applicationsField(): FormArray {
    return ((this.form.get('license_cost_centers') as FormArray).at(this.licenseCostCenterFieldLength).get('application') as FormArray);
  }

  addApplication(i: number, j: number) {
    this.licenseCostCenterFieldLength = i;
    let appGroupForm = <FormGroup>this.applicationsField.at(j);
    if (appGroupForm.invalid) {
      this.formErrors.license_cost_centers[i].application[j] = this.utilityService.validateForm(appGroupForm, this.validationMessages.license_cost_centers.application, this.formErrors.license_cost_centers[i].application[j]);
      appGroupForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
        this.formErrors.license_cost_centers[i].application[j] = this.utilityService.validateForm(appGroupForm, this.validationMessages.license_cost_centers.application, this.formErrors.license_cost_centers[i].application[j]);
      });
    } else {
      const appControl = this.builder.group({
        app_name_id: ['', Validators.required],
        business_criticality: ['', Validators.required],
        type_of_app: ['', Validators.required],
        cloud_types: ['', Validators.required],
        env: ['', Validators.required],
        deployment_model: ['', Validators.required]
      });

      const appField = this.licenseCostCentersField.at(i).get('application') as FormArray;
      appField.push(appControl);
      this.formErrors.license_cost_centers[i].application.push(this.svc.getApplicationErrors());
    }
  }

  removeApplication(i: number, j: number) {
    this.licenseCostCenterFieldLength = i;
    const appField = this.licenseCostCentersField.at(i).get('application') as FormArray;
    if (appField.length > 1) {
      appField.removeAt(j);
      this.formErrors.license_cost_centers[i].application.splice(j, 1);
    }
  }

  addLicenseCostCenter(i: number) {
    this.licenseCostCenterFieldLength = i;
    let liscenseCostCenterGroup = <FormGroup>this.licenseCostCentersField.at(i);
    let appFormGroup = <FormGroup>this.applicationsField.at(this.applicationsField.length - 1);
    if (liscenseCostCenterGroup.invalid) {
      this.formErrors.license_cost_centers[i] = this.utilityService.validateForm(liscenseCostCenterGroup, this.validationMessages.license_cost_centers, this.formErrors.license_cost_centers[i]);
      liscenseCostCenterGroup.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
        this.formErrors.license_cost_centers[i] = this.utilityService.validateForm(liscenseCostCenterGroup, this.validationMessages.license_cost_centers, this.formErrors.license_cost_centers[i]);
      });
    } else if (appFormGroup.invalid) {
      this.formErrors.license_cost_centers[i].application[this.applicationsField.length - 1] = this.utilityService.validateForm(appFormGroup, this.validationMessages.license_cost_centers.application, this.formErrors.license_cost_centers[i].application[this.applicationsField.length - 1]);
      appFormGroup.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
        this.formErrors.license_cost_centers[i].application[this.applicationsField.length - 1] = this.utilityService.validateForm(appFormGroup, this.validationMessages.license_cost_centers.application, this.formErrors.license_cost_centers[i].application[this.applicationsField.length - 1]);
      });
    } else {
      const lccControl = this.builder.group({
        license_centre: [null, Validators.required],
        building_block_code: ['', Validators.required],
        application: this.builder.array([
          this.builder.group({
            app_name_id: ['', Validators.required],
            business_criticality: ['', Validators.required],
            type_of_app: ['', Validators.required],
            cloud_types: ['', Validators.required],
            env: ['', Validators.required],
            deployment_model: ['', Validators.required]
          })])
      });

      const lccField = this.form.get('license_cost_centers') as FormArray;
      lccControl?.valueChanges.subscribe(selected => {
        this.updateLicenseCentreDropdowns();
      });
      lccField.push(lccControl);
      this.formErrors.license_cost_centers.push(this.svc.getLicenseCostCenterErrors());
      this.updateLicenseCentreDropdowns();
    }
  }

  removeLicenseCostCenter(i: number) {
    if (this.licenseCostCentersField.length > 1) {
      const removedValue = this.licenseCostCentersField.at(i).get('license_centre')?.value;
      this.licenseCostCentersField.removeAt(i);
      this.formErrors.license_cost_centers.splice(i, 1);
      this.updateLicenseCentreDropdowns(removedValue);
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      this.formErrors = this.utilityService.validateForm(this.form, this.validationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
        this.formErrors = this.utilityService.validateForm(this.form, this.validationMessages, this.formErrors);
      });
    } else {
      this.submitCustomDropdownFields();
      this.spinner.start('main');
      let obj = this.svc.transformPayload(Object.assign({}, this.form.getRawValue()), this.licenseCostCenter, this.buildingBlock, this.appList);
      if (this.serviceId) {
        this.svc.updateBusinessService(obj, this.serviceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Business Service was updated successfuly.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.svc.createBusinessService(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Business Service was created successfuly.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  handleError(err: any) {

    for (let index = 0; index < this.licenseCostCentersField.length; index++) {
      this.formErrors.license_cost_centers.push(this.svc.getLicenseCostCenterErrors());
      const appField = this.licenseCostCentersField.at(index).get('application') as FormArray;
      for (let j = 0; j < appField.length; j++) {
        this.formErrors.license_cost_centers[index].application.push(this.svc.getApplicationErrors());
      }
    }
    this.formErrors = this.svc.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    }
    else if (err) {
      for (const field in err) {
        if (field in this.form) {
          this.form[field] = err[field][0];
        }
      }
    } else {
      this.goBack();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }


  //-----------------------------BUSINESS SERVICE  LISTING DROPDOWN--------------------------------

  onBusinessServiceChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    if (selectedValue == 'addNew') {
      this.form.get('business_service')?.setValue('');
      this.addBusinessServiceDropDownOption(event);
    }
  }

  addBusinessServiceDropDownOption(event: Event) {
    event.stopPropagation();
    this.buildBusinessServiceForm();
    this.businessServiceModal = this.modalService.show(this.createBusinessService, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  buildBusinessServiceForm() {
    this.businessServiceForm = this.svc.buildBusinessServiceForm();
    this.businessServiceformErrors = this.svc.resetBusinessServiceFormErrors();
    this.businessServicevalidationMessages = this.svc.businessServiceValidationMessages;
  }


  confirmBusinessServiceCreate() {
    if (this.businessServiceForm.invalid) {
      this.businessServiceformErrors = this.utilityService.validateForm(this.businessServiceForm, this.businessServicevalidationMessages, this.businessServiceformErrors);
      this.businessServiceForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.businessServiceformErrors = this.utilityService.validateForm(this.businessServiceForm, this.businessServicevalidationMessages, this.businessServiceformErrors);
      });
    } else {
      let obj = this.businessServiceForm.getRawValue();
      this.svc.createBusinessDropdown(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.businessServiceModal.hide();
        this.svc.getBusinessServiceList().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.businessServiceList = res;
          this.spinner.stop('main');
        });
        this.notification.success(new Notification('Business Service created successfully.'));
      }, (err: HttpErrorResponse) => {
        this.handleBusinessServiceDropDownError(err.error);
      });
    }
  }

  handleBusinessServiceDropDownError(err: any) {
    this.businessServiceformErrors = this.svc.resetBusinessServiceFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    }
    else if (err.detail) {
      this.nonFieldErr = err.detail;
    }
    else if (err) {
      for (const field in err) {
        if (field in this.businessServiceForm.controls) {
          this.businessServiceformErrors[field] = err[field][0];
        }
      }
    } else {
      this.businessServiceModal.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }


  //-----------------------------RBAC GROUP LISTING DROPDOWN--------------------------------

  // onGroupChange(event: Event) {
  //   const selectedValue = (event.target as HTMLSelectElement).value;
  //   if (selectedValue == 'addNew') {
  //     this.form.get('rbac_group')?.setValue('');
  //     this.addGroupDropDownOption(event);
  //   }
  // }

  // addGroupDropDownOption(event: Event) {
  //   event.stopPropagation();
  //   this.buildGroupForm();
  //   this.groupModal = this.modalService.show(this.createGroup, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  // }

  // buildGroupForm() {
  //   this.groupForm = this.svc.buildGroupForm();
  //   this.groupformErrors = this.svc.resetGroupFormErrors();
  //   this.groupvalidationMessages = this.svc.groupValidationMessages;
  // }

  // handleGroupDropDownError(err: any) {
  //   this.businessServiceformErrors = this.svc.resetGroupFormErrors();
  //   if (err.non_field_errors) {
  //     this.nonFieldErr = err.non_field_errors[0];
  //   }
  //   else if (err.detail) {
  //     this.nonFieldErr = err.detail;
  //   }
  //   else if (err) {
  //     for (const field in err) {
  //       if (field in this.groupForm.controls) {
  //         this.groupformErrors[field] = err[field][0];
  //       }
  //     }
  //   } else {
  //     this.businessServiceModal.hide();
  //     this.notification.error(new Notification('Something went wrong!! Please try again.'));
  //   }
  //   this.spinner.stop('main');
  // }

  // confirmGroupCreate() {
  //   if (this.groupForm.invalid) {
  //     this.groupformErrors = this.utilityService.validateForm(this.groupForm, this.groupvalidationMessages, this.groupformErrors);
  //     this.groupformErrors.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
  //       this.groupformErrors = this.utilityService.validateForm(this.groupForm, this.groupvalidationMessages, this.groupformErrors);
  //     });
  //   } else {
  //     let obj = this.groupForm.getRawValue();
  //     this.svc.createGroupDropdown(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
  //       this.groupModal.hide();
  //       // this.svc.getRbacGroup().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
  //       //   this.rbacGroup = res;
  //       //   this.spinner.stop('main');
  //       // });
  //       this.notification.success(new Notification('Rbac Group created successfully.'));
  //     }, (err: HttpErrorResponse) => {
  //       this.handleGroupDropDownError(err.error);
  //     });
  //   }
  // }

  //-----------------------------LICENSE CENTER LIST DROPDOWN--------------------------------

  onLicenseCostChange(event: Event, index: number) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    if (selectedValue == 'addNew') {
      this.licenseCostCentersField.at(index).get('license_centre')?.setValue('');
      this.addLicenseCostDropDownOption(event);
    }
  }

  addLicenseCostDropDownOption(event: Event) {
    event.stopPropagation();
    this.buildLicenseCostCenterForm();
    this.lcModal = this.modalService.show(this.createLc, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  buildLicenseCostCenterForm() {
    this.licenseCostCenterForm = this.svc.buildLicenseCostForm();
    this.licenseCostCenterformErrors = this.svc.resetLicenseCostFormErrors();
    this.licenseCostCentervalidationMessages = this.svc.licenseCostValidationMessages;
  }

  handleLicenseCenterDropDownError(err: any) {
    this.businessServiceformErrors = this.svc.resetGroupFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    }
    else if (err.detail) {
      this.nonFieldErr = err.detail;
    }
    else if (err) {
      for (const field in err) {
        if (field in this.licenseCostCenterForm.controls) {
          this.licenseCostCenterformErrors[field] = err[field][0];
        }
      }
    } else {
      this.businessServiceModal.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  // confirmLicenseCostCreate() {
  //   if (this.licenseCostCenterForm.invalid) {
  //     this.licenseCostCenterformErrors = this.utilityService.validateForm(this.groupForm, this.groupvalidationMessages, this.groupformErrors);
  //     this.licenseCostCenterformErrors.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
  //       this.licenseCostCenterformErrors = this.utilityService.validateForm(this.groupForm, this.groupvalidationMessages, this.groupformErrors);
  //     });
  //   } else {
  //     let obj = this.licenseCostCenterForm.getRawValue();
  //     this.svc.createLicenseCenterDropdown(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
  //       this.lcModal.hide();
  //       this.svc.getLicenseCostCenter().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
  //         this.licenseCostCenter = res;
  //         this.spinner.stop('main');
  //       });
  //       this.notification.success(new Notification('License Center created successfully.'));
  //     }, (err: HttpErrorResponse) => {
  //       this.handleLicenseCenterDropDownError(err.error);
  //     });
  //   }
  // }

  goBack() {
    if (this.serviceId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

  // addTag(field: string) {
  //   return (name: string) => {
  //     if (field != 'license_cost_center') {
  //       this.customNgSelectValues[field] = [];
  //       this.customNgSelectValues[field].push(name);
  //     }
  //     if (field == 'license_cost_center') {
  //       this.dropDownOptions[field].includes(name) || this.dropDownOptions[field].push(name);
  //       if (!this.customNgSelectValues[field]) {
  //         this.customNgSelectValues[field] = [];
  //       } else {
  //         this.customNgSelectValues[field].includes(name) || this.customNgSelectValues[field].push(name);
  //       }
  //     }
  //     return name;
  //   };
  // }

  addTag(field: string) {
    return (name: string) => {
      const isDisabled = this.businessDropDownOptions[field]?.some(
        opt => opt.name === name && opt.disabled
      );
      if (isDisabled) return null;

      if (!this.businessDropDownOptions[field].some(opt => opt.name === name)) {
        this.businessDropDownOptions[field].push({ name });
      }

      this.customNgSelectValues[field] = this.customNgSelectValues[field] || [];
      if (!this.customNgSelectValues[field].includes(name)) {
        this.customNgSelectValues[field].push(name);
      }

      return { name };
    };
  }

  addLicenseTag(field: string, currentIndex: number) {
    return (name: string) => {
      if (!this.licenseDropDownOptions[field].some(opt => opt.name === name)) {
        this.licenseDropDownOptions[field].push({ name });
      }

      // Update dropdowns so new value gets disabled in others
      this.updateLicenseCentreDropdowns();

      return { name };
    };
  }



  submitCustomDropdownFields() {
    if (!Object.keys(this.customNgSelectValues).length) {
      return;
    }
    const formData = this.form.getRawValue();
    const lccValues = formData.license_cost_centers.map(lcc => lcc.license_centre);
    this.customNgSelectValues['license_cost_center'] = lccValues;
    this.svc.updateFields(this.customNgSelectValues).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Error while updating custom dropdown values'));
    })
  }
}
