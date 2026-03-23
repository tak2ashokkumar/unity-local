import { Component, OnInit, ElementRef, ViewChild, Output, EventEmitter, OnDestroy } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { AppUtilityService, CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';
import { DataCenter } from 'src/app/united-cloud/datacenter/tabs';
import { DcCrudService } from './dc-crud.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'dc-crud',
  templateUrl: './dc-crud.component.html',
  styleUrls: ['./dc-crud.component.scss']
})
export class DcCrudComponent implements OnInit, OnDestroy {
  @Output('onCrud') onCrud = new EventEmitter<{ type: CRUDActionTypes, dcId?: string }>();

  @ViewChild('confirm') confirm: ElementRef;
  @ViewChild('create') create: ElementRef;
  dcId: string;

  actionMessage: 'Add' | 'Edit';
  createModalRef: BsModalRef;
  confirmModalRef: BsModalRef;
  datacenterForm: FormGroup;
  formErrors: any;
  validationMessages: any;
  nonFieldErr: string = '';
  private ngUnsubscribe = new Subject();

  constructor(private crudService: DcCrudService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private spinnerService: AppSpinnerService,
    private notificationService: AppNotificationService) {
    this.crudService.addOrEditAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(dcId => {
      this.dcId = dcId;
      this.actionMessage = this.dcId ? 'Edit' : 'Add';
      this.nonFieldErr = '';
      this.createModalRef = null;
      this.buildForm(dcId);
    });
    this.crudService.deleteAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(dcId => {
      this.dcId = dcId;
      this.confirmModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    })
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    document.querySelectorAll('.pac-container').forEach(el => el.remove());
  }

  buildForm(dcId: string) {
    this.nonFieldErr = '';
    this.crudService.buildForm(dcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
      this.datacenterForm = form;
      this.formErrors = this.crudService.resetFormErrors();
      this.validationMessages = this.crudService.validationMessages;
      this.createModalRef = this.modalService.show(this.create, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
      this.initLocation();
    });
  }

  initLocation() {
    let autocomplete = new google.maps.places.Autocomplete(document.getElementById('location') as HTMLInputElement, { types: [] });
    autocomplete.setFields(['geometry', 'formatted_address']);
    autocomplete.addListener('place_changed', (d) => {
      let place = autocomplete.getPlace();
      this.datacenterForm.get('searchlocation').setValue(place.formatted_address);
      this.datacenterForm.get('location').setValue(place.formatted_address);
      this.datacenterForm.get('lat').setValue(place.geometry.location.lat());
      this.datacenterForm.get('long').setValue(place.geometry.location.lng());
    });
  }

  handleError(err: any) {
    this.formErrors = this.crudService.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.datacenterForm) {
          this.datacenterForm[field] = err[field][0];
        }
      }
    } else {
      this.createModalRef.hide();
      this.notificationService.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinnerService.stop('main');
  }

  onSubmit() {
    if (this.datacenterForm.invalid) {
      this.formErrors = this.utilService.validateForm(this.datacenterForm, this.validationMessages, this.formErrors);
      this.datacenterForm.valueChanges
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.datacenterForm, this.validationMessages, this.formErrors); });
      return;
    } else {
      this.datacenterForm.removeControl('searchlocation');
      this.spinnerService.start('main');
      if (this.actionMessage === 'Add') {
        this.crudService.saveDatacenter(null, <DataCenter>this.datacenterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(res => {
            this.createModalRef.hide();
            document.querySelectorAll('.pac-container').forEach(el => el.remove());
            this.notificationService.success(new Notification('Datacenter added successfully'));
            this.onCrud.emit({ type: CRUDActionTypes.ADD, dcId: res.uuid });
            this.spinnerService.stop('main');
          }, (err: HttpErrorResponse) => {
            this.handleError(err.error);
            this.datacenterForm.addControl('searchlocation', new FormControl(this.datacenterForm.get('location').value, Validators.required));
          });
      } else {
        this.crudService.saveDatacenter(this.dcId, <DataCenter>this.datacenterForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(res => {
            this.createModalRef.hide();
            document.querySelectorAll('.pac-container').forEach(el => el.remove());
            this.notificationService.success(new Notification('Datacenter updated successfully'));
            this.onCrud.emit({ type: CRUDActionTypes.UPDATE });
            this.spinnerService.stop('main');
          }, (err: HttpErrorResponse) => {
            this.handleError(err.error);
            this.datacenterForm.addControl('searchlocation', new FormControl(this.datacenterForm.get('location').value, Validators.required));
          });
      }
    }
  }

  deleteDatacenter(dcId: string) {
    this.dcId = dcId;
    this.confirmModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.confirmModalRef.hide();
    this.spinnerService.start('main');
    this.crudService.delete(this.dcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinnerService.stop('main');
      this.onCrud.emit({ type: CRUDActionTypes.DELETE });
      this.dcId = null;
      this.notificationService.success(new Notification('Datacenter deleted succesfully'));
    }, err => {
      this.dcId = null;
      this.spinnerService.stop('main');
      this.notificationService.error(new Notification('Error while deleting Datacenter'));
    });
  }

  onModalClose() {
    this.createModalRef.hide();
    document.querySelectorAll('.pac-container').forEach(el => el.remove());
  }
}
