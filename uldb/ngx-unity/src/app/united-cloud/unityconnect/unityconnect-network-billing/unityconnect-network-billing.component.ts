import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { UnityconnectNetworkBillingService, UNITY_NETWORK_CONNECTION_BILL_UNITS, UNITY_NETWORK_CONNECTION_BILL_CHOICES, UnitedConnectNetworkBillViewData } from './unityconnect-network-billing.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { IMultiSelectSettings } from 'src/app/shared/multiselect-dropdown/types';
import { UnitedConnectNetworkBillMappedPorts } from './unityconnect-network-billing.type';

@Component({
  selector: 'unityconnect-network-billing',
  templateUrl: './unityconnect-network-billing.component.html',
  styleUrls: ['./unityconnect-network-billing.component.scss'],
  providers: [UnityconnectNetworkBillingService]
})
export class UnityconnectNetworkBillingComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  @ViewChildren('fold') folds: QueryList<ElementRef>;

  viewData: UnitedConnectNetworkBillViewData[] = [];
  selectedView: UnitedConnectNetworkBillViewData = new UnitedConnectNetworkBillViewData();
  billChoices: Array<{ name: string, key: string }> = UNITY_NETWORK_CONNECTION_BILL_CHOICES;
  billUnits: string[] = UNITY_NETWORK_CONNECTION_BILL_UNITS;

  @ViewChild('billFormRef') billFormRef: ElementRef;
  billForm: FormGroup;
  billFormErrors: any;
  billFormValidationMessages: any;
  billFormModalRef: BsModalRef;
  mappedPorts: UnitedConnectNetworkBillMappedPorts[] = [];

  action: string;
  nonFieldErr: string;

  @ViewChild('confirmDeleteRef') confirmDeleteRef: ElementRef;
  confirmDeleteModalRef: BsModalRef;

  portSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "mapped_name",
    keyToSelect: "uuid",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };

  constructor(private billingService: UnityconnectNetworkBillingService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private modalService: BsModalService,
    private utilService: AppUtilityService, ) { }

  ngOnInit() {
    setTimeout(() => {
      this.spinner.start('main');
      this.getBillingDetails();
      this.getMappedPorts();
    }, 0)
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.spinner.start('main');
    this.getBillingDetails();
    this.getMappedPorts();
  }

  getBillingDetails() {
    this.billingService.getBillingDetails().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.billingService.convertToViewData(res);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
    })
  }

  getMappedPorts() {
    this.billingService.getMappedPorts().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.mappedPorts = res;
    }, (err: HttpErrorResponse) => {
    })
  }

  addOrEditBill(view?: UnitedConnectNetworkBillViewData) {
    if (view) {
      this.selectedView = view;
      this.action = 'Edit';
    } else {
      this.selectedView = null;
      this.action = 'Add';
    }

    this.billForm = this.billingService.buildBillForm(view);
    this.billFormErrors = this.billingService.resetBillFormErrors();
    this.billFormValidationMessages = this.billingService.billFormValidataionMessages;

    // if (view) {
    //   let seletedPorts = [];
    //   view.mappedPorts.map(mp => {
    //     seletedPorts.push(this.mappedPorts.find(p => p.uuid == mp.uuid).uuid);
    //   })
    //   this.billForm.get('mapped_ports').setValue(seletedPorts);
    // }
    this.billFormModalRef = this.modalService.show(this.billFormRef, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmAddOrEditBill() {
    if (this.billForm.invalid) {
      this.billFormErrors = this.utilService.validateForm(this.billForm, this.billFormValidationMessages, this.billFormErrors);
      this.billForm.valueChanges
        .subscribe((data: any) => { this.billFormErrors = this.utilService.validateForm(this.billForm, this.billFormValidationMessages, this.billFormErrors); })
    } else {
      this.spinner.start('main');
      if (this.selectedView) {
        this.billingService.updateBill(this.selectedView.billId, this.billForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.getBillingDetails();
          this.billFormModalRef.hide();
          this.spinner.stop('main');
          this.notification.success(new Notification('Bill updated successfully'));
        }, (err: HttpErrorResponse) => {
          this.billFormModalRef.hide();
          this.spinner.stop('main');
          this.notification.error(new Notification('Failed to update bill. Please tryagain later.'));
        })
      } else {
        this.billingService.addBill(this.billForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.getBillingDetails();
          this.billFormModalRef.hide();
          this.spinner.stop('main');
          this.notification.success(new Notification('Bill added successfully'));
        }, (err: HttpErrorResponse) => {
          this.billFormModalRef.hide();
          this.spinner.stop('main');
          this.notification.error(new Notification('Failed to add Bill. Please tryagain later.'));
        })
      }
    }
  }

  deleteBill(view: UnitedConnectNetworkBillViewData) {
    this.selectedView = view;
    this.confirmDeleteModalRef = this.modalService.show(this.confirmDeleteRef, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.spinner.start('main');
    this.billingService.deleteBill(this.selectedView.billId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getBillingDetails();
      this.confirmDeleteModalRef.hide();
      this.spinner.stop('main');
      this.notification.success(new Notification('Bill deleted successfully'));
    }, (err: HttpErrorResponse) => {
      this.confirmDeleteModalRef.hide();
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to delete bill. Please tryagain later.'));
    })
  }

  openRow(view: UnitedConnectNetworkBillViewData) {
    this.viewData.map(data => {
      if (data != view) {
        data.isOpen = false;
      }
    });
    view.isOpen = !view.isOpen;
    // this.billingService.getBill(view.billId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
    //   this.spinner.stop('main');
    // }, (err: HttpErrorResponse) => {
    //   this.spinner.stop('main');
    //   this.notification.error(new Notification('Failed to get bill details. Please tryagain later.'));
    // })
  }

}
