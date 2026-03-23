import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { merge as _merge, isString } from 'lodash-es';
import { BsModalRef, BsModalService, ModalDirective } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, PlatFormMapping, ServerSidePlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { DeviceDiscoveryAgentConfigurationType } from 'src/app/unity-setup/unity-setup-on-boarding/advanced-discovery-connectivity/agent-config.type';
import { DataCenter } from '../../united-cloud/datacenter/tabs';
import { PcCrudService } from './pc-crud.service';
import { Base, Openstack, OpenstackRaw, Proxmox, VMware, VMwareRaw, Vcloud, VcloudRaw } from './pc-crud.type';
import { PrivateCloudType } from '../SharedEntityTypes/private-cloud.type';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

@Component({
  selector: 'pc-crud',
  templateUrl: './pc-crud.component.html',
  styleUrls: ['./pc-crud.component.scss']
})
export class PcCrudComponent implements OnInit, OnDestroy {

  @Input('isAddorEditEnabled') isAddorEditEnabled: boolean;
  @Output('onCrud') onCrud = new EventEmitter<{ platform_type: string, uuid: string }>();
  @Output('modalClosed') modalClosed = new EventEmitter<string>();
  @ViewChild('confirm') confirm: ElementRef;
  confirmModalRef: BsModalRef;
  // @ViewChild('template') elementView: ElementRef;
  // modalRef: BsModalRef;
  private ngUnsubscribe = new Subject();
  pcId: string;
  dcId: string;
  action: 'Add' | 'Edit';
  nonFieldErr: string = '';
  id: number;
  PlatFormMappingEnum = ServerSidePlatFormMapping;
  @ViewChild('passwordChange') passwordChange: ElementRef;
  passwordChangeRef: BsModalRef;
  passwordForm: FormGroup;
  passwordFormErrors: any;
  passwordValidationMessages: any;
  platFormType: string;
  baseForm: FormGroup;
  baseFormErrors: any;
  baseValidationMessages: any;
  vmWareForm: FormGroup;
  vmWareFormErrors: any;
  vmWareValidationMessages: any;
  openStackForm: FormGroup;
  openStackFormErrors: any;
  openStackValidationMessages: any;
  vCloudForm: FormGroup;
  vCloudFormErrors: any;
  vCloudValidationMessages: any;
  proxmoxForm: FormGroup;
  proxmoxFormErrors: any;
  proxmoxValidationMessages: any;
  dataCenters: DataCenter[] = [];
  collectors: DeviceDiscoveryAgentConfigurationType[] = [];
  integrateType: string = null;
  vCenterFlag: boolean = false;

  constructor(private crudServie: PcCrudService,
    private modalService: BsModalService,
    private spinnerService: AppSpinnerService,
    private utilService: AppUtilityService,
    private notificationService: AppNotificationService,
    private route: ActivatedRoute,
    private router: Router) {

    // for edit
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.pcId = params.get('pcId') ? params.get('pcId') : null;
      this.dcId = params.get('dcId') ? params.get('dcId') : null;
      const pcType = params.get('pcType') ? params.get('pcType') : null;
      if (pcType) {
        this.integrateType = this.crudServie.getPlarformType(pcType);
      }
    });

    this.isAddorEditEnabled = (this.router.url.includes('add') || this.router.url.includes('edit')) ? true : false;

    // this.crudServie.addOrEditAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(param => {
    //   this.pcId = param.pcId;
    //   this.dcId = param.dcId;
    //   this.action = this.pcId ? 'Edit' : 'Add';
    //   this.nonFieldErr = '';
    //   // this.modalRef = null;
    //   this.integrateType = null;
    //   this.spinnerService.start('main');
    //   this.buildBaseForm();
    // });

    // this.crudServie.integrateAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(integrateType => {
    //   this.integrateType = integrateType;
    //   this.pcId = null;
    //   this.dcId = null;
    //   this.action = this.pcId ? 'Edit' : 'Add';
    //   this.nonFieldErr = '';
    //   // this.modalRef = null;
    //   this.spinnerService.start('main');
    //   this.buildBaseForm();
    // });

    this.crudServie.deleteAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(pcId => {
      this.pcId = pcId;
      this.confirmModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    });

    this.crudServie.changePasswordAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(obj => {
      this.pcId = obj.uuid;
      this.platFormType = obj.platformType;
      this.buildPasswordChange(obj.id);
    });

    this.crudServie.vCenterDeleteAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(pcId => {
      this.pcId = pcId;
      this.vCenterFlag = true;
      this.confirmModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    });

  }

  ngOnInit() {
    this.loadDatacenters();
    this.getCollectors();
    if (this.isAddorEditEnabled) {
      this.action = this.pcId ? 'Edit' : 'Add';
      this.nonFieldErr = '';
      this.spinnerService.start('main');
      this.buildBaseForm();
    }
  }
  /**
   * To enusure to close subscription on form submit
   */
  cleanUp() {
    this.spinnerService.stop('main');
    this.vCenterFlag = false;
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
  ngOnDestroy() {
    this.cleanUp();
  }

  loadDatacenters() {
    this.crudServie.loadDatacenters().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.dataCenters = res;
      this.setDataCenterValue();
    }, err => { });
  }

  getCollectors() {
    this.crudServie.getCollectors().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.collectors = res;
    });
  }

  // openModal() {
  //   this.modalRef = this.modalService.show(this.elementView, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  //   this.spinnerService.stop('main');
  //   this.modalService.onHide.subscribe(res => {
  //     this.modalClosed.emit();
  //   })
  // }

  handler(type: string, $event: ModalDirective) {
    console.log(type, $event)
  }

  createOtherForm(data: string) {
    this.resetOtherForm();
    switch (data) {
      case ServerSidePlatFormMapping.VMWARE:
      case ServerSidePlatFormMapping.UNITED_PRIVATE_CLOUD_VCENTER:
        this.crudServie.createVMWareForm(this.pcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
          this.vmWareForm = form;
        });
        this.vmWareFormErrors = this.crudServie.resetvMFormFormErrors();
        this.vmWareValidationMessages = this.crudServie.validationMessages.vMFormMessages;
        break;
      case ServerSidePlatFormMapping.VCLOUD:
        this.crudServie.createvCloudForm(this.pcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
          this.vCloudForm = form;
        });
        this.vCloudFormErrors = this.crudServie.resetVCloudFormErrors();
        this.vCloudValidationMessages = this.crudServie.validationMessages.vCloudFormMessages;
        break;
      case ServerSidePlatFormMapping.OPENSTACK:
        this.crudServie.createOpenStackForm(this.pcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
          this.openStackForm = form;
        });
        this.openStackFormErrors = this.crudServie.resetOpenStackFormErrors();
        this.openStackValidationMessages = this.crudServie.validationMessages.openStackFormMessages;
        break;
      case ServerSidePlatFormMapping.PROXMOX:
      case ServerSidePlatFormMapping.G3_KVM:
      case ServerSidePlatFormMapping.HYPER_V:
        this.crudServie.createProxmoxForm(data, this.pcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
          this.proxmoxForm = form;
        });
        this.proxmoxFormErrors = this.crudServie.resetProxmoxFormErrors();
        this.proxmoxValidationMessages = this.crudServie.validationMessages.proxmoxFormMessages;
        break;
      case ServerSidePlatFormMapping.ESXI:
        if (!this.pcId) {
          this.baseForm = this.crudServie.addCollectorGroup(this.baseForm)
        }
        break;
      case ServerSidePlatFormMapping.CUSTOM:
        //Add logic if need in future
        break;
      default:
        break;
    }
    // if (!this.modalRef) {
    //   this.openModal();
    // }
    this.spinnerService.stop('main');
  }

  buildBaseForm() {
    this.baseFormErrors = this.crudServie.resetBaseFormErrors();
    this.baseValidationMessages = this.crudServie.validationMessages.baseFormMessages;
    this.crudServie.createBaseForm(this.pcId, this.dcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
      this.baseForm = form;
      if (this.integrateType) {
        this.baseForm.get('platform_type').setValue(this.integrateType);
        this.baseForm.get('platform_type').disable();
      }
      this.createOtherForm(this.baseForm.get('platform_type').value);
      if (this.dcId || this.pcId) {
        this.setDataCenterValue();
      }
      this.baseForm.get('platform_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: string) => {
        this.createOtherForm(data);
      });
    });
  }

  setDataCenterValue() {
    //Angular selects selected value on if option and set value refer to same memory location
    this.dataCenters.map(dc => {
      if (dc.uuid == this.baseForm?.get('colocation_cloud')?.value.uuid) {
        this.baseForm.get('colocation_cloud').setValue(dc);
      }
    });
  }

  resetOtherForm() {
    this.vmWareForm = null;
    this.vCloudForm = null;
    this.openStackForm = null;
    this.proxmoxForm = null;
    this.vmWareFormErrors = null;
    this.vCloudFormErrors = null;
    this.openStackFormErrors = null;
    this.proxmoxFormErrors = null;
  }

  handleError(data: Base | VMware | Vcloud | Openstack | Proxmox, err: any) {
    this.baseFormErrors = this.crudServie.resetBaseFormErrors();
    this.vmWareFormErrors = this.crudServie.resetvMFormFormErrors();
    this.vCloudFormErrors = this.crudServie.resetVCloudFormErrors();
    this.openStackFormErrors = this.crudServie.resetOpenStackFormErrors();
    this.proxmoxFormErrors = this.crudServie.resetProxmoxFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      if (isString(err)) {
        this.nonFieldErr = err;
      } else {
        for (const field in err) {
          if (field in this.baseFormErrors) {
            this.baseFormErrors[field] = err[field][0];
          } else {
            switch (data.platform_type) {
              case ServerSidePlatFormMapping.VMWARE:
              case ServerSidePlatFormMapping.UNITED_PRIVATE_CLOUD_VCENTER:
                this.vmWareFormErrors[field] = err[field][0];
                break;
              case ServerSidePlatFormMapping.VCLOUD: this.vCloudFormErrors[field] = err[field][0];
                break;
              case ServerSidePlatFormMapping.OPENSTACK: this.openStackFormErrors[field] = err[field][0];
                break;
              case ServerSidePlatFormMapping.PROXMOX:
              case ServerSidePlatFormMapping.G3_KVM:
              case ServerSidePlatFormMapping.HYPER_V:
                this.proxmoxFormErrors[field] = err[field][0];
                break;
              case ServerSidePlatFormMapping.CUSTOM:
              case ServerSidePlatFormMapping.ESXI:
                break;
            }
          }
        }
      }
    } else {
      // this.modalRef.hide();
      this.notificationService.error(new Notification('Something went wrong!! Please try again.'));
    }
  }

  submitFormData(data: Base | VMware | Vcloud | Openstack | Proxmox) {
    this.nonFieldErr = '';
    this.spinnerService.start('main');
    if (this.pcId) {
      this.crudServie.updatePrivateCloud(this.pcId, data).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: PrivateCloudType) => {
          // this.modalRef.hide();
          this.spinnerService.stop('main');
          this.notificationService.success(new Notification('Private Cloud updated successfully'));
          // // this.onCrud.emit(this.pcId);
          // this.onCrud.emit({ platform_type: null, uuid: this.pcId });
          if (this.router.url.includes('integration')) {
            this.gotToCloudcontrollers()
          }
          else {
            this.goBack();
          }
        }, (err: HttpErrorResponse) => {
          this.spinnerService.stop('main');
          this.handleError(data, err.error);
        });
    } else {
      this.crudServie.addPrivateCloud(data).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: PrivateCloudType) => {
          // this.modalRef.hide();
          this.notificationService.success(new Notification('Private Cloud added successfully. Asset sync is in progress.'));
          this.syncPrivateCloudVMS(data.uuid, this.utilService.getCloudTypeByPlatformType(data.platform_type));
          this.spinnerService.stop('main');
          // // this.onCrud.emit(data.uuid);
          // this.onCrud.emit({ platform_type: data.platform_type, uuid: data.uuid });
          if (this.router.url.includes('integration')) {
            this.gotToCloudcontrollers()
          }
          else {
            this.goBack();
          }
        }, (err: HttpErrorResponse) => {
          this.spinnerService.stop('main');
          this.handleError(data, err.error);
        });
    }
  }

  syncPrivateCloudVMS(uuid: string, platformType: PlatFormMapping) {
    if (platformType != PlatFormMapping.CUSTOM) {
      this.crudServie.syncPrivateCLoudVM(uuid, platformType).pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(data => {
          this.crudServie.updateVMCount(data.result.data);
        }, (err: HttpErrorResponse) => {
          this.notificationService.error(new Notification('Asset sync failed.'));
        });
    }
  }

  validateVMwareForm() {
    if (this.vmWareForm.invalid) {
      this.vmWareFormErrors = this.utilService.validateForm(this.vmWareForm, this.vmWareValidationMessages, this.vmWareFormErrors);
      this.vmWareForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.vmWareFormErrors = this.utilService.validateForm(this.vmWareForm, this.vmWareValidationMessages, this.vmWareFormErrors); });
    }
    if (this.baseForm.valid && this.vmWareForm.valid) {
      this.submitFormData(_merge({}, <Base>this.baseForm.getRawValue(), <VMwareRaw>this.vmWareForm.getRawValue()));
    }
  }

  validateVCloudForm() {
    if (this.vCloudForm.invalid) {
      this.vCloudFormErrors = this.utilService.validateForm(this.vCloudForm, this.vCloudValidationMessages, this.vCloudFormErrors);
      this.vCloudForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.vCloudFormErrors = this.utilService.validateForm(this.vCloudForm, this.vCloudValidationMessages, this.vCloudFormErrors); });
    }
    if (this.baseForm.valid && this.vCloudForm.valid) {
      this.submitFormData(_merge({}, <Base>this.baseForm.getRawValue(), <VcloudRaw>this.vCloudForm.getRawValue()));
    }
  }

  validateOpenstackForm() {
    if (this.openStackForm.invalid) {
      this.openStackFormErrors = this.utilService.validateForm(this.openStackForm, this.openStackValidationMessages, this.openStackFormErrors);
      this.openStackForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.openStackFormErrors = this.utilService.validateForm(this.openStackForm, this.openStackValidationMessages, this.openStackFormErrors); });
    }
    if (this.baseForm.valid && this.openStackForm.valid) {
      this.submitFormData(_merge({}, <Base>this.baseForm.getRawValue(), <OpenstackRaw>this.openStackForm.getRawValue()));
    }
  }

  validateProxmoxForm() {
    if (this.proxmoxForm.invalid) {
      this.proxmoxFormErrors = this.utilService.validateForm(this.proxmoxForm, this.proxmoxValidationMessages, this.proxmoxFormErrors);
      this.proxmoxForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.proxmoxFormErrors = this.utilService.validateForm(this.proxmoxForm, this.proxmoxValidationMessages, this.proxmoxFormErrors); });
    }
    if (this.baseForm.valid && this.proxmoxForm.valid) {
      this.submitFormData(_merge({}, <Base>this.baseForm.getRawValue(), <Proxmox>this.proxmoxForm.getRawValue()));
    }
  }

  validateCustomForm() {
    if (this.baseForm.valid) {
      this.submitFormData(<Base>this.baseForm.getRawValue());
    }
  }

  onSubmit() {
    if (this.baseForm.invalid) {
      this.baseFormErrors = this.utilService.validateForm(this.baseForm, this.baseValidationMessages, this.baseFormErrors);
      this.baseForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.baseFormErrors = this.utilService.validateForm(this.baseForm, this.baseValidationMessages, this.baseFormErrors); });
    }
    switch (this.baseForm.get('platform_type').value) {
      case ServerSidePlatFormMapping.VMWARE:
      case ServerSidePlatFormMapping.UNITED_PRIVATE_CLOUD_VCENTER:
        this.validateVMwareForm();
        break;
      case ServerSidePlatFormMapping.VCLOUD:
        this.validateVCloudForm();
        break;
      case ServerSidePlatFormMapping.OPENSTACK:
        this.validateOpenstackForm();
        break;
      case ServerSidePlatFormMapping.PROXMOX:
      case ServerSidePlatFormMapping.G3_KVM:
      case ServerSidePlatFormMapping.HYPER_V:
        this.validateProxmoxForm();
        break;
      case ServerSidePlatFormMapping.CUSTOM:
      case ServerSidePlatFormMapping.ESXI:
        this.validateCustomForm();
        break;
    }
  }

  confirmDelete() {
    this.spinnerService.start('main');
    // if (this.vCenterFlag) {
    //   this.crudServie.deleteVcenterPrivateCloud(this.pcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
    //     this.spinnerService.stop('main');
    //     this.confirmModalRef.hide();
    //     this.notificationService.success(new Notification('Private Cloud deleted successfully'));
    //     this.onCrud.emit();
    //   }, err => {
    //     this.spinnerService.stop('main');
    //     this.confirmModalRef.hide();
    //     this.notificationService.error(new Notification('Private Cloud could not be deleted!!'));
    //   });
    // } else {
    this.crudServie.deletePrivateCloud(this.pcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinnerService.stop('main');
      this.confirmModalRef.hide();
      this.notificationService.success(new Notification('Private Cloud deleted successfully'));
      this.onCrud.emit();
    }, err => {
      this.spinnerService.stop('main');
      this.confirmModalRef.hide();
      if (this.crudServie.cloudName == 'vcenter' || this.crudServie.cloudName == 'unity-vcenter') {
        this.notificationService.error(new Notification(err.error.detail));
      } else {
        this.notificationService.error(new Notification('Private Cloud could not be deleted!!'));
      }
    });
    // }
  }

  buildPasswordChange(id: string) {
    this.passwordForm = this.crudServie.buildChangePassword(id);
    this.passwordFormErrors = this.crudServie.passwordFormErrors();
    this.passwordValidationMessages = this.crudServie.passwordFormMessages;
    this.passwordChangeRef = this.modalService.show(this.passwordChange, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  updatePassword() {
    if (this.passwordForm.invalid) {
      this.passwordFormErrors = this.utilService.validateForm(this.passwordForm, this.passwordValidationMessages, this.passwordFormErrors);
      this.passwordForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.passwordFormErrors = this.utilService.validateForm(this.passwordForm, this.passwordValidationMessages, this.passwordFormErrors); });
    } else {
      this.crudServie.updatePassword(this.pcId, this.platFormType, this.passwordForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.passwordChangeRef.hide();
        this.notificationService.success(new Notification('Password changed successfully'));
        this.onCrud.emit({ platform_type: null, uuid: this.pcId });
        // this.onCrud.emit(this.pcId);
      }, err => {
        this.passwordChangeRef.hide();
        if (this.platFormType == ServerSidePlatFormMapping.VMWARE || this.platFormType == ServerSidePlatFormMapping.UNITED_PRIVATE_CLOUD_VCENTER) {
          this.notificationService.error(new Notification(err.error.detail));
        } else {
          this.notificationService.error(new Notification('Invalid password. Please try again!!'));
        }
      });
    }
  }

  getCloudNameForEndpoint(platFormType?: string) {
    let cloudNameForEndpoint = '';
    if (platFormType) {
      switch (platFormType.trim().replace(/\s+/g, '').toLowerCase()) {
        case 'vmware':
        case 'vmwarevcenter':
          cloudNameForEndpoint = 'vcenter';
          break;
        case 'unitedprivatecloudvcenter':
          cloudNameForEndpoint = 'unity-vcenter';
          break;
        default: cloudNameForEndpoint = '';
      }
    } else {
      cloudNameForEndpoint = '';
    }
    return cloudNameForEndpoint;
  }

  gotToCloudcontrollers() {
    this.router.navigate(['/unitycloud/devices/cloudcontrollers/']);
  }

  goBack() {
    if (this.router.url.includes("summary")) {
      if (this.action === 'Edit') {
        this.router.navigate(['../../'], { relativeTo: this.route })
      } else {
        this.router.navigate(['../'], { relativeTo: this.route })
      }
    } else if (this.router.url.includes('integration')) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else if (this.router.url.includes('new')) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }
}
