import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { empty, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { MappedMonitoringTool } from 'src/app/shared/SharedEntityTypes/monitoring-tool-mapping.type';
import { TabData } from 'src/app/shared/tabdata';
import { UnitedConnectTabItems, zabbixUnitedConnectTabItems } from './tabs';

@Injectable({
  providedIn: 'root'
})
export class UnityconnectResolverService {

  constructor(private http: HttpClient,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService,
    private appService: AppLevelService, ) { }

  resolve(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<TabData[]> {
    this.spinner.start('main');
    let isZabbixMonitoring: boolean = true;
    return this.appService.getMappedMonitoringTool().pipe(map(
      (res: MappedMonitoringTool) => {
        this.spinner.stop('main');
        Object.values(res).map(v => {
          if (v.observium) {
            isZabbixMonitoring = false;
          }
        })
        if (isZabbixMonitoring) {
          return zabbixUnitedConnectTabItems;
        } else {
          return UnitedConnectTabItems;
        }
      }),
      catchError((err: HttpErrorResponse) => {
        this.spinner.stop('main');
        this.notification.error(new Notification('Unable to fetch alerts. Please contact Administrator (support@unityonecloud.com)'));
        return empty();
      })
    );
  }
}
