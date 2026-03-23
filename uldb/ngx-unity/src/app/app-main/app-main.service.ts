import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppMainService {

  $assistantData = new Subject<ChatbotDataType>();

  constructor() { }

}

export class ChatbotDataType {
  sourceName: string;
  entity?: string;
  entityId?: string | number;
  apiUrl?: string;
  metaData?: any;
}