import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { DevicesCrudMonitoringService } from '../../devices-crud-monitoring/devices-crud-monitoring.service';
import { MacMiniCRUDManufacturer, MacMiniCRUDModel, MacMiniCRUDOperatingSystem } from '../../entities/mac-mini-crud.type';
import { MacMiniCRUDFormData, MacMiniCrudService } from './mac-mini-crud.service';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';

@Component({
  selector: 'mac-mini-crud',
  templateUrl: './mac-mini-crud.component.html',
  styleUrls: ['./mac-mini-crud.component.scss']
})
export class MacMiniCrudComponent implements OnInit, OnDestroy {
  @Output('onCrud') onCrud = new EventEmitter<CRUDActionTypes>();

  private ngUnsubscribe = new Subject();
  action: 'Add' | 'Edit';
  nonFieldErr: string = '';
  macMiniId: string;

  @ViewChild('macMiniFormRef') macMiniFormRef: ElementRef;
  macMiniModelRef: BsModalRef;
  macMiniForm: FormGroup;
  macMiniFormErrors: any;
  macMiniFormValidationMessages: any;

  manufacturers: Array<MacMiniCRUDManufacturer> = [];
  models: Array<MacMiniCRUDModel> = [];
  operatingsystems: Array<MacMiniCRUDOperatingSystem> = [];
  datacenters: Array<DatacenterFast> = [];
  cabinets: Array<CabinetFast> = [];
  privateclouds: Array<DeviceCRUDPrivateCloudFast> = [];
  tagsAutocompleteItems: string[] = [];
  collectors: DeviceDiscoveryAgentConfigurationType[] = [];
  @ViewChild('confirmDelete') confirmDelete: ElementRef;
  confirmMacMiniDeleteModalRef: BsModalRef;

  constructor(private crudService: MacMiniCrudService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private spinnerService: AppSpinnerService,
    private notification: AppNotificationService,
    private snmpCrudSvc: DevicesCrudMonitoringService,
    private appService: AppLevelService) {
    this.crudService.addOrEditAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(macMiniId => {
      this.macMiniId = macMiniId;
      this.action = this.macMiniId ? 'Edit' : 'Add';
      this.nonFieldErr = '';
      this.macMiniModelRef = null;
      this.getTags();
      this.buildAddEditForm(macMiniId);
    });
    this.crudService.deleteAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(macMiniId => {
      this.macMiniId = macMiniId;
      this.confirmMacMiniDeleteModalRef = this.modalService.show(this.confirmDelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    })
  }

  ngOnInit() {
    this.getManufacturers();
    this.getOperatingSystems();
    this.getDatacenters();
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
    this.models = [];
    this.crudService.getModels(manufacturer).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.models = res;
      if (patchValue) {
        this.macMiniForm.patchValue({ model: { id: '' } });
      }
    });
  }

  getOperatingSystems() {
    this.operatingsystems = [];
    this.crudService.getOperatingSystems().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.operatingsystems = res;
    });
  }

  getDatacenters() {
    this.datacenters = [];
    this.crudService.getDatacenters().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.datacenters = res;
    });
  }

  getCabinets(dcId: string, patchValue: boolean) {
    if (!dcId) {
      return;
    }
    this.cabinets = [];
    this.crudService.getCabinets(dcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.cabinets = res;
      if (patchValue) {
        this.macMiniForm.patchValue({ cabinet: { id: '' } });
      }
    });
  }

  getPrivateClouds(dcId: string, patchValue: boolean) {
    if (!dcId) {
      return;
    }
    this.privateclouds = [];
    this.crudService.getPrivateClouds(dcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.privateclouds = res;
      if (patchValue) {
        this.macMiniForm.patchValue({ private_cloud: { id: '' } });
      }
    });
  }

  getTags() {
    this.tagsAutocompleteItems = [];
    this.appService.getTags().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tagsAutocompleteItems = res;
    });
  }

  getCollectors() {
    this.crudService.getCollectors().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.collectors = res;
    });
  }

  openModal() {
    this.macMiniModelRef = this.modalService.show(this.macMiniFormRef, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
    this.spinnerService.stop('main');
  }

  buildAddEditForm(macMiniId?: string) {
    this.crudService.createMacMiniForm(macMiniId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
      this.macMiniForm = form;
      this.macMiniFormErrors = this.crudService.resetMacMiniFormErrors();
      this.macMiniFormValidationMessages = this.crudService.validationMessages.macMiniMessages;
      if (macMiniId) {
        this.getModels(this.macMiniForm.get('manufacturer.id').value, false);
        this.getCabinets(this.macMiniForm.get('datacenter.uuid').value, false);
        this.getPrivateClouds(this.macMiniForm.get('datacenter.uuid').value, false);
      }
      this.macMiniForm.get('manufacturer.id').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        this.getModels(val, true);
      });
      this.macMiniForm.get('datacenter.uuid').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        this.getCabinets(val, true);
        this.getPrivateClouds(val, true);
      });
      this.openModal();
    });
  }

  handleError(err: any) {
    this.snmpCrudSvc.handleError(err);
    this.macMiniFormErrors = this.crudService.resetMacMiniFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.macMiniForm.controls) {
          this.macMiniFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.macMiniModelRef.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinnerService.stop('main');
  }

  createMacMini() {
    if (this.macMiniForm.invalid) {
      this.macMiniFormErrors = this.utilService.validateForm(this.macMiniForm, this.macMiniFormValidationMessages, this.macMiniFormErrors);
      this.macMiniForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.macMiniFormErrors = this.utilService.validateForm(this.macMiniForm, this.macMiniFormValidationMessages, this.macMiniFormErrors); });
    } else {
      let obj = <MacMiniCRUDFormData>Object.assign({}, this.macMiniForm.getRawValue());
      this.spinnerService.start('main');
      if (this.macMiniId) {
        this.crudService.updateMacMini(obj, this.macMiniId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.macMiniModelRef.hide();
          this.spinnerService.stop('main');
          this.notification.success(new Notification('Mac Mini updated successfully.'));
          this.onCrud.emit(CRUDActionTypes.UPDATE);
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.crudService.createMacMini(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.macMiniModelRef.hide();
          this.spinnerService.stop('main');
          this.notification.success(new Notification('Mac Mini created successfully.'));
          this.onCrud.emit(CRUDActionTypes.ADD);
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  confirmMacMiniDelete() {
    this.crudService.deleteMacMini(this.macMiniId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.confirmMacMiniDeleteModalRef.hide();
      this.notification.success(new Notification('Mac Mini deleted successfully.'));
      this.onCrud.emit(CRUDActionTypes.DELETE);
    }, err => {
      this.confirmMacMiniDeleteModalRef.hide();
      this.notification.error(new Notification('Mac Mini could not be deleted!! Please try again.'));
    });
  }

}
