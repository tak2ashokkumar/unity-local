import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';
import { Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { CabinetFast } from 'src/app/shared/SharedEntityTypes/cabinet.type';
import { SwitchCRUDManufacturer, SwitchCRUDModel, SwitchCRUDPrivateCloudFast } from 'src/app/united-cloud/shared/entities/switch-crud.type';
import { DevDisSwitchViewdata, DeviceDiscoverySwitchesService, DeviceDiscoverySwitchFormData } from './device-discovery-switches.service';

@Component({
  selector: 'device-discovery-switches',
  templateUrl: './device-discovery-switches.component.html',
  styleUrls: ['./device-discovery-switches.component.scss'],
  providers: [DeviceDiscoverySwitchesService]
})
export class DeviceDiscoverySwitchesComponent implements OnInit {
  @ViewChildren('fold') folds: QueryList<ElementRef>;
  private ngUnsubscribe = new Subject();
  viewData: DevDisSwitchViewdata[] = [];
  manufacturers: Array<SwitchCRUDManufacturer> = [];
  models: Array<SwitchCRUDModel> = [];
  cabinets: Array<CabinetFast> = [];
  privateclouds: Array<SwitchCRUDPrivateCloudFast> = [];

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
    private deviceDiscoveryService: DeviceDiscoverySwitchesService) { }

  ngOnInit() {
    this.spinner.start('main');
    this.getSwitches();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getSwitches() {
    this.deviceDiscoveryService.getSwitches().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.deviceDiscoveryService.convertToViewData(res);
      this.getDropDownData();
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to load Switches. Tryagain later.'));
    });
  }

  getDropDownData() {
    this.deviceDiscoveryService.getDropdownData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.manufacturers = res[0];
      this.viewData.forEach(data => {
        this.manufacturers.forEach(m => {
          if (m.name == data.manufaturer) {
            data.form.get('manufacturer').setValue(m.id);
          }
        });
      });
      this.cabinets = res[1];
      this.privateclouds = res[2];
      this.formSubscriptions();
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to load Switch Data. Tryagain later.'))
    })
  }

  formSubscriptions() {
    this.viewData.forEach(data => {
      data.form.get('name').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        data.hostname = val;
      });
      data.form.get('manufacturer').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        data.manufaturer = this.manufacturers.find(m => m.id == Number(val)).name;
        this.getModels(data, val);
      });
      data.form.get('model.id').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        if (!val) {
          data.model = '';
          return;
        }
        data.model = data.models.find(m => m.id == Number(val)).name;
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
    });
  }

  getModels(data: DevDisSwitchViewdata, manufacturer: string) {
    this.deviceDiscoveryService.getModels(manufacturer).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      data.models = res;
      data.form.patchValue({ model: { id: '' } });
    });
  }

  openRow(obj: DevDisSwitchViewdata) {
    this.viewData.map(data => {
      if (data != obj) {
        data.isOpen = false;
      }
    });
    obj.isOpen = !obj.isOpen;
  }

  open(obj: DevDisSwitchViewdata) {
    // this.folds.map(fold => {
    //   if (fold.nativeElement.id != id) {
    //     this.renderer.removeClass(fold.nativeElement, 'open')
    //   }
    // });
    // let ele = document.getElementById(id);
    // if (ele.classList.contains('open')) {
    //   this.renderer.removeClass(ele, 'open');
    // } else {
    //   this.renderer.addClass(ele, 'open');
    // }
    if (!obj.openEnabled) {
      return;
    }
    if (obj.models) {
      this.openRow(obj);
    } else {
      let m: SwitchCRUDManufacturer = null;
      if (obj.manufaturer && obj.manufaturer != 'NA') {
        for (let i = 0; i < this.manufacturers.length; i++) {
          if (this.manufacturers[i].name == obj.manufaturer) {
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
              this.viewData[i].formErrors = this.deviceDiscoveryService.resetSwitchFormErrors();
              this.viewData[i].isOpen = false;
              continue;
            }
            this.viewData[i].isOpen = true;
            this.viewData[i].formErrors = this.deviceDiscoveryService.resetSwitchFormErrors();
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
      changedForms.filter(view => view.openEnabled).forEach(view => arr.push(<DeviceDiscoverySwitchFormData>view.form.getRawValue()));
      this.spinner.start('main');
      this.deviceDiscoveryService.saveAll(arr).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.spinner.stop('main');
        changedForms.forEach(v => {
          v.isOpen = false;
          v.openEnabled = false;
        });
        this.notification.success(new Notification('Switches onboarded successfully.'));
      }, (err: HttpErrorResponse) => {
        this.handleError(err.error);
        // this.notification.error(new Notification('Failed to save Switches. Tryagain later.'));
      });
    }
  }
}