import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { isString } from 'lodash-es';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from '../app-notification/app-notification.service';
import { Notification } from '../app-notification/notification.type';
import { AppSpinnerService } from '../app-spinner/app-spinner.service';
import { AppUtilityService, CRUDActionTypes } from '../app-utility/app-utility.service';
import { UnityCollectorType } from '../SharedEntityTypes/collector.type';
import { DatacenterFast } from '../SharedEntityTypes/datacenter.type';
import { PureStorageCrudFormdata } from '../SharedEntityTypes/inventory/storage.type';
import { UsiPureStorageCrudService } from './usi-pure-storage-crud.service';

@Component({
  selector: 'usi-pure-storage-crud',
  templateUrl: './usi-pure-storage-crud.component.html',
  styleUrls: ['./usi-pure-storage-crud.component.scss']
})
export class UsiPureStorageCrudComponent implements OnInit, OnDestroy {
  @Output('onCrud') onCrud = new EventEmitter<CRUDActionTypes>();

  private ngUnsubscribe = new Subject();
  @ViewChild('create') create: ElementRef;
  modalRef: BsModalRef;

  @ViewChild('deleteConfirm') deleteConfirm: ElementRef;
  deleteModalRef: BsModalRef;

  actionMessage: 'Add' | 'Edit';
  form: FormGroup;
  formErrors: any;
  validationMessages: any;
  nonFieldErr: string = '';
  storageId: string;
  datacenters: Array<DatacenterFast> = [];
  collectors: UnityCollectorType[] = [];
  constructor(private crudSvc: UsiPureStorageCrudService,
    private spinner: AppSpinnerService,
    private modalService: BsModalService,
    private notification: AppNotificationService,
    private utilService: AppUtilityService,) {
    this.crudSvc.addOrEditAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((uuid: string) => {
      if (uuid) {
        this.storageId = uuid;
        this.actionMessage = 'Edit';
        this.edit();
      } else {
        this.storageId = null;
        this.actionMessage = 'Add';
        this.add();
      }
    });
    this.crudSvc.deleteAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(uuid => {
      if (uuid) {
        this.deleteStorage(uuid);
      }
    })
  }

  ngOnInit(): void {
    this.getDatacenters();
    this.getCollectors();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
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
    this.modalRef = this.modalService.show(this.create, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
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
      this.modalRef.hide();
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
          this.modalRef.hide();
          this.notification.success(new Notification('Storage updated successfully'));
          this.onCrud.emit(CRUDActionTypes.UPDATE)
          this.spinner.stop('main');
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.crudSvc.save(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.modalRef.hide();
          this.notification.success(new Notification('Storage added successfully'));
          this.onCrud.emit(CRUDActionTypes.ADD)
          this.spinner.stop('main');
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  deleteStorage(uuid: string) {
    this.storageId = uuid;
    this.deleteModalRef = this.modalService.show(this.deleteConfirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.spinner.start('main');
    this.deleteModalRef.hide();
    this.crudSvc.deleteDevice(this.storageId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.onCrud.emit(CRUDActionTypes.DELETE);
      this.spinner.stop('main');
      this.notification.success(new Notification('Storage deleted successfully.'));
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to delete. Please try again.'));
    });
  }

}
