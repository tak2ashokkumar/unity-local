import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AppNotificationService } from '../../shared/app-notification/app-notification.service';
import { Notification } from '../../shared/app-notification/notification.type';
import { AppSpinnerService } from '../../shared/app-spinner/app-spinner.service';
import { AppUtilityService, CRUDActionTypes, PDUTypes } from '../../shared/app-utility/app-utility.service';
import { PDUCrudFormData, PduCrudService } from './pdu-crud.service';
import { PDUCRUDCabinet, PDUCRUDManufacturer, PDUCRUDModel, PDUCRUDPowerCircuit } from './pdu-crud.type';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';

@Component({
  selector: 'pdu-crud',
  templateUrl: './pdu-crud.component.html',
  styleUrls: ['./pdu-crud.component.scss']
})
export class PduCrudComponent implements OnInit, OnDestroy {
  @Output('onCrud') onCrud = new EventEmitter<CRUDActionTypes>();

  private ngUnsubscribe = new Subject();
  dcId: string;
  dcPduId: string;
  nonFieldErr: string = '';
  action: 'Add' | 'Edit';
  monitoringEnabled: boolean = false;

  @ViewChild('pduFormRef') pduFormRef: ElementRef;
  pduModelRef: BsModalRef;
  pduForm: FormGroup;
  pduFormErrors: any;
  pduFormValidationMessages: any;

  manufacturers: Array<PDUCRUDManufacturer> = [];
  models: Array<PDUCRUDModel> = [];
  cabinets: Array<PDUCRUDCabinet> = [];
  powercircuits: Array<PDUCRUDPowerCircuit> = [];
  tagsAutocompleteItems: string[] = [];
  collectors: DeviceDiscoveryAgentConfigurationType[] = [];
  // backUpdata: { snmp_community: string, ip_address: string } = { snmp_community: '', ip_address: '' };

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmPduDeleteModalRef: BsModalRef;
  isBillingCrud: boolean = false;


  constructor(private crudService: PduCrudService,
    private modalService: BsModalService,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private spinnerService: AppSpinnerService,
    private notification: AppNotificationService,
    private appService: AppLevelService) {
    this.crudService.addOrEditAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(param => {
      this.dcPduId = param.pduId;
      this.dcId = param.dcId;
      this.action = this.dcPduId ? 'Edit' : 'Add';
      this.nonFieldErr = '';
      this.pduModelRef = null;
      this.isBillingCrud = param.isBillingCrud;
      this.getCabinets();
      this.getTags();
      this.buildAddEditForm(param.pduId, param.isBillingCrud);
    });
    this.crudService.deleteAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(dcPduId => {
      this.dcPduId = dcPduId;
      this.confirmPduDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    });
  }

  ngOnInit() {
    this.getManufacturers();
    this.getPowerCircuits();
    this.getCollectors();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getManufacturers() {
    this.manufacturers = [];
    this.crudService.getManufacturers().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.manufacturers = res;
    });
  }

  getModels(manufacturer: string, patchValue: boolean) {
    if (!manufacturer || manufacturer == '') {
      this.pduForm.patchValue({ model: { id: '' } });
      return;
    }
    this.crudService.getModels(manufacturer).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.models = res;
      if (patchValue) {
        this.pduForm.patchValue({ model: { id: '' } });
      }
    });
  }

  getCabinets() {
    this.crudService.getCabinets(this.dcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.cabinets = res;
    });
  }

  getCollectors() {
    this.crudService.getCollectors().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.collectors = res;
    });
  }

  getPowerCircuits() {
    this.crudService.getPowerCircuits().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.powercircuits = res;
    });
  }

  getTags() {
    this.appService.getTags().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tagsAutocompleteItems = res;
    });
  }

  // monitoringFormCheck() {
  //   if (!this.monitoringEnabled) {
  //     this.pduForm.addControl('snmp_community', new FormControl(this.backUpdata.snmp_community, [NoWhitespaceValidator, Validators.required]));
  //     this.pduForm.addControl('ip_address', new FormControl(this.backUpdata.ip_address, [NoWhitespaceValidator]));
  //   } else {
  //     this.backUpdata.snmp_community = this.pduForm.controls.snmp_community ? this.pduForm.controls.snmp_community.value : '';
  //     this.backUpdata.ip_address = this.pduForm.controls.ip_address ? this.pduForm.controls.ip_address.value : '';
  //     this.pduForm.removeControl('snmp_community');
  //     this.pduForm.removeControl('ip_address');
  //   }
  //   this.monitoringEnabled = !this.monitoringEnabled;
  // }

  buildAddEditForm(pduId: string, isBillingCRUD: boolean) {
    this.crudService.createPDUForm(pduId, isBillingCRUD).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
      this.pduForm = form;
      this.monitoringEnabled = this.pduForm.controls.snmp_community ? true : false;
      this.pduFormErrors = this.crudService.resetPduFormErrors();
      this.pduFormValidationMessages = this.crudService.pduValidationMessages;
      if (pduId) {
        this.getModels(this.pduForm.get('manufacturer.id').value, false);
      }
      this.pduModelRef = this.modalService.show(this.pduFormRef, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
      this.pduForm.get('manufacturer.id').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        this.getModels(val, true);
      });
      this.pduForm.get('pdu_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        if (val == PDUTypes.HORIZONTAL) {
          this.pduForm.get('size').enable();
        }
        else {
          this.pduForm.get('size').disable();
          this.pduForm.get('size').setValue(1);
        }
      });
      this.pduForm.get('cabinet.id').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        this.pduForm.get('position').setValue('');
        if (val) {
          this.pduForm.get('position').enable();
        } else {
          this.pduForm.get('position').disable();
        }
      });
      this.pduForm.get('position').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        if (val) {
          this.pduForm.get('position').setValue(val.toUpperCase(), { emitEvent: false });
        }
      });
    });
  }

  handleError(err: any) {
    this.pduFormErrors = this.crudService.resetPduFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.pduForm.controls) {
          this.pduFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.pduModelRef.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinnerService.stop('main');
  }

  confirmPDUCreate() {
    if (this.pduForm.invalid) {
      this.pduFormErrors = this.utilService.validateForm(this.pduForm, this.pduFormValidationMessages, this.pduFormErrors);
      this.pduForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.pduFormErrors = this.utilService.validateForm(this.pduForm, this.pduFormValidationMessages, this.pduFormErrors); });
    } else {
      this.spinnerService.start('main');
      if (this.dcPduId) {
        this.crudService.updatePdu(<PDUCrudFormData>this.pduForm.getRawValue(), this.dcPduId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.pduModelRef.hide();
          this.spinnerService.stop('main');
          this.notification.success(new Notification('PDU updated successfully.'));
          this.onCrud.emit(CRUDActionTypes.UPDATE);
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.crudService.createPdu(<PDUCrudFormData>this.pduForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.pduModelRef.hide();
          this.spinnerService.stop('main');
          this.notification.success(new Notification('PDU Created successfully.'));
          this.onCrud.emit(CRUDActionTypes.ADD);
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  confirmPDUDelete() {
    this.crudService.deletePdu(this.dcPduId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.confirmPduDeleteModalRef.hide();
      this.notification.success(new Notification('PDU deleted successfully.'));
      this.onCrud.emit(CRUDActionTypes.DELETE);
    }, err => {
      this.confirmPduDeleteModalRef.hide();
      this.notification.error(new Notification('PDU could not be deleted!!'));
    });
  }

}
