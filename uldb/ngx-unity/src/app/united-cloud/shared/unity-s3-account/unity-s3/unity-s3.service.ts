import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { CREATE_UL_S3_BUCKET, DELETE_UL_S3_BUCKET, GET_UL_S3_BUCKETS, GET_UL_S3_UPLOADED_FILES, UPLOAD_FILE_TO_UL_S3BUCKET } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CeleryTaskV2 } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { ULS3Type, ULS3UploadedFile } from '../ul-s3-type';

@Injectable()
export class UnityS3Service {
  constructor(private http: HttpClient,
    private appService: AppLevelService,
    private builder: FormBuilder,
    private utilSvc: AppUtilityService) { }

  getBuckets(accountId: string) {
    return this.http.get<CeleryTaskV2>(GET_UL_S3_BUCKETS(accountId))
      .pipe(switchMap(res => this.appService.pollForTask(res.celery_task.task_id, 2, 50).pipe(take(1))), take(1));
  }

  createBucket(accountId: string, data: { bucketName: string }) {
    return this.http.post<CeleryTaskV2>(CREATE_UL_S3_BUCKET(accountId), data)
      .pipe(switchMap(res => this.appService.pollForTask(res.celery_task.task_id, 2, 50).pipe(take(1))), take(1));
  }

  deleteBucket(accountId: string, formData: any) {
    return this.http.post<CeleryTaskV2>(DELETE_UL_S3_BUCKET(accountId), formData)
      .pipe(switchMap(res => this.appService.pollForTask(res.celery_task.task_id, 2, 50).pipe(take(1))), take(1));
  }

  convertToViewData(awss3: ULS3Type[]): ULS3ViewData[] {
    let view: ULS3ViewData[] = [];
    awss3.map(awss3 => {
      let data = new ULS3ViewData();
      data.bucketName = awss3.bucket_name;
      data.bucketSize = awss3.bucket_size;
      data.creationDate = awss3.creation_date ? this.utilSvc.toUnityOneDateFormat(awss3.creation_date) : 'N/A';
      data.region = awss3.region;
      data.uuid = awss3.uuid;
      view.push(data);
    });
    return view;
  }

  resetFormErrors() {
    return {
      'bucketName': '',
      'region': ''
    };
  }

  validationMessages = {
    'bucketName': {
      'required': 'Bucket Name is required'
    },
    'region': {
      'required': 'Region is required'
    }
  }

  createForm(): FormGroup {
    return this.builder.group({
      'bucketName': ['', [Validators.required, NoWhitespaceValidator]]
    });
  }

  uploadFileToS3(accountId: string, bucketName: string, bucketUUID: string, file: File) {
    const formData = new FormData();
    formData.append('s3_file', file);
    formData.append('bucket_uuid', bucketUUID);
    formData.append('bucket_name', bucketName);
    return this.http.post<CeleryTaskV2>(UPLOAD_FILE_TO_UL_S3BUCKET(accountId), formData)
      .pipe(switchMap(res => this.appService.pollForTask(res.celery_task.task_id, 2, 50).pipe(take(1))), take(1));
  }

  getFileUploadHistory(bucketUUID: string): Observable<PaginatedResult<ULS3UploadedFile>> {
    return this.http.get<PaginatedResult<ULS3UploadedFile>>(GET_UL_S3_UPLOADED_FILES(bucketUUID));
  }

  convertFileHistoryViewData(files: ULS3UploadedFile[]): ULS3FileUploadsViewData[] {
    let viewData: ULS3FileUploadsViewData[] = [];
    files.map(file => {
      let a: ULS3FileUploadsViewData = new ULS3FileUploadsViewData();
      a.bucketName = file.bucket_name;
      a.fileName = file.file_name;
      a.uploadStatus = file.status;

      viewData.push(a);
    });
    return viewData;
  }

  resetAuthFormErrors() {
    return {
      'access_key': '',
      'secret_key': ''
    };
  }

  authFormValidationMessages = {
    'access_key': {
      'required': 'Access Key is required'
    },
    'secret_key': {
      'required': 'Secret Key is required'
    },
  }

  createAuthForm(bucketId: string, accessKey: string): FormGroup {
    return this.builder.group({
      'bucket_uuid': [bucketId],
      'access_key': [accessKey, [Validators.required, NoWhitespaceValidator]],
      'secret_key': ['', [Validators.required, NoWhitespaceValidator]]
    });
  }
}

export class ULS3ViewData {
  bucketName: string;
  bucketSize: number;
  creationDate: string;
  region: string;
  uuid: string;
}

export class ULS3FileUploadsViewData {
  bucketName: string;
  fileName: string;
  uploadStatus: string;
}
