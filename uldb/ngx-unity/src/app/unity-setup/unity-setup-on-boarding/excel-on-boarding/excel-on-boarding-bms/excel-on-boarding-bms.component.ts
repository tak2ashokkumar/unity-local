import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { IpVersion, RxwebValidators } from '@rxweb/reactive-form-validators';
import { from, Subject } from 'rxjs';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, BMServerSidePlatformMapping, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { BMServerCRUDManufacturer, BMServerCRUDModel, BMServerCRUDOperatingSystem } from 'src/app/united-cloud/shared/entities/bm-server-crud.type';
import { ExcelOnBoardingNextPrevService } from '../excel-on-boarding-next-prev/excel-on-boarding-next-prev.service';
import { ExcelOnBoardingBmsService, ExcelOnBoardingBmsViewdata } from './excel-on-boarding-bms.service';
import { DeviceDiscoveryAgentConfigurationType } from '../../advanced-discovery-connectivity/agent-config.type';

@Component({
  selector: 'excel-on-boarding-bms',
  templateUrl: './excel-on-boarding-bms.component.html',
  styleUrls: ['./excel-on-boarding-bms.component.scss'],
  providers: [ExcelOnBoardingBmsService]
})
export class ExcelOnBoardingBmsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  viewData: ExcelOnBoardingBmsViewdata[] = [];
  manufacturers: Array<BMServerCRUDManufacturer> = [];
  operatingSystems: Array<BMServerCRUDOperatingSystem> = [];
  models: { [key: string]: BMServerCRUDModel[] } = {};
  datacenters: Array<DatacenterFast> = [];
  cabinets: { [key: string]: CabinetFast[] } = {};
  privateclouds: { [key: string]: DeviceCRUDPrivateCloudFast[] } = {};
  BMPlatFormMappingEnum = BMServerSidePlatformMapping;
  fileIds: string[] = [];
  collectors: DeviceDiscoveryAgentConfigurationType[] = [];

  constructor(private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private nxtPrvSvc: ExcelOnBoardingNextPrevService,
    private storage: StorageService,
    private xlSvc: ExcelOnBoardingBmsService) {
    this.nxtPrvSvc.excelSaveCurrentAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.saveToTemp();
    });
  }

  ngOnInit(): void {
    this.fileIds = <string[]>this.storage.getByKey('fileId', StorageType.SESSIONSTORAGE);
    if (!this.fileIds || !this.fileIds.length) {
      this.notification.error(new Notification('Please select atleast 1 file from the uploaded files'));
      return;
    }
    this.spinner.start('main');
    this.getBMS();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getBMS() {
    this.xlSvc.getBms(this.fileIds).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.viewData = this.xlSvc.converToViewdata(data);
      this.getDropDownData();
      this.spinner.stop('main');
    }, err => {
      this.notification.error(new Notification('Error while fetching devices list'));
      this.spinner.stop('main');
    });
  }

  getDropDownData() {
    this.manufacturers = [];
    this.operatingSystems = [];
    this.datacenters = [];
    this.xlSvc.getDropdownData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.manufacturers = res[0];
      this.operatingSystems = res[1];
      this.datacenters = res[2];
      this.collectors = res[3];
      this.viewData.forEach(data => {
        this.manufacturers.forEach(m => {
          if (m.name == data.data.manufacturer) {
            data.selectedManufacturerId = `${m.id}`;
            data.form.patchValue({ manufacturer: { id: m.id } });
          }
        });

        this.operatingSystems.forEach(os => {
          if (os.full_name == data.data.os) {
            data.form.patchValue({ os: { id: os.id } });
          }
        });

        this.datacenters.forEach(dc => {
          if (dc.name == data.data.datacenter) {
            data.form.patchValue({ datacenter: { uuid: dc.uuid } });
          }
        });

        this.collectors.forEach(collector => {
          if(collector.ip_address == data.data.collector){
            data.form.patchValue({ collector: { uuid: collector.uuid } });
          }
        });

      });
      this.getModelsForManufacturersInXL();
      let arr = this.viewData.map(item => item.form.get('datacenter.uuid').value)
        .filter((value, index, self) => value && self.indexOf(value) == index);
      this.getCabinetsForDCInXL(arr);
      this.getCloudsForDCInXL(arr);
      this.formSubscriptions();
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to load Server Data. Tryagain later.'))
    })
  }

  getModelsForManufacturersInXL() {
    let arr = this.viewData.map(item => item.selectedManufacturerId)
      .filter((value, index, self) => value && self.indexOf(value) == index);
    from(arr)
      .pipe(
        mergeMap((e) => this.xlSvc.getModels(e)),
        takeUntil(this.ngUnsubscribe)
      ).subscribe(res => {
        const key = res.keys().next().value;
        this.models[key] = res.get(key);
        this.viewData.filter(data => data.selectedManufacturerId == key).forEach(data => {
          data.models = this.models[key];
          data.models.forEach(m => {
            if (m.name == data.data.model) {
              data.form.patchValue({ model: { id: m.id } });
            }
          });
        });
      }, err => {
        console.log(err)
      });
  }

  getModels(data: ExcelOnBoardingBmsViewdata) {
    data.models = [];
    if (this.models[data.selectedManufacturerId]) {
      data.models = this.models[data.selectedManufacturerId];
      data.form.patchValue({ model: { id: '' } });
      return;
    }
    this.xlSvc.getModels(data.selectedManufacturerId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.models[data.selectedManufacturerId] = res.get(res.keys().next().value);
      data.models = this.models[data.selectedManufacturerId];
      data.form.patchValue({ model: { id: '' } });
    });
  }

  getCabinetsForDCInXL(arr: string[]) {
    from(arr)
      .pipe(
        mergeMap((e) => this.xlSvc.getCabinets(e)),
        takeUntil(this.ngUnsubscribe)
      ).subscribe(res => {
        const key = res.keys().next().value;
        this.cabinets[key] = res.get(key);
        this.viewData.filter(data => data.form.get('datacenter.uuid').value == key).forEach(data => {
          data.cabinets = this.cabinets[key];
          data.cabinets.forEach(c => {
            if (c.name == data.data.cabinet) {
              data.form.patchValue({ cabinet: { id: c.id } }, { emitEvent: false });
            }
          });
        });
      }, err => {
        console.log(err)
      });
  }

  getCabinets(data: ExcelOnBoardingBmsViewdata) {
    let selectedDcId = data.form.get('datacenter.uuid').value;
    data.cabinets = [];
    if (this.cabinets[selectedDcId]) {
      data.cabinets = this.cabinets[selectedDcId];
      data.form.patchValue({ cabinet: { id: '' } });
      return;
    }
    this.xlSvc.getCabinets(selectedDcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.cabinets[selectedDcId] = res.get(res.keys().next().value);
      data.cabinets = this.cabinets[selectedDcId];
      data.form.patchValue({ cabinet: { id: '' } });
    });
  }

  getCloudsForDCInXL(arr: string[]) {
    from(arr)
      .pipe(
        mergeMap((e) => this.xlSvc.getPrivateClouds(e)),
        takeUntil(this.ngUnsubscribe)
      ).subscribe(res => {
        const key = res.keys().next().value;
        this.privateclouds[key] = res.get(key);
        this.viewData.filter(data => data.form.get('datacenter.uuid').value == key).forEach(data => {
          data.clouds = this.privateclouds[key];
          for (let i = 0; i < data.clouds.length; i++) {
            if (data.clouds[i].name == data.data.private_cloud) {
              data.form.patchValue({ private_cloud: { id: data.clouds[i].id } });
              break;
            }
          }
        });
      }, err => {
        console.log(err)
      });
  }

  getPrivateClouds(data: ExcelOnBoardingBmsViewdata) {
    let selectedDcId = data.form.get('datacenter.uuid').value;
    data.clouds = [];
    if (this.privateclouds[selectedDcId]) {
      data.clouds = this.privateclouds[selectedDcId];
      data.form.patchValue({ private_cloud: { id: '' } });
      return;
    }
    this.xlSvc.getPrivateClouds(selectedDcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.privateclouds[selectedDcId] = res.get(res.keys().next().value);
      data.clouds = this.privateclouds[selectedDcId];
      data.form.patchValue({ private_cloud: { id: '' } });
    });
  }

  formSubscriptions() {
    this.viewData.forEach(view => {
      view.form.get('manufacturer.id').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        view.selectedManufacturerId = val;
        this.getModels(view);
      });

      if (view.form.get('bmc_type').value == BMServerSidePlatformMapping.DRAC) {
        view.form.get('version').addValidators([Validators.required, NoWhitespaceValidator]);
        if (!view.onboarded) {
          view.form.get('version').enable();
        }
      }

      view.form.get('datacenter.uuid').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        this.getCabinets(view);
        this.getPrivateClouds(view);
      });

      view.form.get('cabinet.id').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        view.form.get('position').setValue('');
        if (val) {
          view.form.get('position').enable();
        } else {
          view.form.get('position').disable();
        }
      });

      view.form.get('bmc_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        if (val == BMServerSidePlatformMapping.None) {
          view.form.get('ip').removeValidators([Validators.required, NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]);
          view.form.get('username').removeValidators([Validators.required, NoWhitespaceValidator]);
          view.form.get('password').removeValidators([Validators.required, NoWhitespaceValidator]);
          view.form.get('proxy_url').removeValidators([Validators.required, NoWhitespaceValidator]);
        } else {
          view.form.get('ip').addValidators([Validators.required, NoWhitespaceValidator, RxwebValidators.ip({ version: IpVersion.AnyOne })]);
          view.form.get('username').addValidators([Validators.required, NoWhitespaceValidator]);
          view.form.get('password').addValidators([Validators.required, NoWhitespaceValidator]);
          view.form.get('proxy_url').addValidators([Validators.required, NoWhitespaceValidator]);
        }

        if (val == BMServerSidePlatformMapping.DRAC) {
          view.form.get('version').addValidators([Validators.required, NoWhitespaceValidator]);
          view.form.get('version').enable();
        } else {
          view.form.get('version').disable();
          view.form.get('version').removeValidators([Validators.required, NoWhitespaceValidator]);
        }

        view.form.get('ip').updateValueAndValidity();
        view.form.get('proxy_url').updateValueAndValidity();
        view.form.get('username').updateValueAndValidity();
        view.form.get('password').updateValueAndValidity();
        view.form.get('version').setValue('');
      });
    });
  }

  saveToTemp() {
    let arr = [];
    this.viewData.filter(view => !view.onboarded).forEach(view => {
      arr.push(view.form.getRawValue());
    });
    this.spinner.start('main');
    this.xlSvc.saveToTemp(arr).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.spinner.stop('main');
      this.viewData.forEach(v => {
        v.onboarded = false;
      });
      this.nxtPrvSvc.continueNextPrev();
    }, (err: HttpErrorResponse) => {
      this.handleError(err.error);
    });
  }

  handleError(errorRes: any) {
    for (const key in errorRes) {
      if (errorRes.hasOwnProperty(key)) {
        const errors = errorRes[key];
        for (let i = 0; i < this.viewData.length; i++) {
          if (this.viewData[i].uniqueId == key) {
            if (errorRes[key]['onboarding_status'] == 'Onboarded') {
              this.viewData[i].resetFormErrors();
              continue;
            }
            this.viewData[i].resetFormErrors();
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
      if (!data.onboarded && data.form.invalid) {
        data.formErrors = this.utilService.validateForm(data.form, data.validationMessages, data.formErrors);
        data.form.valueChanges.subscribe((e: any) => {
          data.formErrors = this.utilService.validateForm(data.form, data.validationMessages, data.formErrors);
        });
        return;
      } else {
        count++;
      }
    });
    if (count == changedForms.length) {
      let arr = [];
      changedForms.filter(view => !view.onboarded).forEach(view => {
        arr.push(view.form.getRawValue());
      });
      this.spinner.start('main');
      this.xlSvc.saveAll(arr).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.spinner.stop('main');
        this.getBMS();
        this.notification.success(new Notification('Servers onboarded successfully.'));
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    }
  }


}