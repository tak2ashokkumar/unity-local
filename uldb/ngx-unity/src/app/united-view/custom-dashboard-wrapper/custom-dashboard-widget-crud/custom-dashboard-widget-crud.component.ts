import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService, CRUDActionTypes } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { CustomDashboardWidgetCrudService, DatasetItemType } from './custom-dashboard-widget.service';

@Component({
  selector: 'custom-dashboard-widget-crud',
  templateUrl: './custom-dashboard-widget-crud.component.html',
  styleUrls: ['./custom-dashboard-widget-crud.component.scss']
})
export class CustomDashboardWidgetCrudComponent implements OnInit, OnDestroy {
  @Output('onCrud') onCrud = new EventEmitter<CRUDActionTypes>();

  private ngUnsubscribe = new Subject();
  action: 'Create' | 'Edit';
  nonFieldErr: string = '';

  tags: { tag_name: string, id: number, uuid: string }[] = [];
  widgetId: number;
  itemsLoadedOnceInEdit: boolean = false;
  selectedTags: number[] = [];
  devices: { device_name: string, id: number, uuid: string }[] = [];
  selectedDevices: string[] = [];
  items: DatasetItemType[] = []

  @ViewChild('widgetFormRef') widgetFormRef: ElementRef;
  widgetModalRef: BsModalRef;
  widgetForm: FormGroup;
  widgetFormErrors: any;
  widgetFormValidationMessages: any;

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmDeleteModalRef: BsModalRef;

  tagSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'tag_name',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block text-truncate',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    selectAsObject: false,
    keyToSelect: 'id'
  };

  devicesSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'device_name',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block text-truncate',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    selectAsObject: false,
    keyToSelect: 'uuid'
  };

  itemsSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'item_name',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block text-truncate',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    selectAsObject: false,
    keyToSelect: 'item_id',
    selectionLimit: 10,
    groupBy: true,
    width: '150% !important'
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

  constructor(
    private crudSvc: CustomDashboardWidgetCrudService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService) {
    this.crudSvc.addOrEditAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(widgetId => {
      this.widgetId = widgetId;
      this.action = this.widgetId ? 'Edit' : 'Create';
      this.nonFieldErr = '';
      this.widgetModalRef = null;
      this.devices = [];
      this.items = [];
      this.itemsLoadedOnceInEdit = false;
      this.spinner.start('main');
      this.getTags();
    });
    this.crudSvc.deleteAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(widgetId => {
      this.widgetId = widgetId;
      this.confirmDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    });
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  get datasets(): FormArray {
    return this.widgetForm.get("datasets") as FormArray;
  }

  addDataset() {
    let index = this.datasets.length > 0 ? this.datasets.length - 1 : -1;
    let formGroup = index > -1 ? <FormGroup>this.datasets.at(index) : null;

    if (formGroup && formGroup.invalid) {
      this.widgetFormErrors.datasets[index] = this.utilService.validateForm(formGroup, this.widgetFormValidationMessages, this.widgetFormErrors.datasets[index]);
      formGroup.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
          this.widgetFormErrors.datasets[index] = this.utilService.validateForm(formGroup, this.widgetFormValidationMessages, this.widgetFormErrors.datasets[index]);
        });
    } else {
      let fg = this.crudSvc.newDataset();
      this.datasets.push(fg);
      this.widgetFormErrors.datasets.push(this.crudSvc.getDatasetFormErrors());
    }
  }

  removeDataset(index: number) {
    this.datasets.removeAt(index);
    this.widgetFormErrors.datasets.splice(index, 1);
  }

  getTags() {
    this.tags = [];
    this.crudSvc.getTags().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tags = res.filter(t => t.tag_name !== null).sort((a, b) => (a.tag_name < b.tag_name ? -1 : 1));
      this.buildAddEditForm(this.widgetId);
    }, err => {
      this.notification.error(new Notification('Error while fetching tags!!'))
    });
  }

  buildAddEditForm(widgetId: number) {
    this.crudSvc.createForm(widgetId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
      this.widgetForm = form;
      this.widgetFormErrors = this.crudSvc.resetFormErrors();
      for (let i = 0; i < this.datasets.length; i++) {
        this.widgetFormErrors.datasets.push(this.crudSvc.getDatasetFormErrors());
      }
      this.widgetFormValidationMessages = this.crudSvc.validationMessages;
      this.spinner.stop('main');
      if (this.widgetId) {
        //Getting tag name in tags from API, map to tag_id in edit flow
        let tags = <string[]>this.widgetForm.get('tags').value;
        this.widgetForm.get('tags').setValue(this.tags.filter(t => tags.includes(t.tag_name)).map(t => t.id));

        this.tagsChanged();
        if (!this.itemsLoadedOnceInEdit) {
          this.getItems();
        }
      }
      this.widgetModalRef = this.modalService.show(this.widgetFormRef, Object.assign({}, { class: 'modal-xl', keyboard: true, ignoreBackdropClick: true }));
    });
  }

  tagsChanged() {
    let selectedTags = (<number[]>this.widgetForm.get('tags').value);
    if (this.selectedTags == selectedTags) {
      return;
    }
    this.selectedTags = selectedTags;
    if (selectedTags.length) {
      this.getTaggedDevices(selectedTags);
    } else {
      this.devices = [];
      this.widgetForm.get('devices').setValue([]);
      this.items = [];
      this.resetDataSetItems();
    }
  }

  private getTaggedDevices(selectedTags: number[]) {
    this.crudSvc.getTaggedDevices(selectedTags).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.devices = res;
      //This is to remove old selected values if new list doesn't have them
      let old = <string[]>this.widgetForm.get('devices').value;
      let newDevices = this.devices.filter(t => old.includes(t.uuid)).map(t => t.uuid);
      this.widgetForm.get('devices').setValue(newDevices);
    }, err => {
      this.devices = [];
    });
  }

  private resetDataSetItems() {
    //DO not reset items for first time in edit. 
    if (this.widgetId && this.itemsLoadedOnceInEdit) {
      let len = this.datasets.length;
      for (let i = 0; i < len; i++) {
        this.datasets.at(i).get('items').reset();
      }
    }
  }

  groupByKey(array: any[], key: string) {
    let temp = array.reduce(function (memo, x) {
      if (!memo[x[key]]) { memo[x[key]] = []; }
      x['isOptionGroupName'] = false;
      x['optionGroupName'] = x[key]
      memo[x[key]].push(x);
      return memo;
    }, {});

    let arr = [];
    for (const group in temp) {
      if (temp.hasOwnProperty(group)) {
        const subArray = temp[group];
        let groupTitle = { isOptionGroupName: true, optionGroupName: subArray[0][key] }
        arr = [...arr, ...[groupTitle], ...subArray];
      }
    }
    return arr;
  }

  getItems() {
    let selectedDevices = (<string[]>this.widgetForm.get('devices').value);
    if (this.selectedDevices == selectedDevices) {
      this.itemsLoadedOnceInEdit = true;
      return;
    }
    // this.resetDataSetItems();
    this.selectedDevices = selectedDevices;
    if (selectedDevices.length) {
      this.crudSvc.getItems(selectedDevices).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        // this.items = res.map(res => {
        //   res.item_name = `${res.device_name} - ${res.item_name}`;
        //   return res;
        // })
        this.items = this.groupByKey(res, 'device_name');
        this.itemsLoadedOnceInEdit = true;

        //This is to remove old selected values if new list doesn't have them
        let len = this.datasets.length;
        for (let i = 0; i < len; i++) {
          let old = <number[]>this.datasets.at(i).get('items').value;
          let newItems = this.items.filter(t => old.includes(t.item_id)).map(t => t.item_id);
          this.datasets.at(i).get('items').setValue(newItems);
        }
      }, err => {
        this.items = [];
        this.itemsLoadedOnceInEdit = true;
        this.resetDataSetItems();
      });
    } else {
      this.items = [];
      this.itemsLoadedOnceInEdit = true;
      this.resetDataSetItems();
    }
  }

  handleError(err: any) {
    this.widgetFormErrors = this.crudSvc.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.widgetForm.controls) {
          this.widgetFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.widgetModalRef.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  submit() {
    console.log(this.widgetForm)
    if (this.widgetForm.invalid) {
      this.widgetFormErrors = this.utilService.validateForm(this.widgetForm, this.widgetFormValidationMessages, this.widgetFormErrors);
      this.widgetForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.widgetFormErrors = this.utilService.validateForm(this.widgetForm, this.widgetFormValidationMessages, this.widgetFormErrors); });
    } else {
      this.spinner.start('main');
      if (this.widgetId) {
        this.crudSvc.updateWidget(this.widgetId, this.widgetForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.widgetModalRef.hide();
          this.spinner.stop('main');
          this.notification.success(new Notification('Widget updated successfully.'));
          this.onCrud.emit(CRUDActionTypes.UPDATE);
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.crudSvc.createWidget(this.widgetForm.getRawValue()).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.widgetModalRef.hide();
          this.spinner.stop('main');
          this.notification.success(new Notification('Widget created successfully.'));
          this.onCrud.emit(CRUDActionTypes.ADD);
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  confirmWidgetDelete() {
    this.crudSvc.confirmDeleteWidget(this.widgetId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.confirmDeleteModalRef.hide();
      this.spinner.stop('main');
      this.notification.success(new Notification('Widget deleted successfully.'));
      this.onCrud.emit(CRUDActionTypes.DELETE);
    }, (err: HttpErrorResponse) => {
      this.handleError(err.error);
    });
  }

}
