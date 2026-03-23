import { Component, OnInit, OnDestroy, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CRUDActionTypes, AppUtilityService, DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { Subject } from 'rxjs';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DatabaseServerCrudService } from './database-server-crud.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { DatabaseCRUDBMServerFast, DatabaseCRUDPrivateCloudFast, DatabaseCRUDPrivateCloudVms, DatabaseCRUDDBType } from '../../entities/database-servers-crud.type';
import { AppLevelService } from 'src/app/app-level.service';
import { UnityDevicesCustomAttributesCrudService } from 'src/app/shared/unity-devices-custom-attributes-crud/unity-devices-custom-attributes-crud.service';
import { LifeCycleStageOptions, LifeCycleStageStatusOptions } from '../../hypervisors/hypervisors-crud/hypervisors-crud.service';

@Component({
  selector: 'database-server-crud',
  templateUrl: './database-server-crud.component.html',
  styleUrls: ['./database-server-crud.component.scss']
})
export class DatabaseServerCrudComponent implements OnInit, OnDestroy {
  @Output('onCrud') onCrud = new EventEmitter<CRUDActionTypes>();

  private ngUnsubscribe = new Subject();
  dbInstanceId: string;
  nonFieldErr: string = '';
  action: 'Add' | 'Edit';
  managementEnabled: boolean = false;

  deviceType: DeviceMapping = DeviceMapping.DB_SERVER;

  @ViewChild('dbFormRef') dbFormRef: ElementRef;
  dbModelRef: BsModalRef;
  dbForm: FormGroup;
  dbFormErrors: any;
  dbFormValidationMessages: any;

  bmServers: Array<DatabaseCRUDBMServerFast> = [];
  privateClouds: Array<DatabaseCRUDPrivateCloudFast> = [];
  vms: Array<DatabaseCRUDPrivateCloudVms> = [];
  dbTypes: DatabaseCRUDDBType[] = [];
  tagsAutocompleteItems: string[] = [];

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmDBDeleteModalRef: BsModalRef;

  lifeCycleStageOptions: string[] = LifeCycleStageOptions;
  lifeCycleStageStatusOptions: string[] = LifeCycleStageStatusOptions;

  constructor(private crudService: DatabaseServerCrudService,
    private caSvc: UnityDevicesCustomAttributesCrudService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private spinnerService: AppSpinnerService,
    private notification: AppNotificationService,
    private appService: AppLevelService) {
    this.crudService.addOrEditAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(dbInstanceId => {
      this.dbInstanceId = dbInstanceId;
      this.action = this.dbInstanceId ? 'Edit' : 'Add';
      this.nonFieldErr = '';
      this.dbModelRef = null;
      this.getTags();
      this.buildAddEditForm(dbInstanceId);
    });
    this.crudService.deleteAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(dbInstanceId => {
      this.dbInstanceId = dbInstanceId;
      this.confirmDBDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    });
  }

  ngOnInit() {
    this.getPrivateClouds();
    this.getBMServers();
    this.getDBTypes();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getPrivateClouds() {
    this.crudService.getPrivateClouds().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.privateClouds = res;
    });
  }

  getPrivateCloudVms(url: string) {
    this.vms = [];
    this.crudService.getPrivateCloudVms(url).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.vms = res.filter(vm => !vm.is_template);
    });
  }

  getBMServers() {
    this.crudService.getBmServers().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.bmServers = res;
    });
  }

  getDBTypes() {
    this.crudService.getDBTypes().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.dbTypes = res;
    });
  }

  getTags() {
    this.appService.getTags().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.tagsAutocompleteItems = res;
    });
  }

  buildAddEditForm(dbInstanceId?: string) {
    this.crudService.createDbServerForm(dbInstanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(form => {
      this.dbForm = form;
      this.dbFormErrors = this.crudService.resetDBFormErrors();
      this.dbFormValidationMessages = this.crudService.dbFormValidationMessages;

      if(dbInstanceId){
        this.dbForm.get('life_cycle_stage').enable;
        this.dbForm.get('life_cycle_stage_status').enable;
      }

      if (this.dbForm.controls.private_cloud) {
        const url = this.privateClouds.find(pc => pc.id == this.dbForm.get('private_cloud').value).vm_url;
        this.getPrivateCloudVms(url);
        this.dbForm.get('private_cloud').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((cloudId: number) => {
          this.getPrivateCloudVms(this.privateClouds.find(pc => pc.id == cloudId).vm_url);
        });
      }

      this.dbForm.get('server_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((val: string) => {
        if (val == 'VMS') {
          this.dbForm.removeControl('bm_server');
          if (!this.dbForm.controls.private_cloud) {
            this.dbForm.addControl('private_cloud', new FormControl('', [Validators.required]));
            this.dbForm.get('private_cloud').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((cloudId: number) => {
              this.getPrivateCloudVms(this.privateClouds.find(pc => pc.id == cloudId).vm_url);
            });
            this.dbForm.addControl('vm', new FormControl('', [Validators.required]));
          }
        } else if (val == 'BMS') {
          this.dbForm.removeControl('private_cloud');
          this.dbForm.removeControl('vm');
          this.dbForm.addControl('bm_server', new FormControl('', [Validators.required]));
        } else {
          this.dbForm.removeControl('private_cloud');
          this.dbForm.removeControl('vm');
          this.dbForm.removeControl('bm_server');
        }
      });
      this.dbModelRef = this.modalService.show(this.dbFormRef, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
    });
  }

  handleError(err: any) {
    this.dbFormErrors = this.crudService.resetDBFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err) {
      for (const field in err) {
        if (field in this.dbForm.controls) {
          this.dbFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.dbModelRef.hide();
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinnerService.stop('main');
  }

  confirmDBCreate() {
    this.caSvc.submit();
    if (this.dbForm.invalid || this.caSvc.isInvalid()) {
      this.dbFormErrors = this.utilService.validateForm(this.dbForm, this.dbFormValidationMessages, this.dbFormErrors);
      this.dbForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.dbFormErrors = this.utilService.validateForm(this.dbForm, this.dbFormValidationMessages, this.dbFormErrors);
        this.caSvc.submit();
      });
    } else {
      let formObj = Object.assign({}, this.dbForm.getRawValue(), { 'custom_attribute_data': this.caSvc.getFormData() });
      let obj = this.crudService.convertToFormData(this.dbTypes, formObj);
      this.spinnerService.start('main');
      if (this.dbInstanceId) {
        this.crudService.updateDB(obj, this.dbInstanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.dbModelRef.hide();
          this.spinnerService.stop('main');
          this.notification.success(new Notification('Database updated successfully.'));
          this.onCrud.emit(CRUDActionTypes.UPDATE);
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.crudService.createDB(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.dbModelRef.hide();
          this.spinnerService.stop('main');
          this.notification.success(new Notification('Database Created successfully.'));
          this.onCrud.emit(CRUDActionTypes.ADD);
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  confirmDBDelete() {
    this.crudService.deleteDB(this.dbInstanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.confirmDBDeleteModalRef.hide();
      this.notification.success(new Notification('Database deleted successfully.'));
      this.onCrud.emit(CRUDActionTypes.DELETE);
    }, err => {
      this.confirmDBDeleteModalRef.hide();
      this.notification.error(new Notification('Database could not be deleted!!'));
    });
  }

}
