import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { DELETE_FILE_FROM_OCI_BUCKET, LIST_OCI_BUCKET_FILES, UPLOAD_FILE_TO_OCI_BUCKET } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { PublicCloudOCIBucketFile } from '../../../public-cloud-oci-overview/public-cloud-oci-storage-services/oci-buckets.type';

@Injectable()
export class PublicCloudOciSummaryBucketFileService {

  constructor(private http: HttpClient,
    private appService: AppLevelService,
    private utilSvc: AppUtilityService) { }

  getBucketfiles(accountId: string, bucketName: string): Observable<PublicCloudOCIBucketFile[]> {
    return this.http.get<any>(LIST_OCI_BUCKET_FILES(accountId, bucketName));
  }

  convertToViewData(files: PublicCloudOCIBucketFile[]) {
    let viewData: PublicCloudOCIBucketFileView[] = [];
    files.map(f => {
      let a: PublicCloudOCIBucketFileView = new PublicCloudOCIBucketFileView();
      a.fileName = f.name;
      a.fileSize = f.size;
      a.lastModified = f.time_modified ? this.utilSvc.toUnityOneDateFormat(f.time_modified) : 'N/A';
      viewData.push(a);
    })
    return viewData;
  }

  uploadFileToBucket(accountId: string, bucketName: string, file: File) {
    const formData = new FormData();
    formData.append('bucket_name', bucketName);
    formData.append('oci_file', file);
    return this.http.post<CeleryTask>(UPLOAD_FILE_TO_OCI_BUCKET(accountId), formData)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 50).pipe(take(1))), take(1));
  }

  deleteFile(accountId: string, bucketName: string, fileName: string) {
    let formData: OCIFileFormData = new OCIFileFormData();
    formData.bucket_name = bucketName;
    formData.file_name = fileName;
    return this.http.post<CeleryTask>(DELETE_FILE_FROM_OCI_BUCKET(accountId), formData)
      .pipe(switchMap(res => this.appService.pollForTask(res.task_id, 2, 50).pipe(take(1))), take(1));
  }
}

export class PublicCloudOCIBucketFileView {
  fileName: string;
  fileSize: string;
  lastModified: string;
}

export class OCIFileFormData {
  bucket_name: string;
  file_name: string;
  constructor() { }
}
