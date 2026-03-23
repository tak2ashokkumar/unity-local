import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {DOWNLOAD_REPORT} from 'src/app/shared/api-endpoint.const';

@Injectable()
export class ManageReportPreviewService {

  constructor(private http: HttpClient,) { }
  
  download(uuid: string) {
    return this.http.get<{ data: string }>(DOWNLOAD_REPORT(uuid));
  }
}