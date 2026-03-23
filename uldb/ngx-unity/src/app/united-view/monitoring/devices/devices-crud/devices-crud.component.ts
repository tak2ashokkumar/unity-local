import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { DevicesCrudService, MonitoringDeviceViewData } from './devices-crud.service';

@Component({
  selector: 'devices-crud',
  templateUrl: './devices-crud.component.html',
  styleUrls: ['./devices-crud.component.scss']
})
export class DevicesCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  action: 'Add' | 'Edit';
  @ViewChild('confirm') confirm: ElementRef;
  confirmModalRef: BsModalRef;

  @ViewChild('confirmDevice') confirmDevice: ElementRef;
  confirmDeviceModalRef: BsModalRef;

  @ViewChild('template') elementView: ElementRef;
  modalRef: BsModalRef;

  @ViewChild('addDeviceView') addDeviceView: ElementRef;

  @Output() onGroupAdded = new EventEmitter<DeviceGroup>();
  @Output() onGroupDeleted = new EventEmitter<string>();

  group: DeviceGroup = null;
  groupId: string = null;
  groupForm: FormGroup;
  groupFormErrors: any;
  groupValidationMessages: any;

  deviceForm: FormGroup;
  deviceFormErrors: any;
  deviceValidationMessages: any;
  selectedDeviceCategory: string = '';
  currentIds: string[] = [];
  devicesByCategory: MonitoringDeviceViewData[] = [];

  deviceIdToDelete: string;

  mySettings: IMultiSelectSettings = {
    keyToSelect: "deviceId",
    lableToDisplay: "deviceName",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
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


  constructor(private crudService: DevicesCrudService,
    private utilService: AppUtilityService,
    private notificationService: AppNotificationService,
    private spinner: AppSpinnerService,
    private modalService: BsModalService) {
    this.crudService.addOrEditGroupToggled$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(group => this.addEditGroup(group));

    this.crudService.deleteGroupToggled$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(group => this.deleteGroup(group));

    this.crudService.addDeviceToggled$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => this.addDevice(data.grouId, data.currentDeviceIds));

    this.crudService.deleteDeviceToggled$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => this.deleteDevice(data));
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  addEditGroup(group: DeviceGroup) {
    this.action = group ? 'Edit' : 'Add';
    this.group = group;
    this.groupFormErrors = this.crudService.resetGroupFormErrors();
    this.groupValidationMessages = this.crudService.groupValidationMessages;
    this.groupForm = this.crudService.createGroupForm(group);
    this.modalRef = this.modalService.show(this.elementView, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  deleteGroup(group: DeviceGroup) {
    this.group = group;
    this.confirmModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  addDevice(groupId: string, currentDeviceIds: string[]) {
    this.groupId = groupId;
    this.selectedDeviceCategory = '';
    this.currentIds = currentDeviceIds;
    this.deviceFormErrors = this.crudService.resetDeviceFormErrors();
    this.deviceValidationMessages = this.crudService.deviceValidationMessages;
    this.deviceForm = this.crudService.createDeviceForm(this.groupId);
    this.devicesByCategory = [];
    this.modalRef = this.modalService.show(this.addDeviceView, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  onSubmit() {
    if (this.groupForm.invalid) {
      this.groupFormErrors = this.utilService.validateForm(this.groupForm, this.groupValidationMessages, this.groupFormErrors);
      this.groupForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.groupFormErrors = this.utilService.validateForm(this.groupForm, this.groupValidationMessages, this.groupFormErrors); });
    } else {
      const data = this.groupForm.getRawValue();
      if (this.group) {
        this.updateGroup(data);
      } else {
        this.addGroup(data);
      }
    }
  }

  addGroup(data: { name: string, desc: string }) {
    this.spinner.start('main');
    this.crudService.addGroup(data).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.onGroupAdded.emit(res);
      this.modalRef.hide();
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notificationService.error(new Notification('Group could not be added!!'));
    });
  }

  updateGroup(data: { name: string, desc: string }) {
    this.group.name = data.name;
    this.group.desc = data.desc;
    this.spinner.start('main');
    this.crudService.updateGroup(this.group).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.modalRef.hide();
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notificationService.error(new Notification('Group could not be updated!!'));
    });
  }

  confirmDeleteGroup() {
    this.spinner.start('main');
    this.crudService.removeGroup(this.group.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.onGroupDeleted.emit(this.group.uuid);
      this.confirmModalRef.hide();
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notificationService.error(new Notification('Group could not be deleted!!'));
    });
  }

  deviceCategorySelected(deviceCategorySelected: string) {
    this.devicesByCategory = [];
    this.deviceForm.get('devices_selected').setValue([]);
    this.crudService.getDeviceByCategory(deviceCategorySelected, this.currentIds).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.devicesByCategory = res;
    }, err => { });
  }

  onDeviceSubmit() {
    if (this.deviceForm.invalid) {
      this.deviceFormErrors = this.utilService.validateForm(this.deviceForm, this.deviceValidationMessages, this.deviceFormErrors);
      this.deviceForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => { this.deviceFormErrors = this.utilService.validateForm(this.deviceForm, this.deviceValidationMessages, this.deviceFormErrors); });
    } else {
      this.spinner.start('main');
      this.crudService.submitDevice(this.deviceForm.getRawValue(), this.selectedDeviceCategory).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        if (res.length) {
          this.crudService.deviceAddedSource.next(res);
          this.modalRef.hide();
        }
        this.spinner.stop('main');
      }, err => {
        this.spinner.stop('main');
        this.notificationService.error(new Notification('Device could not be added!!'));
      });
    }
  }

  deleteDevice(data: { deviceId: string, groupId: string }) {
    this.deviceIdToDelete = data.deviceId;
    this.groupId = data.groupId;
    this.confirmDeviceModalRef = this.modalService.show(this.confirmDevice, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.spinner.start('main');
    this.crudService.confirmDeviceDelete(this.deviceIdToDelete, this.groupId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.crudService.deviceDeletedSource.next(this.deviceIdToDelete);
      this.confirmDeviceModalRef.hide();
      this.spinner.stop('main');
    }, err => {
      this.notificationService.error(new Notification('Device could not be deleted!!'));
      this.confirmDeviceModalRef.hide();
      this.spinner.stop('main');
    });
  }
}
