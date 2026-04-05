import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { GpuOrchestrationCrudService } from './gpu-orchestration-crud.service';

@Component({
  selector: 'gpu-orchestration-crud',
  templateUrl: './gpu-orchestration-crud.component.html',
  styleUrls: ['./gpu-orchestration-crud.component.scss'],
  providers: [GpuOrchestrationCrudService]
})
export class GpuOrchestrationCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  containerId: string;
  action: 'Create' | 'Update';

  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;
  nonFieldErr: string = '';

  dropdownData: any = {
    clouds: [],
    accounts: [],
    regions: [],
    plans: [],
    imageOffers: [],
    storageTypes: [],
    publishers: []
  };
  constructor(private crudSvc: GpuOrchestrationCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.containerId = params.get('id');
      this.action = this.containerId ? 'Update' : 'Create';
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getDropdownData();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getDropdownData() {
    this.crudSvc.getDropdownData().pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.dropdownData = res;
      if (this.containerId) {
        this.getGpuContainerDetails();
      } else {
        this.buildForm(null);
      }
    });
  }

  getGpuContainerDetails() {
    this.crudSvc.getGpuContainerDetails(this.containerId).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res) => {
      this.buildForm(res);
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to fetch GPU container details'));
    });
  }

  buildForm(data: any) {
    this.form = this.crudSvc.buildForm(data);
    this.formErrors = this.crudSvc.resetFormErrors();
    this.formValidationMessages = this.crudSvc.formValidationMessages;
    this.spinner.stop('main');
  }

  onSubmit() {
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
        this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      });
    } else {
      this.spinner.start('main');
      let obj = Object.assign({}, this.form.getRawValue());
      console.log('obj : ', obj)
      if (this.containerId) {
        this.crudSvc.updateGpuContainer(this.containerId, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
          this.notification.success(new Notification('GPU Container updated successfully'));
          this.spinner.stop('main');
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        console.log('adding  obj : ', obj)
        this.crudSvc.createGpuContainer(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
          this.notification.success(new Notification('GPU Container created successfully'));
          this.spinner.stop('main');
          console.log('added successfully')
          this.goBack();
        }, (err: HttpErrorResponse) => {
          console.log('error : ', err)
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
    if (this.containerId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

}
