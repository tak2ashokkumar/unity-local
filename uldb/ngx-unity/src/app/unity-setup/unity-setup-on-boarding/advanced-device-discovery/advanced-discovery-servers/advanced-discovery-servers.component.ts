import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { merge as _merge } from 'lodash-es';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, BMServerSidePlatformMapping } from 'src/app/shared/app-utility/app-utility.service';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { BMServerCRUDManufacturer, BMServerCRUDOperatingSystem, BMServerCRUDPrivateCloudFast } from 'src/app/united-cloud/shared/entities/bm-server-crud.type';
import { AdvancedDiscoveryServersService, DevDisServerViewdata } from './advanced-discovery-servers.service';

@Component({
  selector: 'advanced-discovery-servers',
  templateUrl: './advanced-discovery-servers.component.html',
  styleUrls: ['./advanced-discovery-servers.component.scss'],
  providers: [AdvancedDiscoveryServersService]
})
export class AdvancedDiscoveryServersComponent implements OnInit, OnDestroy {
  @ViewChildren('fold') folds: QueryList<ElementRef>;
  private ngUnsubscribe = new Subject();
  viewData: DevDisServerViewdata[] = [];
  manufacturers: Array<BMServerCRUDManufacturer> = [];
  operatingSystems: Array<BMServerCRUDOperatingSystem> = [];
  BMPlatFormMappingEnum = BMServerSidePlatformMapping;

  datacenters: Array<DatacenterFast> = [];
  cabinets: { [key: string]: CabinetFast[] } = {};
  privateclouds: { [key: string]: DeviceCRUDPrivateCloudFast[] } = {};

  constructor(private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private deviceDiscoveryService: AdvancedDiscoveryServersService) { }

  ngOnInit() {
    this.spinner.start('main');
    this.getServers();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getServers() {
    this.deviceDiscoveryService.getServers().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.deviceDiscoveryService.convertToViewData(res.results);
      this.getDropDownData();
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to load Servers. Tryagain later.'));
    });
  }

  getDropDownData() {
    this.deviceDiscoveryService.getDropdownData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.manufacturers = res[0];
      this.operatingSystems = res[1];
      this.viewData.forEach(data => {
        this.manufacturers.forEach(m => {
          if (m.name == data.manufacturer) {
            data.form.patchValue({ manufacturer: { id: m.id } });
          }
        });
        this.operatingSystems.forEach(os => {
          if (os.name == data.os) {
            data.form.patchValue({ os: { id: os.id } });
          }
        });
      });
      this.datacenters = res[2];
      this.formSubscriptions();
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to load Server Data. Tryagain later.'))
    })
  }

  resetOtherForm(data: DevDisServerViewdata) {
    data.otherForm = null;
    data.otherFormErrors = null;
  }

  createOtherForm(data: DevDisServerViewdata, val: string) {
    this.resetOtherForm(data);
    switch (val) {
      case BMServerSidePlatformMapping.IPMI:
        data.otherForm = this.deviceDiscoveryService.createIPMIForm();
        data.otherFormErrors = this.deviceDiscoveryService.resetIPMIFormErrors();
        data.otherFormValidationMessages = this.deviceDiscoveryService.IPMIFormMessages;
        break;
      case BMServerSidePlatformMapping.DRAC:
        data.otherForm = this.deviceDiscoveryService.createDARCForm();
        data.otherFormErrors = this.deviceDiscoveryService.resetDRACFormErrors();
        data.otherFormValidationMessages = this.deviceDiscoveryService.DRACFormMessages;
        break;
      case BMServerSidePlatformMapping.None:
        data.otherForm = null;
        data.otherFormErrors = null;
        data.otherFormValidationMessages = null;
      default:
        break;
    }
  }

  getModels(data: DevDisServerViewdata, manufacturer: string) {
    this.deviceDiscoveryService.getModels(manufacturer).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      data.models = res;
      data.form.patchValue({ model: { id: '' } });
    });
  }

  formSubscriptions() {
    this.viewData.forEach(data => {
      data.form.get('name').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        data.hostname = val;
      });
      data.form.get('manufacturer.id').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        data.manufacturer = this.manufacturers.find(m => m.id == Number(val)).name;
        this.getModels(data, val);
      });
      data.form.get('model.id').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        if (!val) {
          data.model = '';
          return;
        }
        data.model = data.models.find(m => m.id == Number(val)).name;
      });
      data.form.get('os.id').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        data.os = this.operatingSystems.find(os => os.id == Number(val)).name;
      });
      data.form.get('datacenter.uuid').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        this.getCabinets(data);
        this.getPrivateClouds(data);
      });
      data.form.get('cabinet.id').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        if (val) {
          data.cabinet = data.cabinets.find(m => m.id == Number(val)).name;
        }
        data.form.get('position').setValue('');
        if (val) {
          data.form.get('position').enable();
        } else {
          data.form.get('position').disable();
        }
      });
      data.form.get('bmc_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        data.bmcType = val;
        this.createOtherForm(data, val);
      });
    });
  }

  getCabinets(data: DevDisServerViewdata) {
    let selectedDcId = data.form.get('datacenter.uuid').value;
    data.cabinets = [];
    if (this.cabinets[selectedDcId]) {
      data.cabinets = this.cabinets[selectedDcId];
      data.form.patchValue({ cabinet: { id: '' } });
      return;
    }
    this.deviceDiscoveryService.getCabinets(selectedDcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.cabinets[selectedDcId] = res;
      data.cabinets = this.cabinets[selectedDcId];
      data.form.patchValue({ cabinet: { id: '' } });
    });
  }

  getPrivateClouds(data: DevDisServerViewdata) {
    let selectedDcId = data.form.get('datacenter.uuid').value;
    data.clouds = [];
    if (this.privateclouds[selectedDcId]) {
      data.clouds = this.privateclouds[selectedDcId];
      data.form.patchValue({ private_cloud: { id: '' } });
      return;
    }
    this.deviceDiscoveryService.getPrivateClouds(selectedDcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.privateclouds[selectedDcId] = res;
      data.clouds = this.privateclouds[selectedDcId];
      data.form.patchValue({ private_cloud: { id: '' } });
    });
  }

  openRow(obj: DevDisServerViewdata) {
    this.viewData.map(data => {
      if (data != obj) {
        data.isOpen = false;
      }
    });
    obj.isOpen = !obj.isOpen;
  }

  open(obj: DevDisServerViewdata) {
    if (!obj.openEnabled) {
      return;
    }
    if (obj.models) {
      this.openRow(obj);
    } else {
      let m: BMServerCRUDManufacturer = null;
      if (obj.manufacturer && obj.manufacturer != 'NA') {
        for (let i = 0; i < this.manufacturers.length; i++) {
          if (this.manufacturers[i].name == obj.manufacturer) {
            m = this.manufacturers[i];
            break;
          }
        }
      }
      if (m) {
        this.deviceDiscoveryService.getModels(`${m.id}`).pipe(take(1)).subscribe(res => {
          obj.models = res;
          for (let i = 0; i < obj.models.length; i++) {
            const model = obj.models[i];
            if (model.name == obj.model) {
              obj.form.patchValue({ model: { id: model.id } });
              break;
            }
          }
          this.openRow(obj);
        }, err => { });
      } else {
        this.openRow(obj);
      }
    }
  }

  handleError(errorRes: any) {
    for (const key in errorRes) {
      if (errorRes.hasOwnProperty(key)) {
        const errors = errorRes[key];
        for (let i = 0; i < this.viewData.length; i++) {
          if (this.viewData[i].uniqueId == key) {
            if (errorRes[key]['saved']) {
              this.viewData[i].openEnabled = false;
              this.viewData[i].formErrors = this.deviceDiscoveryService.resetBMSFormErrors();
              this.viewData[i].isOpen = false;
              continue;
            }
            this.viewData[i].isOpen = true;
            this.viewData[i].formErrors = this.deviceDiscoveryService.resetBMSFormErrors();
            if (this.viewData[i].bmcType == BMServerSidePlatformMapping.IPMI) {
              this.viewData[i].otherFormErrors = this.deviceDiscoveryService.resetIPMIFormErrors();
            } else {
              this.viewData[i].otherFormErrors = this.deviceDiscoveryService.resetDRACFormErrors();
            }
            if (errors.non_field_errors) {
              this.viewData[i].nonFieldErr = errors.non_field_errors[0];
            } else if (errors) {
              for (const field in errors) {
                if (field in this.viewData[i].form.controls) {
                  this.viewData[i].formErrors[field] = errors[field][0];
                } else if (field in this.viewData[i].otherForm) {
                  this.viewData[i].otherFormErrors[field] = errors[field][0];
                }
              }
            } else {
              this.notification.error(new Notification('Something went wrong!! Please try again.'));
            }
            break;
          }
        }
      } else {
        this.notification.error(new Notification('Something went wrong!! Please try again.'));
      }
    }
    this.spinner.stop('main');
  }

  submit() {
    let changedForms = this.viewData.filter(data => {
      return data.form.touched && data.form.dirty;
    });
    if (changedForms.length == 0) {
      this.notification.error(new Notification('No records have been modified. Please make changes to the records to proceed.'));
      return;
    }
    let count = 0;
    changedForms.forEach(data => {
      if (data.openEnabled && (data.form.invalid || (data.otherForm && data.otherForm.invalid))) {
        if (data.form.invalid) {
          data.formErrors = this.utilService.validateForm(data.form, data.validationMessages, data.formErrors);
          data.isOpen = true;
          data.form.valueChanges
            .subscribe((e: any) => { data.formErrors = this.utilService.validateForm(data.form, data.validationMessages, data.formErrors); });
        }
        if (data.otherForm && data.otherForm.invalid) {
          data.otherFormErrors = this.utilService.validateForm(data.otherForm, data.otherFormValidationMessages, data.otherFormErrors);
          data.otherForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((val: any) => {
              data.otherFormErrors = this.utilService.validateForm(data.otherForm, data.otherFormValidationMessages, data.otherFormErrors);
            });
        }
        return;
      } else {
        count++;
      }
    });
    if (count == changedForms.length) {
      let arr = [];
      changedForms.filter(view => view.openEnabled).forEach(view => {
        if (view.otherForm) {
          arr.push(_merge({}, view.form.getRawValue(), view.otherForm.getRawValue()));
        } else {
          arr.push(view.form.getRawValue());
        }
      });
      this.spinner.start('main');
      this.deviceDiscoveryService.saveAll(arr).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.spinner.stop('main');
        changedForms.forEach(v => {
          v.isOpen = false;
          v.openEnabled = false;
        });
        this.notification.success(new Notification('Servers onboarded successfully.'));
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
        // this.notification.error(new Notification('Failed to save Storages. Tryagain later.'));
      });
    }
  }

}
