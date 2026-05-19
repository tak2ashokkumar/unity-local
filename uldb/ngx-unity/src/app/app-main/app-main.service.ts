import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppMainService {

  $assistantData = new Subject<ChatbotDataType>();

  private sidebarAnnouncedSource = new Subject<number>();
  sidebarAnnounced$ = this.sidebarAnnouncedSource.asObservable();

  constructor() { }

  sidebarChanges(chatbotWidth: number) {
    this.sidebarAnnouncedSource.next(chatbotWidth);
  }

}

export class ChatbotDataType {
  sourceName: string;
  entity?: string;
  entityId?: string | number;
  apiUrl?: string;
  metaData?: any;
}