import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { DELETE_UL_S3_FILES, LIST_UL_S3_FILES, UPLOAD_FILE_TO_UL_S3BUCKET } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CeleryTaskV2 } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { ULS3BucketFiles } from '../../ul-s3-type';

@Injectable()
export class UnityS3BucketFilesService {

  constructor(private http: HttpClient,
    private appService: AppLevelService,
    private builder: FormBuilder,
    private utilSvc: AppUtilityService) { }

  getBucketfiles(accountId: string, bucketName: string) {
    return this.http.get<CeleryTaskV2>(LIST_UL_S3_FILES(accountId, bucketName))
      .pipe(switchMap(res => this.appService.pollForTask(res.celery_task.task_id, 2, 50).pipe(take(1))), take(1));
  }

  convertToViewData(files: ULS3BucketFiles[]): UnityS3BucketFilesViewData[] {
    let view: UnityS3BucketFilesViewData[] = [];
    files.map(file => {
      let data = new UnityS3BucketFilesViewData();
      data.fileName = file.file_name;
      data.fileSize = file.file_size.toString();
      data.lastModified = file.last_modified ? this.utilSvc.toUnityOneDateFormat(file.last_modified) : 'N/A';
      data.accountAccessKey = file.access_key;
      view.push(data);
    });
    return view;
  }

  uploadFileToS3(accountId: string, bucketId: string, file: File) {
    const formData = new FormData();
    formData.append('s3_file', file);
    formData.append('bucket_uuid', bucketId);
    return this.http.post<CeleryTaskV2>(UPLOAD_FILE_TO_UL_S3BUCKET(accountId), formData)
      .pipe(switchMap(res => this.appService.pollForTask(res.celery_task.task_id, 2, 50).pipe(take(1))), take(1));
  }

  resetFormErrors() {
    return {
      'access_key': '',
      'secret_key': ''
    };
  }

  validationMessages = {
    'access_key': {
      'required': 'Access Key is required'
    },
    'secret_key': {
      'required': 'Secret Key is required'
    },
  }

  createForm(file: UnityS3BucketFilesViewData): FormGroup {
    return this.builder.group({
      'file_name': [file.fileName],
      'access_key': [file.accountAccessKey ? file.accountAccessKey : '', [Validators.required, NoWhitespaceValidator]],
      'secret_key': ['', [Validators.required, NoWhitespaceValidator]]
    });
  }

  deleteFile(accountId: string, bucketId: string, formData: any) {
    return this.http.post<CeleryTaskV2>(DELETE_UL_S3_FILES(accountId, bucketId), formData)
      .pipe(switchMap(res => this.appService.pollForTask(res.celery_task.task_id, 2, 50).pipe(take(1))), take(1));
  }
}

export class UnityS3BucketFilesViewData {
  fileName: string;
  fileSize: string;
  lastModified: string;
  accountAccessKey: string;
  constructor() { }
}
