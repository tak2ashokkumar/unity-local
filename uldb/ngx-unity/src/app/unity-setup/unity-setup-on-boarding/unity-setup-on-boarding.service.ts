import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { UnityModules } from 'src/app/shared/permissions/unity-modules';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { GET_AGENT_CONFIGURATIONS } from 'src/app/shared/api-endpoint.const';

@Injectable()
export class UnitySetupOnBoardingService {

  constructor(private http: HttpClient) { }

  getCollectorsCount() {
    return this.http.get<PaginatedResult<any>>(GET_AGENT_CONFIGURATIONS()).pipe(map(res => res.count));
  }
}
export interface OnboardingTabStepType {
  icon: string;
  stepName: string;
  url: string;
  active: boolean;
  disabled?: boolean;
  className: string;

  // permission set
  module?: UnityModules;
}
