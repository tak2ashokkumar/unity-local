import { Injectable } from '@angular/core';
import { UnitySupportService } from './unity-support.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { TicketMgmtList } from '../shared/SharedEntityTypes/ticket-mgmt-list.type';

@Injectable()
export class UnitySupportResolverService {

  constructor(private supportService: UnitySupportService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<SupportTabs[]> {
    return this.supportService.getTabs();
  }
}
export interface SupportTabs extends TicketMgmtList {
  url?: string;
}