import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ENABLE_WELCOME_PAGE } from '../shared/api-endpoint.const';

@Injectable()
export class AppWelcomeServiceService {

  constructor(private http: HttpClient) { }

  setWelcomePageSetting(welcomePage: boolean) {
    return this.http.post(ENABLE_WELCOME_PAGE(), { enable_welcome_page: welcomePage });
  }

  accessKnowledgeService() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer extremely-insecure-cucumber',
      'access_token': 'extremely-insecure-cucumber'
    });
    return this.http.get(`http://10.192.11.235:4000/search/?query=a&top_n=5`, { headers: headers });
  }
}
