import { Component, OnDestroy, Inject, OnInit, ElementRef, Renderer2 } from '@angular/core';
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
export class AppMainComponent implements OnDestroy, OnInit {
  private ngUnsubscribe = new Subject();
  assetsUrl: string = environment.assetsUrl;
  unityLogo: string = this.assetsUrl + 'brand/Unityone-AI.png';
  public navItems: UnityNavData[] = [];
  public sidebarMinimized = true;
  public sidebarHidden = false;
  private changes: MutationObserver;
  public element: HTMLElement;
  mainWidth: number = 0;
  contentHeight: string = '0px';
  chatbotData: ChatbotDataType;

  constructor(private reportService: ReportAnIssueService,
    private searchService: AppSearchService,
    public user: UserInfoService,
    public appService: AppLevelService,
    public mapService: MapService,
    private terminalService: FloatingTerminalService,
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
    this.terminalService.resizeAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.contentHeight = res;
    });
    _document.querySelector('.app-footer')?.classList?.remove('d-none');
  }

  ngOnInit() {
    this.navItems = GET_UNITY_NAV_DATA(this.appService, this.user);
    // console.log('org name : ', this.user.userOrg)
    if (this.user.logo) {
      this.unityLogo = this.user.logo.includes('data:image') ? this.user.logo : 'data:image/png;base64,' + this.user.logo;
    }
    this.mainService.$assistantData.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      this.chatbotData = val;
    });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.changes.disconnect();
  }

  reportAnIssue() {
    this.reportService.reportIssue();
  }

  search() {
    this.searchService.searchByKeyword();
  }

  logout() {
    this.appService.logout();
  }

  stopImpersonating() {
    this.appService.stopImpersonating();
  }
}