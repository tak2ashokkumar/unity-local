import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { UscpCostModelCrudService } from './uscp-cost-model-crud.service';
import { UscpCostModelService } from '../uscp-cost-model.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { CostModelInstance } from '../uscp-cost-model.type';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';

@Component({
  selector: 'uscp-cost-model-crud',
  templateUrl: './uscp-cost-model-crud.component.html',
  styleUrls: ['./uscp-cost-model-crud.component.scss'],
  providers: [UscpCostModelCrudService, UscpCostModelService]
})
export class UscpCostModelCrudComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();
  costModelId: string = '';
  nonFieldErr: string = '';

  form: FormGroup;
  formErrors: any;
  validationMessages: any;
  actionMessage: 'Create' | 'Update';
  regionData: string[] = [];
  datacenterList: string[] = [];

  regionSettings: IMultiSelectSettings = {
    isSimpleArray: true,
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    appendToBody: true,
  };

  userSelectionTexts: IMultiSelectTexts = {
    defaultTitle: 'Select Region',
  };

  userSelectionDCTexts: IMultiSelectTexts = {
    defaultTitle: 'Select Datacenters',
  };



  modalRef: BsModalRef;
  @ViewChild('confirmUpdate') confirmUpdate: ElementRef;

  constructor(private costModelCrudService: UscpCostModelCrudService,
    private costModelService: UscpCostModelService,
    private router: Router,
    private route: ActivatedRoute,
    private utilityService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private modalService: BsModalService) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => this.costModelId = params.get('costModelId'));
  }

  ngOnInit(): void {
    this.getRegions();
    if (this.costModelId) {
      this.actionMessage = 'Update';
      this.getModelData();
    } else {
      this.actionMessage = 'Create';
      this.buildForm(null);
    }
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getRegions() {
    this.costModelService.getRegions().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.regionData = this.costModelService.convertRegionData(data);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Regions'));
    });
  }

  getModelData() {
    this.spinner.start('main');
    this.costModelCrudService.getModelData(this.costModelId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.buildForm(res);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get cost model.'))
    })
  }

  getDatacenters(val: string[]) {
    this.spinner.start('main');
    this.costModelCrudService.getDatacenters(val).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.datacenterList = this.costModelCrudService.getAllDatacenters(res);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get cost model.'))
    })
  }

  buildForm(data: CostModelInstance) {
    this.form = this.costModelCrudService.buildForm(data);
    this.formErrors = this.costModelCrudService.resetFormErrors();
    this.validationMessages = this.costModelCrudService.formValidationMessages;
    if(this.costModelId){      
      this.getDatacenters(this.form.get('regions').value);
    }
    this.manageFormsubscription(this.form);
  }

  manageFormsubscription(form: FormGroup) {
    form.get('plan_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
      if (val == 'All At One Price' || val == 'Disk Only') {
        form.get('disk_type').setValidators([Validators.required]);
      }
      else {
        form.get('disk_type').removeValidators([Validators.required]);
        form.get('disk_type').setValue('');
      }
    });
  }

  get planType(): string {
    return this.form.get("plan_type").value;
  }

  onRegionChange() {
    this.getDatacenters(this.form.get('regions').value);
    if (!this.form.get('regions')?.value?.length) {
      this.form.get('datacenters').disable();
    }
    else {
      this.form.get('datacenters').enable();
    }
  }

  handleError(err: any) {
    this.formErrors = this.costModelCrudService.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err.msg) {
      this.nonFieldErr = err.msg;
    } else if (err) {
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

  onEditSubmit() {
    this.modalRef.hide();
    this.spinner.start('main');
    this.costModelCrudService.updateModel(this.form.getRawValue(), this.costModelId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      this.spinner.stop('main');
      this.notification.success(new Notification('Cost model was updated successfuly.'));
      this.goBack();
    }, (err: HttpErrorResponse) => {
      this.handleError(err.error);
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.formErrors = this.utilityService.validateForm(this.form, this.validationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
        this.formErrors = this.utilityService.validateForm(this.form, this.validationMessages, this.formErrors);
      });
    } else {
      if (this.costModelId) {
        this.modalRef = this.modalService.show(this.confirmUpdate, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
      } else {
        this.spinner.start('main');
        this.costModelCrudService.createModel(this.form.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Cost model was created successfuly.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  goBack() {
    if (this.costModelId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }
}
