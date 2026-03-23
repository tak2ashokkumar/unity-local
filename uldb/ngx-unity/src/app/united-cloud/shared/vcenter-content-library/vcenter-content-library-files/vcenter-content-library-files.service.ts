import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AppLevelService } from 'src/app/app-level.service';
import { DELETE_FILE_FROM_VCENTER_CONTENT_LIBRARY, GET_VCENTER_CONTENT_LIBRARY_FILES, UPLOAD_FILE_TO_VCENTER_CONTENT_LIBRARY, UPLOAD_FILE_IN_CHUNKS, UPLOAD_LARGE_FILE_TO_VCENTER_CONTENT_LIBRARY } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';

@Injectable()
export class VcenterContentLibraryFilesService {

  constructor(private builder: FormBuilder,
    private http: HttpClient,
    private appService: AppLevelService) { }

  getFiles(pcId: string, libId: string) {
    return this.http.get<CeleryTask>(GET_VCENTER_CONTENT_LIBRARY_FILES(pcId, libId));
  }

  convertToViewdata(libraries: VcenterContentLibraryFileType[]) {
    let arr: VcenterContentLibraryFileViewdata[] = [];
    libraries.forEach(library => {
      let view = new VcenterContentLibraryFileViewdata();
      view.name = library.file_name;
      view.fileId = library.item_id;
      view.fileSize = library.file_size;
      view.type = library.type;
      arr.push(view);
    });
    return arr;
  }

  deleteFiles(pcId: string, libId: string, fileId: string) {
    return this.http.post<CeleryTask>(DELETE_FILE_FROM_VCENTER_CONTENT_LIBRARY(pcId), { 'library_id': libId, 'item_id': fileId });
  }

  createForm() {
    return this.builder.group({
      'item': ['', [Validators.required, NoWhitespaceValidator]],
      'item_name': ['', [Validators.required, NoWhitespaceValidator]],
    })
  }

  resetfileFormErrors() {
    return {
      'item': '',
      'item_name': '',
    }
  }

  fileValidationMessages = {
    'item': {
      'required': 'File is required'
    },
    'item_name': {
      'required': 'File name is required'
    },
  }

  saveFile(pcId: string, obj: FormData) {
    return this.http.post<CeleryTask>(UPLOAD_FILE_TO_VCENTER_CONTENT_LIBRARY(pcId), obj);
  }

  saveFileInChunks(file: File, chunkSize: number, formData: FormData) {
    return this.appService.saveFileInChunks(file, chunkSize, formData, UPLOAD_FILE_IN_CHUNKS());
  }

  uploadFileInChunks(obj: FormData): Observable<VcenterContentLibraryChunkType> {
    let headers = new HttpHeaders({
      'Content-Range': obj.get('contentRange').toString()
    });
    obj.delete('contentRange');
    return this.http.post<VcenterContentLibraryChunkType>(UPLOAD_FILE_IN_CHUNKS(), obj, { headers: headers });
  }

  saveLargeFile(pcId: string, uploadId: string, libId: string, itemName: string, fileName: string) {
    return this.http.post<CeleryTask>(UPLOAD_LARGE_FILE_TO_VCENTER_CONTENT_LIBRARY(pcId), { 'lib_id': libId, 'upload_id': uploadId, 'file_name': itemName, 'item_type': fileName.split('.').pop() });
  }
}

export class VcenterContentLibraryFileViewdata {
  constructor() { }
  name: string;
  fileId: string;
  fileSize: string;
  type: string;
}

export interface VcenterContentLibraryFileType {
  file_name: string;
  file_size: string;
  item_id: string;
  type: string;
}

export interface VcenterContentLibraryChunkType {
  expires: string;
  upload_id: string;
  offset: number;
}