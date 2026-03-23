import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { Subject } from 'rxjs';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormGroup } from '@angular/forms';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { DatacenterBillCrudService, CabinetRentalModels } from './datacenter-bill-crud.service';
import { takeUntil } from 'rxjs/operators';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { DCBillPDUPowerCircuit, DCBillDatacenter } from './datacenter-bill-crud.type';
import { DateTimeAdapter, OWL_DATE_TIME_FORMATS, OWL_DATE_TIME_LOCALE, MomentDateTimeAdapter } from '@busacca/ng-pick-datetime';
import { CostAnalysisDCList } from '../datacenter-cost-summary/datacenter-cost-summary.type';

export const MY_NATIVE_FORMATS = {
  parseInput: 'LL LT',
  fullPickerInput: 'MMM DD, YYYY',
  datePickerInput: 'LL',
  timePickerInput: 'LT',
  monthYearLabel: 'MMM YYYY',
  dateA11yLabel: 'LL',
  monthYearA11yLabel: 'MMMM YYYY',
}

@Component({
  selector: 'datacenter-bill-crud',
  templateUrl: './datacenter-bill-crud.component.html',
  styleUrls: ['./datacenter-bill-crud.component.scss'],
  providers: [
    { provide: DateTimeAdapter, useClass: MomentDateTimeAdapter, deps: [OWL_DATE_TIME_LOCALE] },
    { provide: OWL_DATE_TIME_FORMATS, useValue: MY_NATIVE_FORMATS }]
})
export class DatacenterBillCrudComponent implements OnInit, OnDestroy {
  @Output('onCrud') onCrud = new EventEmitter();

  private ngUnsubscribe = new Subject();
  billId: string;
  nonFieldErr: string = '';
  action: 'Add' | 'Edit';

  @ViewChild('billFormRef') billFormRef: ElementRef;
  billForm: FormGroup;
  billFormErrors: any;
  billFormValidationMessages: any;
  billModelRef: BsModalRef;
  datacenters: Array<CostAnalysisDCList> = [];
  powerCircuits: Array<DCBillPDUPowerCircuit> = [];
  cabinetRentalModels = CabinetRentalModels;

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmBillDeleteModalRef: BsModalRef;

  dcSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    selectAsObject: true
  };

  // Text configuration
  myTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'item selected',
    checkedPlural: 'items selected',
    searchPlaceholder: 'Find',
    defaultTitle: 'Select',
    allSelected: 'All Selected',
  };

  constructor(private crudService: DatacenterBillCrudService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private spinnerService: AppSpinnerService,
    private notification: AppNotificationService) {
    this.crudService.addOrEditAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(billId => {
      this.billId = billId;
      this.action = this.billId ? 'Edit' : 'Add';
      this.nonFieldErr = '';
      this.billModelRef = null;
      this.getDatacenters();
    });
    this.crudService.deleteAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(billId => {
      this.billId = billId;
      this.confirmBillDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    });
  }

  ngOnInit() {
    this.getPowerCircuits();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getDatacenters() {
    this.crudService.getDatacenters().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (!this.billId) {
        res = res.filter(dc => !dc.bill)
      }
      this.datacenters = res;
      this.buildAddEditForm(this.billId);
    });
  }

  getPowerCircuits() {
    this.crudService.getPowerCircuits().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.powerCircuits = res;
    });
  }

  buildAddEditForm(billId?: string) {
    this.crudService.createDCBillForm(billId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
      this.billForm = form;
      this.billFormErrors = this.crudService.resetBillFormErrors();
      this.billFormValidationMessages = this.crudService.billFormValidationMessages;
      if (billId) {
        let dcs = (<DCBillDatacenter[]>this.billForm.get('datacenters').value).map(dc => dc.uuid)
        this.billForm.get('datacenters').setValue(this.datacenters.filter(dc => dcs.includes(dc.dc_uuid)));
      }
      this.billModelRef = this.modalService.show(this.billFormRef, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
    });
  }

  handleError(err: any) {
    this.billFormErrors = this.crudService.resetBillFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.billForm.controls) {
          this.billFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.billModelRef.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinnerService.stop('main');
  }

  confirmBillCreate() {
    if (this.billForm.invalid) {
      this.billFormErrors = this.utilService.validateForm(this.billForm, this.billFormValidationMessages, this.billFormErrors);
      this.billForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.billFormErrors = this.utilService.validateForm(this.billForm, this.billFormValidationMessages, this.billFormErrors); });
    } else {
      this.spinnerService.start('main');
      if (this.billId) {
        this.crudService.updateBill(this.billForm.getRawValue(), this.billId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.billModelRef.hide();
          this.spinnerService.stop('main');
          this.notification.success(new Notification('Bill updated successfully.'));
          this.onCrud.emit();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.crudService.createBill(this.billForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.billModelRef.hide();
          this.spinnerService.stop('main');
          this.notification.success(new Notification('Bill Created successfully.'));
          this.onCrud.emit();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  confirmBillDelete() {
    this.crudService.deleteBill(this.billId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.confirmBillDeleteModalRef.hide();
      this.notification.success(new Notification('Bill deleted successfully.'));
      this.onCrud.emit();
    }, err => {
      this.confirmBillDeleteModalRef.hide();
      this.notification.error(new Notification('Bill could not be deleted!!'));
    });
  }

}
