import { Component, OnInit } from '@angular/core';
import { UsisPureCrudService } from './usis-pure-crud.service';
import { FormGroup } from '@angular/forms';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { UnityCollectorType } from 'src/app/shared/SharedEntityTypes/collector.type';
import { Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { PureStorageCrudFormdata } from '../usis-pure.type';
import { isString } from 'lodash';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

@Component({
  selector: 'usis-pure-crud',
  templateUrl: './usis-pure-crud.component.html',
  styleUrls: ['./usis-pure-crud.component.scss'],
  providers: [UsisPureCrudService]
})
export class UsisPureCrudComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  actionMessage: 'Add' | 'Edit';
  form: FormGroup;
  formErrors: any;
  validationMessages: any;
  nonFieldErr: string = '';
  storageId: string;
  datacenters: Array<DatacenterFast> = [];
  collectors: UnityCollectorType[] = [];

  constructor(private crudSvc: UsisPureCrudService,
    private spinner: AppSpinnerService,
    private modalService: BsModalService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,
    private router: Router,
    private route: ActivatedRoute,) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.storageId = params.get('deviceId');
      this.actionMessage = this.storageId ? 'Edit' : 'Add';
    });
  }

  ngOnInit(): void {
    this.getDatacenters();
    this.getCollectors();
    if(this.storageId){
      this.edit();
    }else{
      this.add();
    }
  }

  getDatacenters() {
    this.datacenters = [];
    this.crudSvc.getDatacenters().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.datacenters = res;
    });
  }

  getCollectors() {
    this.crudSvc.getCollectors().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.collectors = res;
    });
  }

  getDetails() {
    this.crudSvc.getDetails(this.storageId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.buildForm(res);
    })
  }

  add() {
    this.actionMessage = 'Add';
    this.buildForm(null);
  }

  edit() {
    this.actionMessage = 'Edit';
    this.getDetails();
  }

  buildForm(data: any) {
    this.nonFieldErr = '';
    this.form = this.crudSvc.buildForm(data);
    this.formErrors = this.crudSvc.resetFormErrors();
    this.validationMessages = this.crudSvc.validationMessages;
    // this.modalRef = this.modalService.show(this.create, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
  }

  handleError(err: any) {
    this.formErrors = this.crudSvc.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err.detail) {
      this.nonFieldErr = err.detail;
    } else if (err) {
      if (isString(err)) {
        this.nonFieldErr = err;
      }
      for (const field in err) {
        if (field in this.form.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    } else {
      // this.modalRef.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  onSubmit() {
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
      this.form.valueChanges
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors); });
      return;
    } else {
      this.spinner.start('main');
      let obj = <PureStorageCrudFormdata>Object.assign({}, this.form.getRawValue());
      if (this.storageId) {
        this.crudSvc.save(obj, this.storageId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          // this.modalRef.hide();
          this.notification.success(new Notification('Storage updated successfully'));
          // this.onCrud.emit(CRUDActionTypes.UPDATE)
          this.spinner.stop('main');
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.crudSvc.save(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          // this.modalRef.hide();
          this.notification.success(new Notification('Storage added successfully'));
          // this.onCrud.emit(CRUDActionTypes.ADD)
          this.spinner.stop('main');
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  deleteStorage(uuid: string) {
    this.storageId = uuid;
    // this.deleteModalRef = this.modalService.show(this.deleteConfirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.spinner.start('main');
    // this.deleteModalRef.hide();
    this.crudSvc.deleteDevice(this.storageId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      // this.onCrud.emit(CRUDActionTypes.DELETE);
      this.spinner.stop('main');
      this.notification.success(new Notification('Storage deleted successfully.'));
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to delete. Please try again.'));
    });
  }

  goBack() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }
}
