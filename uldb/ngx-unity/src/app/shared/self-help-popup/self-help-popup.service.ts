import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { SelfHelpEndpointMapping } from './self-help-endpoint.enum';
import { GET_SELF_HELP_DATA } from '../api-endpoint.const';

@Injectable({
  providedIn: 'root'
})
export class SelfHelpPopupService {
  private selfHelpAnnouncedSource = new Subject<SelfHelpEndpointMapping>();
  selfHelpAnnounced$ = this.selfHelpAnnouncedSource.asObservable();
  constructor(private http: HttpClient) { }

  showHelp(mapping: SelfHelpEndpointMapping) {
    this.selfHelpAnnouncedSource.next(mapping);
  }

  getSelfHelpData(endpoint: SelfHelpEndpointMapping) {
    return this.http.get<{ heading: string, steps: string[] }>(GET_SELF_HELP_DATA(endpoint));
  }
}
