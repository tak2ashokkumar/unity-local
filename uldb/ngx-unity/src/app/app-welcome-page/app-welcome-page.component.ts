import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TabData } from '../shared/tabdata';
import { UserInfoService } from '../shared/user-info.service';
import { AppWelcomeServiceService } from './app-welcome-service.service';


@Component({
  selector: 'app-welcome-page',
  templateUrl: './app-welcome-page.component.html',
  styleUrls: ['./app-welcome-page.component.scss'],
  providers: [AppWelcomeServiceService]
})
export class AppWelcomePageComponent implements OnInit, OnDestroy {
  public tabItems: TabData[] = tabItems;
  public ngUnsubscribe = new Subject();
  welcomePage: boolean;
  brandName: string = 'UnityOne AI';
  constructor(private welcomeService: AppWelcomeServiceService,
    public userSvc: UserInfoService,) {
    if (this.userSvc.selfBrandedOrgName) {
      this.brandName = this.userSvc.selfBrandedOrgName;
      this.tabItems[0].name = 'Welcome to ' + this.brandName;
    }
  }

  ngOnInit() {
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