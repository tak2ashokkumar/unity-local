import { Component, OnDestroy, Inject, OnInit, ElementRef, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NavData, GET_NAV_DATA } from './nav';
import { environment } from 'src/environments/environment';
import { ReportAnIssueService } from '../app-breadcrumb/report-an-issue/report-an-issue.service';
import { UserInfoService } from '../shared/user-info.service';
import { AppLevelService } from '../app-level.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MapService } from '../map.service';
import { AppMainService } from './app-main.service';

@Component({
  selector: 'app-main',
  templateUrl: './app-main.component.html',
  styleUrls: ['./app-main.component.scss']
})
export class AppMainComponent implements OnDestroy, OnInit {
  private ngUnsubscribe = new Subject();
  assetsUrl: string = environment.assetsUrl;
  unityLogo: string = this.assetsUrl + 'brand/Unityone-AI.png';
  public navItems: NavData[] = [];
  public sidebarMinimized = true;
  public sidebarHidden = false;
  private changes: MutationObserver;
  public element: HTMLElement;
  mainWidth: number = 0;
  contentHeight: string = '0px';

  constructor(private reportService: ReportAnIssueService,
    public user: UserInfoService,
    public appService: AppLevelService,
    public mapService: MapService,
    private elRef: ElementRef,
    private renderer: Renderer2,
    private mainService: AppMainService,
    @Inject(DOCUMENT) _document?: any) {
    this.changes = new MutationObserver((mutations) => {
      this.sidebarMinimized = _document.body.classList.contains('sidebar-minimized');
      this.mainWidth = this.sidebarMinimized ? 50 : 225;
      this.sidebarHidden = !_document.body.classList.contains('sidebar-lg-show');
      this.mainWidth = this.sidebarHidden ? 0 : this.sidebarMinimized ? 50 : 225;
    });
    this.element = _document.body;
    this.changes.observe(<Element>this.element, {
      attributes: true,
      attributeFilter: ['class']
    });
    // _document.querySelector('.app-footer').classList.remove('d-none');
  }
  ngOnInit() {
    this.navItems = GET_NAV_DATA(this.appService);
    if (this.user.logo) {
      this.unityLogo = 'data:image/png;base64,' + this.user.logo;
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.changes.disconnect();
  }

  reportAnIssue() {
    this.reportService.reportIssue();
  }

  logout() {
    this.appService.logout();
  }

  stopImpersonating() {
    this.appService.stopImpersonating();
  }
}