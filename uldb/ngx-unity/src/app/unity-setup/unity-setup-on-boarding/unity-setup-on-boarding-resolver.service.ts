import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { GET_AGENT_CONFIGURATIONS } from 'src/app/shared/api-endpoint.const';
import { TabData } from 'src/app/shared/tabdata';

@Injectable()
export class UnitySetupOnBoardingResolverService {

  constructor(private http: HttpClient) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<PaginatedResult<any>> {
    return this.http.get<PaginatedResult<any>>(GET_AGENT_CONFIGURATIONS());
  }
}