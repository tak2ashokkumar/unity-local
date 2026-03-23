import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { DatabaseCRUDDBType } from 'src/app/united-cloud/shared/entities/database-servers-crud.type';
import { ExcelOnBoardingNextPrevService } from '../excel-on-boarding-next-prev/excel-on-boarding-next-prev.service';
import { ExcelOnBoardingDatabaseService, ExcelOnBoardingDatabaseViewdata } from './excel-on-boarding-database.service';

@Component({
  selector: 'excel-on-boarding-database',
  templateUrl: './excel-on-boarding-database.component.html',
  styleUrls: ['./excel-on-boarding-database.component.scss'],
  providers: [ExcelOnBoardingDatabaseService]
})
export class ExcelOnBoardingDatabaseComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  viewData: ExcelOnBoardingDatabaseViewdata[] = [];
  dbTypes: Array<DatabaseCRUDDBType> = [];
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
    private xlSvc: ExcelOnBoardingDatabaseService) {
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
    this.getDatabases();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getDatabases() {
    this.xlSvc.getDatabases(this.fileIds).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.viewData = this.xlSvc.converToViewdata(data);
      this.getDropDownData();
      this.spinner.stop('main');
    }, err => {
      this.notification.error(new Notification('Error while fetching devices list'));
      this.spinner.stop('main');
    });
  }

  getDropDownData() {
    this.dbTypes = [];
    this.xlSvc.getDropdownData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.dbTypes = res[0];
      this.viewData.forEach(data => {
        this.dbTypes.forEach(m => {
          if (m.name == data.data.db_type) {
            data.form.get('db_type').setValue(m);
          }
        });
      });
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to fetch database types. Tryagain later.'))
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
    let changedForms = this.viewData.filter(data => {
      return data.form.valid || data.form.touched && data.form.dirty;
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
      changedForms
        .filter(view => !view.onboarded)
        .forEach(view => {
          arr.push(view.form.getRawValue());
        });
      this.spinner.start('main');
      this.xlSvc.saveAll(arr).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.spinner.stop('main');
        this.getDatabases();
        this.notification.success(new Notification('Databases onboarded successfully.'));
        // this.nxtPrvSvc.continueNextPrev();
      }, (err: HttpErrorResponse) => {
        console.log(err)
        this.handleError(err.error);
      });
    }
  }

}
