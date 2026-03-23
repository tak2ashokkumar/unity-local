import { Component, OnDestroy, OnInit } from '@angular/core';
import { ImageMappingCrudService } from './image-mapping-crud.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { FileInfo, OSInfo, StorageInfo, VMImage } from './image-mapping-type';

@Component({
  selector: 'image-mapping-crud',
  templateUrl: './image-mapping-crud.component.html',
  styleUrls: ['./image-mapping-crud.component.scss'],
  providers: [ImageMappingCrudService]
})
export class ImageMappingCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  imageMapId: string;
  mappingData: VMImage;
  action: string;
  osPath: string;

  cloudList: PrivateCLoudFast[] = [];
  OSInfoList: OSInfo[] = [];
  osNames: string[] = [];
  osVersions: string[] = [];
  osEditions: string[] = [];
  osTypes: any[] = [];
  dataStoreList: StorageInfo[] = [];
  contentList: FileInfo[] = [];
  selectedOsName: string = '';
  selectedOsType: string = '';
  selectedOsVersion: string = '';
  selectedStorageType: string = 'Datastore';
  count = 0;
  templateList: any[] = [];

  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;
  nonFieldErr: string;

  selectedDatastore: string = '';
  selectedContent: string | null = '';

  connectionResult: boolean;
  urlBlockStatus: boolean = false;

  constructor(private svc: ImageMappingCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private builder: FormBuilder) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.imageMapId = params.get('imageMapId');
      this.action = this.imageMapId ? 'Update' : 'Create';
    });
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getDropdownData();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getImageDataById() {
    this.spinner.start('main');
    this.svc.getMappingDataById(this.imageMapId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.mappingData = res;
      this.buildForm();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.handleError(err.error);
    });
  }

  getDropdownData() {
    this.svc.getDropdownData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res.clouds) {
        this.cloudList = res.clouds;
      } else {
        this.cloudList = [];
      }
      if (res.osInfo) {
        this.OSInfoList = res.osInfo;
        this.osTypes = this.OSInfoList.map(item => item.os_type);
        this.osTypes = [...new Set(this.osTypes)]
        if (this.imageMapId) {
          this.getImageDataById();
        } else {
          this.buildForm();
        }
      } else {
        this.OSInfoList = [];
      }
    })
  }

  buildForm() {
    this.form = this.svc.buildForm(this.mappingData);
    this.formErrors = this.svc.resetFormErrors();
    this.formValidationMessages = this.svc.formValidationMessages;
    if (this.imageMapId) {
      this.osNames = Array.from(new Set(this.OSInfoList.filter(item => item.os_type === this.form.get('os_type').value).map(item => item.os_name)));
      this.osVersions = Array.from(new Set(this.OSInfoList.filter(item => item.os_type === this.mappingData.os_type && item.os_name === this.mappingData.os_name).map(item => item.os_version)));
      this.osEditions = Array.from(new Set(this.OSInfoList.filter(item => item.os_type === this.mappingData.os_type && item.os_name === this.mappingData.os_name && item.os_version === this.mappingData.os_version).map(item => item.os_edition)));
      // if (this.mappingData.location != null) {
      if (this.mappingData?.storage_type === 'Datastore') {
        this.svc.getDataStoreList(this.mappingData.location).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.dataStoreList = res;
          this.selectDatastore(this.mappingData.datastore_name);
        }, (err: HttpErrorResponse) => {
          this.notification.error(new Notification('Failed to fetch Data Store List'));
        });
      } else {
        this.svc.getTemplates(this.form.get('location').value).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.templateList = res;
        });
      }
    }
    this.manageFormSubscriptions();
    this.spinner.stop('main');
  }

  manageFormSubscriptions() {
    this.form.get('os_type').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      if (value) {
        this.form.get('os_name').enable();
        this.form.get('os_version').disable();
        this.form.get('os_edition').disable();
        this.osNames = Array.from(new Set(this.OSInfoList.filter(item => item.os_type === value).map(item => item.os_name)));
        this.selectedOsType = value;
      }
    });
    this.form.get('os_name').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      this.form.get('os_version').enable();
      this.form.get('os_edition').disable();
      this.osVersions = Array.from(new Set(this.OSInfoList.filter(item => item.os_type === this.selectedOsType && item.os_name === value).map(item => item.os_version)));
      this.selectedOsName = value;
    });
    this.form.get('os_version').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      this.form.get('os_edition').enable();
      this.osEditions = Array.from(new Set(this.OSInfoList.filter(item => item.os_type === this.selectedOsType && item.os_name === this.selectedOsName && item.os_version === value).map(item => item.os_edition)));
      this.selectedOsVersion = value;
    });
    this.form.get('location').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      this.form.get('storage_type')?.setValue('');
      this.form.get('file_path')?.setValue('');
      if (value == 'Other') {
        this.form.removeControl('storage_type');
        this.form.addControl('file_path', new FormControl('', [Validators.required]));
      } else {
        this.form.addControl('storage_type', new FormControl('', [Validators.required]));
      }
    });
    this.form.get('storage_type')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((value: string) => {
      this.selectedStorageType = value;
      if (this.selectedStorageType === 'Datastore') {
        this.form.addControl('datastore_name', new FormControl('', [Validators.required]));
        this.form.addControl('file_path', new FormControl('', [Validators.required]));
        this.svc.getDataStoreList(this.form.get('location').value).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.dataStoreList = res;
        });
      } else {
        this.form.addControl('file_path', new FormControl('', [Validators.required]));
        this.form.removeControl('datastore_name');
        this.svc.getTemplates(this.form.get('location').value).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.templateList = res;
        });
      }
    });
  }

  selectDatastore(datastoreName: any, event?: any) {
    this.contentList = [];
    this.selectedDatastore = datastoreName;
    this.form.get('datastore_name').setValue(this.selectedDatastore);
    this.spinner.start('main');
    this.svc.getContentList(this.form.get('location').value, datastoreName).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.contentList = res;
      if (this.imageMapId) {
        this.count++;
        const filteredContent = this.contentList.find(item => item.file_path === this.mappingData.file_path);
        this.selectContent(filteredContent);
      }
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.handleError(err.error);
    });
  }

  selectContent(content: FileInfo) {
    this.selectedContent = content?.file_path;
    this.form.get('file_path').setValue(this.selectedContent);
  }

  confirmCreateImageMapping() {
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      });
    } else {
      this.spinner.start('main');
      let obj = <any>Object.assign({}, this.form.getRawValue());
      if (obj.location == 'Other') {
        obj.location = null;
      }
      if (this.imageMapId) {
        this.svc.updateTask(this.imageMapId, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Image updated Successfully.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.svc.createTask(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Image created successfully.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  handleError(err: any) {
    this.formErrors = this.svc.resetFormErrors();
    this.spinner.stop('main');
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    }
    else if (err.detail) {
      this.nonFieldErr = err.detail;
    }
    else if (err) {
      for (const field in err) {
        if (field in this.form.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.notification.error(new Notification('Something went wrong!! Please try again.'));
    this.spinner.stop('main');
  }

  testConnection() {
    const osPath = this.form.get('file_path')?.value;
    if (osPath) {
      this.svc.testConnection(osPath).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.connectionResult = data.valid;
        this.spinner.stop('main');
        this.urlBlockStatus = true;
        if (this.connectionResult == true) {
          this.notification.success(new Notification('The given OS Path is working successfully.'));
        }
        if (this.connectionResult == false) {
          this.notification.error(new Notification('The given OS Path is Not working properly.'));
        }
      }, (err: HttpErrorResponse) => {
        this.urlBlockStatus = true;
        this.connectionResult = false;
        this.notification.error(new Notification('The given OS Path is Not working properly.'));
      });
    }
  }

  goBack() {
    if (this.imageMapId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }
}
