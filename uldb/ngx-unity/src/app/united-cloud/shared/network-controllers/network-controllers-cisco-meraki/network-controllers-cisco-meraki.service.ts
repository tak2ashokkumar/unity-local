import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class NetworkControllersCiscoMerakiService {

  constructor() { }

  private organizationOrDeviceDataAnnouncedSource = new Subject<number>();
  organizationOrDeviceDataAnnounced$ = this.organizationOrDeviceDataAnnouncedSource.asObservable();

  organizationOrDeviceData(countData: number) {
    this.organizationOrDeviceDataAnnouncedSource.next(countData);
  }
}
