import { Component, OnInit, OnDestroy, QueryList, ElementRef, ViewChildren } from '@angular/core';
import { DeviceDiscoveryPdusService, DevDisPDUViewdata, DeviceDiscoveryPDUFormData } from './device-discovery-pdus.service';
import { Subject } from 'rxjs';
import { PDUCRUDModel, PDUCRUDCabinet, PDUCRUDPowerCircuit } from 'src/app/united-cloud/datacenter/entities/pdus-crud.type';
import { AppUtilityService, PDUTypes } from 'src/app/shared/app-utility/app-utility.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'device-discovery-pdus',
  templateUrl: './device-discovery-pdus.component.html',
  styleUrls: ['./device-discovery-pdus.component.scss'],
  providers: [DeviceDiscoveryPdusService]
})
export class DeviceDiscoveryPdusComponent implements OnInit, OnDestroy {

  @ViewChildren('fold') folds: QueryList<ElementRef>;
  private ngUnsubscribe = new Subject();
  viewData: DevDisPDUViewdata[] = [];
  pdumodels: Array<PDUCRUDModel> = [];
  cabinets: Array<PDUCRUDCabinet> = [];
  powercircuits: Array<PDUCRUDPowerCircuit> = [];
  constructor(private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private pduSvc: DeviceDiscoveryPdusService) { }

  ngOnInit() {
    this.spinner.start('main');
    this.getPdus();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getPdus() {
    this.pduSvc.getPdus().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.pduSvc.convertToViewData(res);
      this.getDropdownData();
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to load PDUs. Tryagain later.'));
    });
  }

  getDropdownData() {
    this.pduSvc.getDropdownData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.pdumodels = res[0];
      this.cabinets = res[1];
      this.powercircuits = res[2];
      this.formSubscriptions();
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get PDUs data. Tryagain later.'));
    })
  }

  formSubscriptions() {
    this.viewData.forEach(data => {
      data.form.get('name').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        data.hostname = val;
      });
      data.form.get('model.id').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        data.model = this.pdumodels.find(m => m.id == Number(val)).model_number;
      });
      data.form.get('cabinet.id').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        data.cabinet = this.cabinets.find(m => m.id == Number(val)).name;
        data.form.get('position').setValue('');
        if (val) {
          data.form.get('position').enable();
        } else {
          data.form.get('position').disable();
        }
      });
      data.form.get('position').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        if (val) {
          data.form.get('position').setValue(val.toUpperCase(), { emitEvent: false });
        }
      });
      data.form.get('pdu_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        if (val == PDUTypes.HORIZONTAL) {
          data.form.get('size').enable();
        }
        else {
          data.form.get('size').disable();
          data.form.get('size').setValue(1);
        }
      });
    });
  }

  openRow(obj: DevDisPDUViewdata) {
    this.viewData.map(data => {
      if (data != obj) {
        data.isOpen = false;
      }
    });
    obj.isOpen = !obj.isOpen;
  }

  open(obj: DevDisPDUViewdata) {
    if (!obj.openEnabled) {
      return;
    }
    this.openRow(obj);
  }

  handleError(errorRes: any) {
    for (const key in errorRes) {
      if (errorRes.hasOwnProperty(key)) {
        const errors = errorRes[key];
        for (let i = 0; i < this.viewData.length; i++) {
          if (this.viewData[i].uniqueId == key) {
            if (errorRes[key]['saved']) {
              this.viewData[i].openEnabled = false;
              this.viewData[i].formErrors = this.pduSvc.resetPduFormErrors();
              this.viewData[i].isOpen = false;
              continue;
            }
            this.viewData[i].isOpen = true;
            this.viewData[i].formErrors = this.pduSvc.resetPduFormErrors();
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
      let arr: DeviceDiscoveryPDUFormData[] = [];
      changedForms.filter(view => view.openEnabled).forEach(view => arr.push(<DeviceDiscoveryPDUFormData>view.form.getRawValue()));
      this.spinner.start('main');
      this.pduSvc.saveAll(arr).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.spinner.stop('main');
        changedForms.forEach(v => {
          v.isOpen = false;
          v.openEnabled = false;
        });
        this.notification.success(new Notification('PDUs onboarded successfully.'));
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
        // this.notification.error(new Notification('Failed to save PDUs. Tryagain later.'));
      });
    }
  }
}
