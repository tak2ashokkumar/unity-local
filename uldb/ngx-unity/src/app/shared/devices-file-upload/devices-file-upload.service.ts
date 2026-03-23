import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class DevicesFileUploadService {

  constructor(private http: HttpClient) { }

  downloadCSV(deviceType: string, uuids?: string[]) {
    let params: HttpParams = new HttpParams();
    params = params.append('device_type', deviceType);
    uuids?.map(uuid => params = params.append('uuids', uuid));
    return this.http.get<{ file_path: string }>(`/customer/onboard_excel_data/get_bulk_upload_file/`, { params: params });
  }

  uploadFile<T>(file: File, deviceType: string, key: string) {
    const formData = new FormData();
    formData.append(key, file, file.name);
    formData.append('device_type', deviceType);
    return this.http.post(`/customer/onboard_excel_data/upload_bulk_update/`, formData);
  }

}
