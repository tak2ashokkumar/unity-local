import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
// import { NagiosInstanceViewData } from '../usi-event-ingestion-nagios.service';
import { UsiEventIngestionNagiosCrudService } from './usi-event-ingestion-nagios-crud.service';

@Component({
  selector: 'usi-event-ingestion-nagios-crud',
  templateUrl: './usi-event-ingestion-nagios-crud.component.html',
  styleUrls: ['./usi-event-ingestion-nagios-crud.component.scss'],
})
export class UsiEventIngestionNagiosCrudComponent implements OnInit, OnDestroy {

  // @Output('onCrud') onCrud = new EventEmitter<CRUDActionTypes>();

  // @ViewChild('create') create: ElementRef;
  // modalRef: BsModalRef;
  // @ViewChild('confirm') confirm: ElementRef;

  // private ngUnsubscribe = new Subject();
  // action: 'Add' | 'Edit';
  // form: FormGroup;
  // formErrors: any;
  // validationMessages: any;
  // nonFieldErr: string = '';
  // instance: NagiosInstanceViewData;
  // instanceId: string;

  constructor(private crudService: UsiEventIngestionNagiosCrudService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService) {
    // this.crudService.addOrEditAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((uuid: string) => {
    //   if (uuid) {
    //     this.action = 'Edit';
    //     this.edit(uuid);
    //   } else {
    //     this.action = 'Add';
    //     this.add();
    //   }
    // });
    // this.crudService.deleteAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(uuid => {
    //   this.delete(uuid);
    // });
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    // this.ngUnsubscribe.next();
    // this.ngUnsubscribe.complete();
  }

  // add() {
  //   this.action = 'Add';
  //   this.buildForm(null);
  // }

  // edit(uuid: string) {
  //   this.action = 'Edit';
  //   this.instanceId = uuid;
  //   this.buildForm(uuid);
  // }

  // buildForm(uuid: string) {
  //   this.nonFieldErr = '';
  //   this.crudService.buildForm(uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
  //     this.form = form;
  //     this.formErrors = this.crudService.resetFormErrors();
  //     this.validationMessages = this.crudService.validationMessages;
  //     this.modalRef = this.modalService.show(this.create, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  //   });
  // }

  // handleError(err: any) {
  //   this.formErrors = this.crudService.resetFormErrors();
  //   if (err.non_field_errors) {
  //     this.nonFieldErr = err.non_field_errors[0];
  //   } else if (err) {
  //     for (const field in err) {
  //       if (field in this.form.controls) {
  //         this.formErrors[field] = err[field][0];
  //       }
  //     }
  //   } else {
  //     this.modalRef.hide();
  //     this.notification.error(new Notification('Something went wrong!! Please try again.'));
  //   }
  //   this.spinner.stop('main');
  // }

  // onSubmit() {
  //   if (this.form.invalid) {
  //     this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors);
  //     this.form.valueChanges
  //       .subscribe((data: any) => { this.formErrors = this.utilService.validateForm(this.form, this.validationMessages, this.formErrors); });
  //     return;
  //   } else {
  //     this.spinner.start('main');
  //     if (this.action == 'Edit') {
  //       this.crudService.updateInstance(this.form.getRawValue(), this.instanceId).pipe(takeUntil(this.ngUnsubscribe))
  //         .subscribe(res => {
  //           this.modalRef.hide();
  //           this.notification.success(new Notification('Nagios Instance updated successfully'));
  //           this.onCrud.emit(CRUDActionTypes.UPDATE)
  //           this.spinner.stop('main');
  //         }, (err: HttpErrorResponse) => {
  //           this.handleError(err.error);
  //         });
  //     } else {
  //       this.crudService.addInstance(this.form.getRawValue()).pipe(takeUntil(this.ngUnsubscribe))
  //         .subscribe(res => {
  //           this.modalRef.hide();
  //           this.notification.success(new Notification('Nagios Instance added successfully'));
  //           this.onCrud.emit(CRUDActionTypes.ADD)
  //           this.spinner.stop('main');
  //         }, (err: HttpErrorResponse) => {
  //           this.handleError(err.error);
  //         });
  //     }
  //   }
  // }

  // delete(uuid: string) {
  //   this.instanceId = uuid;
  //   this.modalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  // }

  // confirmDelete() {
  //   this.modalRef.hide();
  //   this.crudService.deleteInstance(this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
  //     this.notification.success(new Notification('Instance deleted successfully.'));
  //     this.onCrud.emit(CRUDActionTypes.DELETE)
  //   }, err => {
  //     this.notification.error(new Notification('Failed to delete Instance!! Please try again.'));
  //   });
  // }

}
