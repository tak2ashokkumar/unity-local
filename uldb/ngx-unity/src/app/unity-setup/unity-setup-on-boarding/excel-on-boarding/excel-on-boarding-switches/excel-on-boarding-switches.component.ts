import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { from, Subject } from 'rxjs';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { DatacenterFast } from 'src/app/shared/SharedEntityTypes/datacenter.type';
import { DeviceCRUDPrivateCloudFast } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { SwitchCRUDManufacturer, SwitchCRUDModel } from 'src/app/united-cloud/shared/entities/switch-crud.type';
import { ExcelOnBoardingNextPrevService } from '../excel-on-boarding-next-prev/excel-on-boarding-next-prev.service';
import { ExcelOnBoardingSwitchesService, ExcelOnBoardingSwitchViewdata } from './excel-on-boarding-switches.service';
import { DeviceDiscoveryAgentConfigurationType } from '../../advanced-discovery-connectivity/agent-config.type';

@Component({
  selector: 'excel-on-boarding-switches',
  templateUrl: './excel-on-boarding-switches.component.html',
  styleUrls: ['./excel-on-boarding-switches.component.scss'],
  providers: [ExcelOnBoardingSwitchesService]
})
export class ExcelOnBoardingSwitchesComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  viewData: ExcelOnBoardingSwitchViewdata[] = [];
  manufacturers: Array<SwitchCRUDManufacturer> = [];
  datacenters: Array<DatacenterFast> = [];
  cabinets: { [key: string]: CabinetFast[] } = {};
  privateclouds: { [key: string]: DeviceCRUDPrivateCloudFast[] } = {};
  collectors: DeviceDiscoveryAgentConfigurationType[] = [];

  models: { [key: string]: SwitchCRUDModel[] } = {};
  fileIds: string[] = [];

  cloudSettings: IMultiSelectSettings = {
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

  constructor(private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private nxtPrvSvc: ExcelOnBoardingNextPrevService,
    private storage: StorageService,
    private xlSvc: ExcelOnBoardingSwitchesService) {
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
    this.getSwitches();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getSwitches() {
    this.xlSvc.getSwitches(this.fileIds).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
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
    this.datacenters = [];
    this.xlSvc.getDropdownData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.manufacturers = res[0];
      this.datacenters = res[1];
      this.collectors = res[2];
      this.viewData.forEach(data => {
        this.manufacturers.forEach(m => {
          if (m.name == data.data.manufacturer) {
            data.selectedManufacturerId = `${m.id}`;
            data.form.get('manufacturer').setValue(m.id);
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
      this.notification.error(new Notification('Failed to firewalls Data. Tryagain later.'))
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

  getModels(data: ExcelOnBoardingSwitchViewdata) {
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

  getCabinets(data: ExcelOnBoardingSwitchViewdata) {
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
          let clouds = [];
          for (let i = 0; i < data.clouds.length; i++) {
            if (data.clouds[i].name == data.data.cloud) {
              clouds.push(data.clouds[i]);
              data.form.patchValue({ cloud: clouds });
              break;
            }
          }
        });
      }, err => {
        console.log(err)
      });
  }

  getPrivateClouds(data: ExcelOnBoardingSwitchViewdata) {
    let selectedDcId = data.form.get('datacenter.uuid').value;
    data.clouds = [];
    if (this.privateclouds[selectedDcId]) {
      data.clouds = this.privateclouds[selectedDcId];
      data.form.patchValue({ cloud: [] });
      return;
    }
    this.xlSvc.getPrivateClouds(selectedDcId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.privateclouds[selectedDcId] = res.get(res.keys().next().value);
      data.clouds = this.privateclouds[selectedDcId];
      data.form.patchValue({ cloud: [] });
    });
  }


  formSubscriptions() {
    this.viewData.forEach(data => {
      data.form.get('manufacturer').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        data.selectedManufacturerId = val;
        this.getModels(data);
      });
      data.form.get('datacenter.uuid').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        this.getCabinets(data);
        this.getPrivateClouds(data);
      });
      data.form.get('cabinet.id').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        data.form.get('position').setValue('');
        if (val) {
          data.form.get('position').enable();
        } else {
          data.form.get('position').disable();
        }
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
        this.getSwitches();
        this.notification.success(new Notification('Switches onboarded successfully.'));
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    }
  }

}
