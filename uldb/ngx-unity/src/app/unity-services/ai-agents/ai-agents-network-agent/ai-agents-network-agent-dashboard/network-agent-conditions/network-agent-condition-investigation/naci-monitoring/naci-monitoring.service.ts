import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class NaciMonitoringService {

  private toggleAnnouncedSource = new Subject<string>();
  toggleAnnouncedSourceAnnounced$ = this.toggleAnnouncedSource.asObservable();

  constructor() { }

  toggle(StepName: string) {
    this.toggleAnnouncedSource.next(StepName);
  }
}