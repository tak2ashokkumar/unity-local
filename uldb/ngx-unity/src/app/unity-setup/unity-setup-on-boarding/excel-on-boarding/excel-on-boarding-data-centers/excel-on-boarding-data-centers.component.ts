import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { ExcelOnBoardingNextPrevService } from '../excel-on-boarding-next-prev/excel-on-boarding-next-prev.service';
import { ExcelOnBoardingDataCentersService, ExcelOnBoardingDCViewdata } from './excel-on-boarding-data-centers.service';

@Component({
  selector: 'excel-on-boarding-data-centers',
  templateUrl: './excel-on-boarding-data-centers.component.html',
  styleUrls: ['./excel-on-boarding-data-centers.component.scss'],
  providers: [ExcelOnBoardingDataCentersService]
})
export class ExcelOnBoardingDataCentersComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  viewData: ExcelOnBoardingDCViewdata[] = [];
  fileIds: string[] = [];


  constructor(private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private nxtPrvSvc: ExcelOnBoardingNextPrevService,
    private storage: StorageService,
    private xlSvc: ExcelOnBoardingDataCentersService) {
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
    this.getDCs();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getDCs() {
    this.xlSvc.getDCs(this.fileIds).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.viewData = this.xlSvc.converToViewdata(data);
      setTimeout(() => {
        this.initLocation();
      }, 100);
      this.spinner.stop('main');
    }, err => {
      this.notification.error(new Notification('Error while fetching datacenters list'));
      this.spinner.stop('main');
    });
  }

  initLocation() {
    this.viewData.forEach((dc, i) => {
      let autocomplete = new google.maps.places.Autocomplete(document.getElementById(`${i}-searchlocation`) as HTMLInputElement, { types: [] });
      autocomplete.setFields(['geometry', 'formatted_address']);
      autocomplete.addListener('place_changed', (d) => {
        let place = autocomplete.getPlace();
        dc.form.get('searchlocation').setValue(place.formatted_address);
        dc.form.get(`location`).setValue(place.formatted_address);
        dc.form.get('lat').setValue(place.geometry.location.lat());
        dc.form.get('long').setValue(place.geometry.location.lng());
      });
    })
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
    let count = 0;
    this.viewData.forEach(data => {
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
    if (count == this.viewData.length) {
      let arr = [];
      this.viewData.filter(view => !view.onboarded).forEach(view => {
        arr.push(view.form.getRawValue());
      });
      this.spinner.start('main');
      this.xlSvc.saveAll(arr).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.spinner.stop('main');
        this.getDCs();
        this.notification.success(new Notification('Datacenters onboarded successfully.'));
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    }
  }

}
