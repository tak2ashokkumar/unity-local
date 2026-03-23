import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceCRUDPrivateCloudFast, PrivateClouds } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { StorageCRUDManufacturer, StorageDeviceCRUDOperatingSystem } from 'src/app/united-cloud/shared/entities/storage-device-crud.type';
import { AdvancedDiscoveryStorageService, DevDisStorageViewdata, DeviceDiscoveryStorageFormData } from './advanced-discovery-storage.service';

@Component({
  selector: 'advanced-discovery-storage',
  templateUrl: './advanced-discovery-storage.component.html',
  styleUrls: ['./advanced-discovery-storage.component.scss'],
  providers: [AdvancedDiscoveryStorageService]
})
export class AdvancedDiscoveryStorageComponent implements OnInit, OnDestroy {
  @ViewChildren('fold') folds: QueryList<ElementRef>;
  private ngUnsubscribe = new Subject();
  viewData: DevDisStorageViewdata[] = [];
  manufacturers: Array<StorageCRUDManufacturer> = [];
  operatingSystems: Array<StorageDeviceCRUDOperatingSystem> = [];

  datacenters: Array<DatacenterFast> = [];
  cabinets: { [key: string]: CabinetFast[] } = {};
  privateclouds: { [key: string]: DeviceCRUDPrivateCloudFast[] } = {};

  constructor(private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private deviceDiscoveryService: AdvancedDiscoveryStorageService) { }

  ngOnInit() {
    this.getStorageDevices();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getStorageDevices() {
    this.deviceDiscoveryService.getStorageDevices().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.deviceDiscoveryService.convertToViewData(res.results);
      this.getDropDownData();
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to load Storage Devices. Try again later.'));
    });
  }

  getDropDownData() {
    this.deviceDiscoveryService.getDropdownData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.manufacturers = res[0];
      this.operatingSystems = res[1];
      this.datacenters = res[2];
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
      this.formSubscriptions();
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to load Server Data. Tryagain later.'))
    })
  }

  getModels(data: DevDisStorageViewdata, manufacturer: string) {
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
    });
  }

  getCabinets(data: DevDisStorageViewdata) {
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

  getPrivateClouds(data: DevDisStorageViewdata) {
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

  openRow(obj: DevDisStorageViewdata) {
    this.viewData.map(data => {
      if (data != obj) {
        data.isOpen = false;
      }
    });
    obj.isOpen = !obj.isOpen;
  }

  open(obj: DevDisStorageViewdata) {
    if (!obj.openEnabled) {
      return;
    }
    if (obj.models) {
      this.openRow(obj);
    } else {
      let m: StorageCRUDManufacturer = null;
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
              this.viewData[i].formErrors = this.deviceDiscoveryService.resetStorageDeviceFormErrors();
              this.viewData[i].isOpen = false;
              continue;
            }
            this.viewData[i].isOpen = true;
            this.viewData[i].formErrors = this.deviceDiscoveryService.resetStorageDeviceFormErrors();
            if (errors.non_field_errors) {
              this.viewData[i].nonFieldErr = errors.non_field_errors[0];
            } else if (errors) {
              for (const field in errors) {
                if (field in this.viewData[i].form.controls) {
                  this.viewData[i].formErrors[field] = errors[field][0];
                }
              }
            } else {
              this.notification.error(new Notification('Something went wrong!! Please try again.'));
            }
            break;
          }
        }
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
      if (data.openEnabled && data.form.invalid) {
        data.formErrors = this.utilService.validateForm(data.form, data.validationMessages, data.formErrors);
        data.isOpen = true;
        data.form.valueChanges
          .subscribe((e: any) => { data.formErrors = this.utilService.validateForm(data.form, data.validationMessages, data.formErrors); });
        return;
      } else {
        count++;
      }
    });
    if (count == changedForms.length) {
      let arr = [];
      changedForms.filter(view => view.openEnabled).forEach(view => arr.push(<DeviceDiscoveryStorageFormData>view.form.getRawValue()));
      this.spinner.start('main');
      this.deviceDiscoveryService.saveAll(arr).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.spinner.stop('main');
        changedForms.forEach(v => {
          v.isOpen = false;
          v.openEnabled = false;
        });
        this.notification.success(new Notification('Storages onboarded successfully.'));
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
        // this.notification.error(new Notification('Failed to save Storages. Tryagain later.'));
      });
    }
  }

}
