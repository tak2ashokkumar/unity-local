import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { UsfBasicService } from '../usf-basic/usf-basic.service';
import { UsfComponentsService } from '../usf-components/usf-components.service';
import { stepsConst, UsfCrudService } from './usf-crud.service';
import { BasicDataType, BuildingBlockDataType, ComponentDataType, NgSelectDropdownType, stepType } from '../unity-setup-finops.type';

@Component({
  selector: 'usf-crud',
  templateUrl: './usf-crud.component.html',
  styleUrls: ['./usf-crud.component.scss'],
  providers: [UsfCrudService, UsfBasicService],
  encapsulation: ViewEncapsulation.None
})
export class UsfCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  action: 'Create' | 'Update';
  instanceId: string;
  instance: BuildingBlockDataType;
  dropDownOptions: NgSelectDropdownType;

  steps: stepType[] = stepsConst;
  currentStep = 0;

  nonFieldErr: string = '';
  activeForm: string = 'basic';
  onBasic: boolean = false;
  onComponent: boolean = false;

  // basicFormData: BasicDataType;
  // componentsFormData: ComponentDataType;

  constructor(private svc: UsfCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private basicFormSvc: UsfBasicService,
    private componentsFormSvc: UsfComponentsService) { // need to inject usfComponentsService

    this.route.paramMap.subscribe((params: ParamMap) => {
      this.instanceId = params.get('id');
    });
  }

  ngOnInit(): void {
    this.getDropdownList();
    if(this.instanceId){
      this.action = 'Update'
      this.getBuildingBlockDetails();
    } else {
      this.action = 'Create'
      this.manageActiveForm();
    }
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getDropdownList() {
    this.svc.getDropdownData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.dropDownOptions = this.svc.convertDropdownData(res);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Error While fetching Dropdown list'));
    })
  }

  getBuildingBlockDetails() {
    this.spinner.start('main');
    // console.log(this.instanceId,'bef')
    this.svc.getBuildingBlockDetails(this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.instance = res;
      this.instanceId = res.uuid;
      // console.log('after',res);
      this.spinner.stop('main');
      this.manageActiveForm();
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Error While fetching Building Block Details'));
      this.spinner.stop('main');
    })
  }

  manageActiveForm(step?: string) {
    switch (step) {
      case 'basic':
        this.activeForm = 'basic';
        this.buildBasicForm();
        break;
      case 'components':
        if (this.basicFormSvc.form.valid && this.instanceId) {
          this.activeForm = 'components';
          this.buildComponentsForm();
        }
        else{
          this.notification.warning(new Notification('Please fill the basic form details!'));
        }
        break;
      // case 'functional':
      //   this.activeForm = 'functional';
      //   break;
      // case 'dynamic':
      // break;
      // case 'operational':
      //   this.activeForm = 'operational';
      //   break;
      // case 'fixed':
      // this.activeForm = 'fixed';
      // break;
      // case 'service':
      // this.activeForm = 'service';
      // break;
      default:
        this.activeForm = 'basic';
        this.buildBasicForm();
      // if (this.instanceId) {
      //   this.buildComponentsForm();
      // }
    }
  }

  buildBasicForm() {
    // console.log("before build");
    if (this.instanceId) {
      // console.log("after build", this.instance.basic);
      this.basicFormSvc.createForm(this.instance.basic);
      this.onBasic = true;
    } else {
      this.basicFormSvc.createForm(null);
    }
    // this.basicFormData = this.basicFormSvc.getFormValue();
  }

  buildComponentsForm() {
    if (this.instanceId) {
      this.componentsFormSvc.buildForm(this.instance.component);
      this.onComponent = true;
    } else {
      this.componentsFormSvc.buildForm(null);
    }
    // this.componentsFormData = this.componentsFormSvc.getForm();
  }

  isValid(step?: string) {
    switch (step) {
      case 'basic':
        this.basicFormSvc?.form?.valid;
        break;
      case 'components':
        this.componentsFormSvc?.form?.valid;
        break;
    }
  }

  goBack() {
    if (this.instanceId && this.action == 'Update') {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

  submitCustomFields() {
    let obj = new Object();
    if (this.activeForm == 'basic') {
      obj = this.basicFormSvc.getCustomDropdownValues();
    } else {
      obj = this.componentsFormSvc.getCustomDropdownData();
    }
    if (!Object.keys(obj).length) {
      return;
    }
    this.svc.updateFields(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Error while updating custom dropdown values'));
    })
  }

  submitBasicFormData() {
    this.spinner.start('main');
    let obj = Object.assign({}, { 'basic': this.basicFormSvc.getFormValue() });
    if (this.instanceId) {
      //For edit case
      this.instance.basic = this.basicFormSvc.getFormValue(); //Needs to be handled from API resp
      this.svc.update(obj, this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        // this.instance = res;
        this.spinner.stop('main');
        this.manageActiveForm('components');
      }, (err: HttpErrorResponse) => {
        this.basicFormSvc.handleError(err.error);
        this.spinner.stop('main');
      });
    }
    else {
      this.svc.create(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.instance = res;
        this.instanceId = res.uuid;
        this.spinner.stop('main');
        this.manageActiveForm('components');
      }, (err: HttpErrorResponse) => {
        this.basicFormSvc.handleError(err.error);
        this.spinner.stop('main');
      });
    }
  }

  submitcomponentsFormData() {
    this.spinner.start('main');
    let obj = Object.assign({}, { 'component': this.componentsFormSvc.getForm() });
    // Patch data
    this.svc.update(obj, this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.goBack();
    }, (err: HttpErrorResponse) => {
      this.basicFormSvc.handleError(err.error);
      this.spinner.stop('main');
    });
  }

  // onSave() { }

  onSubmit() {
    switch (this.activeForm) {
      case 'basic':
        this.basicFormSvc.submit();
        if (this.basicFormSvc.form.invalid) {
          return;
        }
        this.submitCustomFields();
        this.submitBasicFormData();
        break;
      case 'components':
        this.componentsFormSvc.submit();
        if (this.componentsFormSvc.form.invalid) {
          return;
        }
        this.submitCustomFields();
        this.submitcomponentsFormData();
        break;
    }
  }

}
