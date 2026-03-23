import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GET_VCENTER_CONTENT_LIBRARIES } from 'src/app/shared/api-endpoint.const';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';

@Injectable()
export class VcenterContentLibraryService {

  constructor(private http: HttpClient,
    private utilSvc: AppUtilityService) { }

  getLibraries(pcId: string) {
    return this.http.get<CeleryTask>(GET_VCENTER_CONTENT_LIBRARIES(pcId));
  }

  convertToViewdata(libraries: VcenterContentLibraryType[]) {
    let arr: VcenterContentLibraryViewdata[] = [];
    libraries.forEach(l => {
      let view = new VcenterContentLibraryViewdata();
      view.name = l.name;
      view.libId = l.id;
      view.type = l.type;
      view.createdAt = l.created ? this.utilSvc.toUnityOneDateFormat(l.created) : 'N/A';
      view.lastUpdated = l.last_updated ? this.utilSvc.toUnityOneDateFormat(l.last_updated) : 'N/A';
      arr.push(view);
    });
    return arr;
  }
}

export class VcenterContentLibraryViewdata {
  constructor() { }
  name: string;
  libId: string;
  lastUpdated: string;
  createdAt: string;;
  type: string;
}

export interface VcenterContentLibraryType {
  id: string;
  last_updated: string;
  type: string;
  name: string;
  created: string;
}