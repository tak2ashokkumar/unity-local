import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AIMLSourceData } from 'src/app/shared/SharedEntityTypes/aiml.type';
import { CorrelationRuleFields } from './aiml-rules.type';

@Injectable()
export class AimlRulesService {

  constructor(private http: HttpClient) { }

  getEventSources(): Observable<AIMLSourceData[]> {
    return this.http.get<AIMLSourceData[]>(`customer/aiops/event-source/?page_size=0`).pipe(map(res => res.filter(r => r.source)));
  }

  getEventTypes(): Observable<AIMLSourceData[]> {
    return this.http.get<AIMLSourceData[]>(`customer/aiops/event-types/unique-names/`);
  }

  getEventCategories(): Observable<AIMLSourceData[]> {
    return this.http.get<AIMLSourceData[]>(`customer/aiops/event-categories/unique-names/`);
  }

  getDropdownData(): Observable<{ sources: AIMLSourceData[], eventTypes: string[], eventCategories: string[] }> {
    return forkJoin({
      sources: this.getEventSources().pipe(catchError(error => of(undefined))),
      eventTypes: this.getEventTypes().pipe(catchError(error => of(undefined))),
      eventCategories: this.getEventCategories().pipe(catchError(error => of(undefined))),
    })
  }

  getDropdownFields(): Observable<CorrelationRuleFields[]> {
    return this.http.get<CorrelationRuleFields[]>(`customer/aiops/correlation_rules/field_meta/`);
  }
}
