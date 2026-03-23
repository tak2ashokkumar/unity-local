import { Injectable } from '@angular/core';
import {
  Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';

import { PrivateCloudService } from './private-cloud.service';
import { PCTabs } from './tabs';

@Injectable()
export class PrivateCloudResolverService implements Resolve<PCTabs[]> {

  constructor(private pcService: PrivateCloudService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<PCTabs[]> {
    return this.pcService.getPrivateClouds();
  }
}
