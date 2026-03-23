import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { CREATE_OCI_BUCKET, DELETE_OCI_BUCKET, OCI_BUCKETS_BY_ACCOUNT_ID, UPLOAD_FILE_TO_OCI_BUCKET } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService, NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { PublicCloudOciBuckets } from './oci-buckets.type';

@Injectable()
export class PublicCloudOciStorageServicesService {

  constructor(private http: HttpClient,
    private appService: AppLevelService,
    private builder: FormBuilder,
    private utilSvc: AppUtilityService, ) { }

  getBuckets(accountId: string): Observable<PublicCloudOciBuckets[]> {
    return this.http.get<PublicCloudOciBuckets[]>(OCI_BUCKETS_BY_ACCOUNT_ID(accountId));
  }

  convertToViewData(buckets: PublicCloudOciBuckets[]): PublicCloudOciBucketsView[] {
    let viewData: PublicCloudOciBucketsView[] = [];
    buckets.map(b => {
      let a: PublicCloudOciBucketsView = new PublicCloudOciBucketsView();
      a.name = b.name;
      a.namespace = b.namespace;
      a.createdTime = b.time_created ? this.utilSvc.toUnityOneDateFormat(b.time_created) : 'N/A';
      a.etag = b.etag;
      viewData.push(a);
    })
    return viewData;
  }

  resetFormErrors() {
    return {
      'bucket_name': '',
    };
  }

  validationMessages = {
    'bucket_name': {
      'required': 'Bucket Name is required'
    }
  }

  createForm(): FormGroup {
    return this.builder.group({
      'bucket_name': ['', [Validators.required, NoWhitespaceValidator]]
    });
  }

  createBucket(accountId: string, data: BucketFormData) {
    return this.http.post<any>(CREATE_OCI_BUCKET(accountId), data);
  }

  deleteBucket(accountId: string, bucketName: string) {
    let formData: BucketFormData = new BucketFormData();
    formData.bucket_name = bucketName;
    return this.http.post<any>(DELETE_OCI_BUCKET(accountId), formData);
  }

  uploadFileToBucket(accountId: string, bucketName: string, file: File) {
    const formData = new FormData();
    formData.append('bucket_name', bucketName);
    formData.append('oci_file', file);
    return this.http.post<CeleryTask>(UPLOAD_FILE_TO_OCI_BUCKET(accountId), formData)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 50).pipe(take(1))), take(1));
  }
}

export class PublicCloudOciBucketsView {
  name: string;
  namespace: string;
  createdTime: string;
  etag: string;
  constructor() { }
}

export class BucketFormData {
  bucket_name: string;
  constructor() { }
}
