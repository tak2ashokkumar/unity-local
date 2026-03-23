import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { VmsMgmtCrudService, VMwareMgmtIPCRUD } from './vms-mgmt-crud.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormGroup } from '@angular/forms';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { AppUtilityService, PlatFormMapping, CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';

@Component({
  selector: 'vms-mgmt-crud',
  templateUrl: './vms-mgmt-crud.component.html',
  styleUrls: ['./vms-mgmt-crud.component.scss']
})
export class VmsMgmtCrudComponent implements OnInit {
  @Output('onCrud') onCrud = new EventEmitter<CRUDActionTypes>();

  private ngUnsubscribe = new Subject();
  nonFieldErr: string = '';

  @ViewChild('ipFormRef') ipFormRef: ElementRef;
  ipModelRef: BsModalRef;
  ipForm: FormGroup;
  ipFormErrors: any;
  ipFormValidationMessages: any;
  input: VMwareMgmtIPCRUD;

  constructor(private crudService: VmsMgmtCrudService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private notification: AppNotificationService,
    private spinnerService: AppSpinnerService) {
    this.crudService.addOrEditAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(input => {
      this.input = input;
      this.nonFieldErr = '';
      this.ipForm = this.crudService.createIpForm(input.mgmtIp === 'N/A' ? '' : input.mgmtIp);
      this.ipFormErrors = this.crudService.resetIpFormErrors();
      this.ipFormValidationMessages = this.crudService.ipValidationMessages;
      this.ipModelRef = this.modalService.show(this.ipFormRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.spinnerService.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  handleError(err: any) {
    this.ipFormErrors = this.crudService.resetIpFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.ipForm.controls) {
          this.ipFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.ipModelRef.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinnerService.stop('main');
  }

  submitIp() {
    if (this.ipForm.invalid) {
      this.ipFormErrors = this.utilService.validateForm(this.ipForm, this.ipFormValidationMessages, this.ipFormErrors);
      this.ipForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.ipFormErrors = this.utilService.validateForm(this.ipForm, this.ipFormValidationMessages, this.ipFormErrors); });
    } else {
      this.spinnerService.start('main');
      this.crudService.updateIp(<{ management_ip: string }>this.ipForm.getRawValue(), this.input).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.ipModelRef.hide();
        this.spinnerService.stop('main');
        this.notification.success(new Notification('Management IP updated successfully.'));
        this.onCrud.emit(CRUDActionTypes.UPDATE);
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    }
  }
}
