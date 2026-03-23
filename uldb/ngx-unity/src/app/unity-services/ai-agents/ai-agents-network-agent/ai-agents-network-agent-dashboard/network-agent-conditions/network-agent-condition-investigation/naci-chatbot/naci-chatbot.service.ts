import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { environment } from 'src/environments/environment';

@Injectable()
export class NaciChatbotService {

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  getResponse(data: any) {
    return this.http.post(`${environment.networkAgentHostUrl}v1/investigate/`, data);
  }

  buildForm() {
    return this.builder.group({
      'chat': ['']
    });
  }
}
