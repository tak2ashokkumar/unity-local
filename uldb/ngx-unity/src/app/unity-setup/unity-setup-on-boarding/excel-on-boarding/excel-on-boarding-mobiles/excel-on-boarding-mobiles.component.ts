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
import { ExcelOnBoardingNextPrevService } from '../excel-on-boarding-next-prev/excel-on-boarding-next-prev.service';
import { ExcelMobileTagDevice, ExcelOnBoardingMobilesService, ExcelOnBoardingMobilesViewdata } from './excel-on-boarding-mobiles.service';
import { DeviceDiscoveryAgentConfigurationType } from '../../advanced-discovery-connectivity/agent-config.type';

@Component({
  selector: 'excel-on-boarding-mobiles',
  templateUrl: './excel-on-boarding-mobiles.component.html',
  styleUrls: ['./excel-on-boarding-mobiles.component.scss'],
  providers: [ExcelOnBoardingMobilesService]
})
export class ExcelOnBoardingMobilesComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  viewData: ExcelOnBoardingMobilesViewdata[] = [];
  tagDevices: { [key: string]: ExcelMobileTagDevice[] } = {};
  fileIds: string[] = [];
  collectors: DeviceDiscoveryAgentConfigurationType[] = [];

  cloudSettings: IMultiSelectSettings = {
    pullRight: true,
    isSimpleArray: false,
    lableToDisplay: 'name',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: false,
    showUncheckAll: false,
    selectAsObject: true,
    selectionLimit: 1,
    autoUnselect: true,
    closeOnSelect: true
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
    private xlSvc: ExcelOnBoardingMobilesService) {
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
    this.getMobiles();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getMobiles() {
    this.xlSvc.getMobiles(this.fileIds).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.viewData = this.xlSvc.converToViewdata(data);
      this.getTaggedDevices();
      this.getCollectorData();
      this.spinner.stop('main');
    }, err => {
      this.notification.error(new Notification('Error while fetching devices list'));
      this.spinner.stop('main');
    });
  }

  getCollectorData() {
    this.xlSvc.getCollectors().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.collectors = data;
      this.viewData.forEach(data => {
        this.collectors.forEach(collector => {
          if(collector.ip_address == data.data.collector){
            data.form.patchValue({ collector: { uuid: collector.uuid } });
          }
        });
      });
      this.spinner.stop('main');
    }, err => {
      this.notification.error(new Notification('Error while fetching devices list'));
      this.spinner.stop('main');
    });
  }

  getTaggedDevices() {
    from(['Android', 'ios'])
      .pipe(
        mergeMap((e) => this.xlSvc.getSelectedTagDevices(e, '')),
        takeUntil(this.ngUnsubscribe)
      ).subscribe(res => {
        const key = res.keys().next().value;
        this.tagDevices[key] = res.get(key);
        this.viewData.filter(data => data.data.platform == key).forEach(data => {
          data.tagDevices = this.tagDevices[key];
          this.tagDevices[key].forEach(m => {
            if (m.name == data.data.tagged_device) {
              data.form.patchValue({ tagged_device: [m] });
            }
          });
          data.form.get('platform').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(r => {
            data.asyncSelected = '';
            data.form.get('tagged_device').setValue([]);
            data.tagDeviceErr = false;
          });
        });
      }, err => {
        console.log(err)
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
        let fd = view.form.getRawValue();
        fd.tagged_device = fd.tagged_device.length ? fd.tagged_device : null;
        arr.push(fd);
      });
      this.spinner.start('main');
      this.xlSvc.saveAll(arr).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.spinner.stop('main');
        this.getMobiles();
        this.notification.success(new Notification('Mobile devices onboarded successfully.'));
        // this.nxtPrvSvc.continueNextPrev();
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
      });
    }
  }

}
