import { Component, OnDestroy, Inject, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { environment } from 'src/environments/environment';
import { ReportAnIssueService } from '../app-breadcrumb/report-an-issue/report-an-issue.service';
import { UserInfoService } from '../shared/user-info.service';
import { AppLevelService } from '../app-level.service';
import { FloatingTerminalService } from '../shared/floating-terminal/floating-terminal.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MapService } from '../map.service';
import { AppMainService, ChatbotDataType } from './app-main.service';
import { AppSearchService } from '../shared/app-search/app-search.service';
import { GET_UNITY_NAV_DATA, UnityNavData } from './unity-nav';

@Component({
  selector: 'app-main',
  templateUrl: './app-main.component.html',
  styleUrls: ['./app-main.component.scss']
})
export class AppMainComponent implements OnInit, OnDestroy {
  private readonly ngUnsubscribe = new Subject<void>();

  assetsUrl: string = environment.assetsUrl;
  unityLogo: string = this.assetsUrl + 'brand/Unityone-AI.png';
  public navItems: UnityNavData[] = [];
  public sidebarMinimized = true;
  public sidebarHidden = false;
  private changes: MutationObserver;
  public element: HTMLElement;
  mainWidth = 0;
  contentHeight = '0px';
  chatbotData: ChatbotDataType;

  constructor(
    private reportService: ReportAnIssueService,
    private searchService: AppSearchService,
    public user: UserInfoService,
    public appService: AppLevelService,
    public mapService: MapService,
    private terminalService: FloatingTerminalService,
    private mainService: AppMainService,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  ngOnInit(): void {
    // Nav items and custom tenant logo
    this.navItems = GET_UNITY_NAV_DATA(this.appService, this.user);
    if (this.user.logo) {
      this.unityLogo = this.user.logo.includes('data:image')
        ? this.user.logo
        : 'data:image/png;base64,' + this.user.logo;
    }

    // Watch sidebar class changes to compute spinner/content offset
    this.element = this.document.body;
    this.changes = new MutationObserver(() => {
      const body = this.document.body;
      this.sidebarMinimized = body.classList.contains('sidebar-minimized');
      this.sidebarHidden = !body.classList.contains('sidebar-lg-show');
      this.mainWidth = this.sidebarHidden ? 0 : this.sidebarMinimized ? 50 : 225;
    });
    this.changes.observe(this.element, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Subscriptions
    this.terminalService.resizeAnnounced$
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(res => { this.contentHeight = res; });

    this.mainService.$assistantData
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(val => { this.chatbotData = val; });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.changes.disconnect();
  }

  reportAnIssue(): void {
    this.reportService.reportIssue();
  }

  search(): void {
    this.searchService.searchByKeyword();
  }

  logout(): void {
    this.appService.logout();
  }

  stopImpersonating(): void {
    this.appService.stopImpersonating();
  }
}
