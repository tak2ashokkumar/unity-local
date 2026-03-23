import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DELETE_UPLOADED_FILES_DETAILS, GET_EXCEL_ONBARDING_FILE_PATH, GET_UPLOADED_FILES_DETAILS, ON_BOARD_EXCEL_FILE } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';

@Injectable()
export class ExcelOnBoardFilesService {
  constructor(private http: HttpClient,
    private utilSvc: AppUtilityService) { }

  getFiles() {
    return this.http.get<PaginatedResult<ExcelOnboardingFilesType>>(GET_UPLOADED_FILES_DETAILS());
  }

  deleteFile(uuid: string) {
    return this.http.put(DELETE_UPLOADED_FILES_DETAILS(uuid), null);
  }

  getExcelOnboardingFile() {
    return this.http.get<{ file_path: string }>(GET_EXCEL_ONBARDING_FILE_PATH());
  }

  uploadFile<T>(file: File, key: string) {
    const formData = new FormData();
    formData.append(key, file, file.name);
    return this.http.post(ON_BOARD_EXCEL_FILE(), formData);
  }

  private getStatusCount(data: FileOnbSstatus) {
    let total = 0;
    let success = 0;
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const element = data[key];
        total += element.count;
        success += element.success;
      }
    }
    return { total: total, success: success }
  }

  convertToViewdata(data: ExcelOnboardingFilesType[]): ExcelOnboardingFilesViewdata[] {
    let viewData: ExcelOnboardingFilesViewdata[] = [];
    data.forEach(d => {
      let view = new ExcelOnboardingFilesViewdata();
      view.uuid = d.uuid;
      view.fileName = d.file_name;
      view.filePath = d.file_path;
      view.uploadedOn = d.updated_at ? this.utilSvc.toUnityOneDateFormat(d.updated_at) : 'N/A';
      view.user = d.user;
      view.status = this.getStatusCount(d.onb_status)
      viewData.push(view);
    });
    return viewData;
  }
}

export class ExcelOnboardingFilesViewdata {
  uuid: string;
  user: string;
  uploadedOn: string;
  fileName: string;
  status: { total: number; success: number };
  isSelected: boolean = false;
  filePath: string;
}

export interface ExcelOnboardingFilesType {
  uuid: string;
  user: string;
  updated_at: string;
  file_name: string;
  onb_status: FileOnbSstatus;
  file_path: string;
}

interface FileOnbSstatus {
  [key: string]: {
    count: number;
    failed: number;
    success: number;
  }
}