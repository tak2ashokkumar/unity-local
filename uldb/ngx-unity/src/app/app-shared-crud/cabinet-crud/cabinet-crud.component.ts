import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CRUDActionTypes, AppUtilityService } from '../../shared/app-utility/app-utility.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormGroup } from '@angular/forms';
import { CabinetViewData } from 'src/app/united-cloud/datacenter/datacenter-cabinets/datacenter-cabinets.service';
import { CabinetCrudService } from './cabinet-crud.service';
import { AppNotificationService } from '../../shared/app-notification/app-notification.service';
import { AppSpinnerService } from '../../shared/app-spinner/app-spinner.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from '../../shared/app-notification/notification.type';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DataCenter } from 'src/app/united-cloud/datacenter/tabs';
import { DataCenterCabinet } from 'src/app/united-cloud/shared/entities/datacenter-cabinet.type';
import { AppLevelService } from 'src/app/app-level.service';

@Component({
  selector: 'cabinet-crud',
  templateUrl: './cabinet-crud.component.html',
  styleUrls: ['./cabinet-crud.component.scss']
})
export class CabinetCrudComponent implements OnInit, OnDestroy {
  @Output('onCrud') onCrud = new EventEmitter<{ type: CRUDActionTypes }>();
  @ViewChild('confirm') confirm: ElementRef;
  @ViewChild('create') create: ElementRef;
  actionMessage: 'Add' | 'Edit';
  modalRef: BsModalRef;
  confirmModalRef: BsModalRef;
  cabinetForm: FormGroup;
  formErrors: any;
  validationMessages: any;
  cabinetId: string;
  nonFieldErr: string = '';
  showSelectDC: boolean;
  private ngUnsubscribe = new Subject();
  dataCenters: DataCenter[] = [];
  tagsAutocompleteItems: string[] = [];

  constructor(private crudSvc: CabinetCrudService,
    private utilService: AppUtilityService,
    private modalService: BsModalService,
    private spinnerService: AppSpinnerService,
    private notificationService: AppNotificationService,
    private appService: AppLevelService) {
    this.crudSvc.addOrEditAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(param => {
      this.actionMessage = param.cabinet ? 'Edit' : 'Add';
      this.cabinetId = param.cabinet ? param.cabinet.uuid : '';
      this.nonFieldErr = '';
      this.modalRef = null;
      this.showSelectDC = param.dcId ? false : true;
      this.buildForm(param.cabinet, param.dcId, param.isBillingCrud);
      if (this.showSelectDC) {
        let dcId = param.cabinet && param.cabinet.colocloud_set.length ? param.cabinet.colocloud_set[0].uuid : '';
        this.cabinetForm.get('datacenter').setValue(dcId);
        this.getDataCenters();
      } else {
        this.getTags();
      }
    });
    this.crudSvc.deleteAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(cabinetId => {
      this.cabinetId = cabinetId;
      this.confirmModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  buildForm(cabinet: DataCenterCabinet, dcId: string, isBillingCRUD: boolean) {
    this.nonFieldErr = '';
    this.cabinetForm = this.crudSvc.buildForm(cabinet, dcId, isBillingCRUD);
    this.formErrors = this.crudSvc.resetFormErrors();
    this.validationMessages = this.crudSvc.validationMessages;
  }

  getDataCenters() {
    this.crudSvc.getDataCenters().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.dataCenters = res;
      this.getTags();
    });
  }

  getTags() {
    this.appService.getTags().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tagsAutocompleteItems = res;
      this.modalRef = this.modalService.show(this.create, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
    });
  }

  handleError(err: any) {
    this.formErrors = this.crudSvc.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.cabinetForm.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    } else {
      this.modalRef.hide();
      this.notificationService.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinnerService.stop('main');
  }

  onSubmit() {
    if (this.cabinetForm.invalid) {
      this.formErrors = this.utilService.validateForm(this.cabinetForm, this.validationMessages, this.formErrors);
      this.cabinetForm.valueChanges
        .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.cabinetForm, this.validationMessages, this.formErrors); });
      return;
    } else {
      this.spinnerService.start('main');
      const dcId = this.cabinetForm.get('datacenter').value;
      let obj = Object.assign({}, { colocloud_set: [{ uuid: dcId }] }, this.cabinetForm.getRawValue());
      if (this.actionMessage === 'Add') {
        this.crudSvc.addCabinet(obj).pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(res => {
            this.modalRef.hide();
            this.notificationService.success(new Notification('Cabinet added successfully'));
            this.onCrud.emit({ type: CRUDActionTypes.ADD });
            this.spinnerService.stop('main');
          }, (err: HttpErrorResponse) => {
            this.handleError(err.error);
          });
      } else {
        this.crudSvc.updateCabinet(this.cabinetId, obj).pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(res => {
            this.modalRef.hide();
            this.notificationService.success(new Notification('Cabinet Updated successfully'));
            this.spinnerService.stop('main');
            this.onCrud.emit({ type: CRUDActionTypes.UPDATE });
          }, (err: HttpErrorResponse) => {
            this.handleError(err.error);
          });
      }
    }
  }

  confirmDelete() {
    this.confirmModalRef.hide();
    this.spinnerService.start('main');
    this.crudSvc.delete(this.cabinetId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinnerService.stop('main');
      this.onCrud.emit({ type: CRUDActionTypes.DELETE });
      this.notificationService.success(new Notification('Cabinet deleted succesfully'));
    }, err => {
      this.spinnerService.stop('main');
      this.notificationService.error(new Notification('Error while deleting cabinet'));
    });
  }

}
