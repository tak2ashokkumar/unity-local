import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TabData } from '../shared/tabdata';
import { UserInfoService } from '../shared/user-info.service';
import { AppWelcomeServiceService, CollectorCertificateViewData } from './app-welcome-service.service';
import { Router } from '@angular/router';
import { AppSpinnerService } from '../shared/app-spinner/app-spinner.service';
import { UnityModules, UnityPermissionSet } from '../shared/unity-rbac-permissions/unity-permission-set';
import { PermissionService } from '../shared/unity-rbac-permissions/unity-rbac-permission.service';


@Component({
  selector: 'app-welcome-page',
  templateUrl: './app-welcome-page.component.html',
  styleUrls: ['./app-welcome-page.component.scss'],
  providers: [AppWelcomeServiceService]
})
export class AppWelcomePageComponent implements OnInit, OnDestroy {
  public tabItems: TabData[] = tabItems;
  public ngUnsubscribe = new Subject();
  public unityCollectorPermisssionSet: UnityPermissionSet;
  public collectorCertificateViewData: CollectorCertificateViewData = new CollectorCertificateViewData();
  public showCertificateExpiryNotification = true;
  welcomePage: boolean;
  brandName: string = 'UnityOne AI';
  constructor(private welcomeService: AppWelcomeServiceService,
    public userSvc: UserInfoService,
    private router: Router,
    private spinnerSvc: AppSpinnerService,
    private permissionService: PermissionService) {
    this.unityCollectorPermisssionSet = this.permissionService.getPermissionSet(UnityModules.UNITY_COLLECTOR);
    if (this.userSvc.selfBrandedOrgName) {
      this.brandName = this.userSvc.selfBrandedOrgName;
      this.tabItems[0].name = 'Welcome to ' + this.brandName;
    }
  }

  ngOnInit() {
    if (this.unityCollectorPermisssionSet.view) {
      setTimeout(() => {
        this.getCollectorCertificateData();
      }, 0);
    }
    this.loadWelcomePageStatus();
    // this.accessKnowledgeService();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  loadWelcomePageStatus() {
    this.welcomePage = this.userSvc.goToWelcomePage;
  }

  onChangeWelcomePage() {
    this.welcomeService.setWelcomePageSetting(this.welcomePage).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.userSvc.loadUserData().then(() => this.loadWelcomePageStatus());
    }, err => {
      this.welcomePage = !this.welcomePage;
    });
  }

  getCollectorCertificateData(): void {
    this.spinnerSvc.start(this.collectorCertificateViewData.loader);
    this.welcomeService.getCollectorCertificateData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.collectorCertificateViewData = this.welcomeService.convertToCollectorCertiifcateViewData(data);
      this.showCertificateExpiryNotification = Boolean(this.collectorCertificateViewData.collectorMessage);
      this.spinnerSvc.stop(this.collectorCertificateViewData.loader);
    }, () => {
      this.showCertificateExpiryNotification = false;
      this.spinnerSvc.stop(this.collectorCertificateViewData.loader);
    });
  }

  goToCollectors() {
    this.router.navigate(['/setup/devices/connectivity']);
  }

  dismissCertificateExpiryNotification(): void {
    this.showCertificateExpiryNotification = false;
  }

  accessKnowledgeService() {
    this.welcomeService.accessKnowledgeService().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
    });
  }
}
export const tabItems: TabData[] = [
  {
    name: 'Welcome to UnityOne AI',
    url: '/welcomepage'
  }
];