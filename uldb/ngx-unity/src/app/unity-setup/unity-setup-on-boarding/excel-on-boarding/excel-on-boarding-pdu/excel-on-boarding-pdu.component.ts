import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, from } from 'rxjs';
import { takeUntil, mergeMap } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService, PDUTypes } from 'src/app/shared/app-utility/app-utility.service';
import { PDUCRUDCabinet, PDUCRUDPowerCircuit, PDUCRUDManufacturer, PDUCRUDModel } from 'src/app/app-shared-crud/pdu-crud/pdu-crud.type';
import { ExcelOnBoardingNextPrevService } from '../excel-on-boarding-next-prev/excel-on-boarding-next-prev.service';
import { ExcelOnBoardingPduService, ExcelOnBoardingPDUViewdata } from './excel-on-boarding-pdu.service';
import { DeviceDiscoveryAgentConfigurationType } from '../../advanced-discovery-connectivity/agent-config.type';

@Component({
  selector: 'excel-on-boarding-pdu',
  templateUrl: './excel-on-boarding-pdu.component.html',
  styleUrls: ['./excel-on-boarding-pdu.component.scss'],
  providers: [ExcelOnBoardingPduService]
})
export class ExcelOnBoardingPduComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  viewData: ExcelOnBoardingPDUViewdata[] = [];
  manufacturers: Array<PDUCRUDManufacturer> = [];
  // models: Array<PDUCRUDModel> = [];
  models: { [key: string]: PDUCRUDModel[] } = {};
  cabinets: Array<PDUCRUDCabinet> = [];
  powercircuits: Array<PDUCRUDPowerCircuit> = [];
  fileIds: string[] = [];
  collectors: DeviceDiscoveryAgentConfigurationType[] = [];

  constructor(private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private nxtPrvSvc: ExcelOnBoardingNextPrevService,
    private storage: StorageService,
    private xlSvc: ExcelOnBoardingPduService) {
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
    this.getPDUs();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getPDUs() {
    this.xlSvc.getPDUs(this.fileIds).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.viewData = this.xlSvc.converToViewdata(data);
      this.getDropDownData();
      this.spinner.stop('main');
    }, err => {
      this.notification.error(new Notification('Error while fetching PDU devices list'));
      this.spinner.stop('main');
    });
  }

  getDropDownData() {
    this.manufacturers = [];
    this.cabinets = [];
    this.powercircuits = [];
    this.xlSvc.getDropdownData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.manufacturers = res[0];
      this.cabinets = res[1];
      this.powercircuits = res[2];
      this.collectors = res[3];
      this.viewData.forEach(data => {
        this.manufacturers.forEach(m => {
          if (m.name == data.data.manufacturer) {
            data.selectedManufacturerId = `${m.id}`;
            data.form.patchValue({ manufacturer: { id: m.id } });
          }
        })
        this.cabinets.forEach(c => {
          if (c.name == data.data.cabinet) {
            data.form.patchValue({ cabinet: { id: c.id } });
          }
        });

        this.powercircuits.forEach(c => {
          if (c.name == data.data.power_circuit) {
            data.form.patchValue({ power_circuit: { id: c.id } });
          }
        });

        this.collectors.forEach(collector => {
          if(collector.ip_address == data.data.collector){
            data.form.patchValue({ collector: { uuid: collector.uuid } });
          }
        });
      });
      this.getModelsForManufacturersInXL();
      this.formSubscriptions();
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to load pdu Data. Tryagain later.'))
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
            if (m.model_number == data.data.model) {
              data.form.patchValue({ model: { id: m.id } });
            }
          });
        });
      }, err => {
        console.log(err)
      });
  }

  getModels(data: ExcelOnBoardingPDUViewdata) {
    if (this.models[data.selectedManufacturerId]) {
      data.models = this.models[data.selectedManufacturerId];
      data.form.patchValue({ model: { id: '' } });
      return;
    }
    this.xlSvc.getModels(data.selectedManufacturerId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      data.models = res.get(res.keys().next().value);
      data.form.patchValue({ model: { id: '' } });
    });
  }

  formSubscriptions() {
    this.viewData.forEach(view => {
      view.form.get('manufacturer.id').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        view.selectedManufacturerId = val;
        this.getModels(view);
      });
      view.form.get('cabinet.id').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        view.form.get('position').setValue('');
        if (val) {
          view.form.get('position').enable();
        } else {
          view.form.get('position').disable();
        }
      });
      view.form.get('position').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        if (val) {
          view.form.get('position').setValue(val.toUpperCase(), { emitEvent: false });
        }
      });
      view.form.get('pdu_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        if (val == PDUTypes.HORIZONTAL) {
          view.form.get('size').enable();
        }
        else {
          view.form.get('size').disable();
          view.form.get('size').setValue(1);
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
        this.getPDUs();
        this.notification.success(new Notification('PDU devices onboarded successfully.'));
        // this.nxtPrvSvc.continueNextPrev();
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    }
  }


}