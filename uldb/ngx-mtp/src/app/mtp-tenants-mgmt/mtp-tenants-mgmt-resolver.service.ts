import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { MtpTenantsMgmtService, TenantGroupViewData } from './mtp-tenants-mgmt.service';
import { EMPTY, Observable } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { AppSpinnerService } from '../shared/app-spinner/app-spinner.service';

@Injectable()
export class MtpTenantsMgmtResolverService implements Resolve<TenantGroupViewData[]> {

  constructor(private tenantMgmtSvc: MtpTenantsMgmtService,
    private spinner: AppSpinnerService) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<TenantGroupViewData[]> {
    // this.spinner.start('main');
    // return this.tenantMgmtSvc.getTenantGroups().pipe(map(res => {
    //   this.spinner.stop('main');
    //   return res;
    // }), catchError((err: HttpErrorResponse) => {
    //   this.spinner.stop('main');
    //   return EMPTY;
    // }));
    return
  }

}
