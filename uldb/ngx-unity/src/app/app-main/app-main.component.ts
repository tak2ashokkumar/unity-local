import { DOCUMENT } from '@angular/common';
import { Component, HostListener, Inject, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ReportAnIssueService } from '../app-breadcrumb/report-an-issue/report-an-issue.service';
import { AppLevelService } from '../app-level.service';
import { MapService } from '../map.service';
import { AppSearchService } from '../shared/app-search/app-search.service';
import { FloatingTerminalService } from '../shared/floating-terminal/floating-terminal.service';
import { UserInfoService } from '../shared/user-info.service';
import { AppMainService, ChatbotDataType } from './app-main.service';
import { GET_UNITY_NAV_DATA, UnityNavData } from './unity-nav';
import { PermissionService } from '../shared/unity-rbac-permissions/unity-rbac-permission.service';

@Component({
  selector: 'app-main',
  templateUrl: './app-main.component.html',
  styleUrls: ['./app-main.component.scss']
})
export class AppMainComponent implements OnInit, OnDestroy {
  private readonly ngUnsubscribe = new Subject<void>();
  private readonly sidebarMinimizedClass = 'sidebar-minimized';
  private readonly brandMinimizedClass = 'brand-minimized';
  private readonly chatbotOpenClass = 'unity-chatbot-open';
  private readonly chatbotExpandedClass = 'unity-chatbot-expanded';
  private sidebarWasMinimizedBeforeChat = false;
  private brandWasMinimizedBeforeChat = false;
  private chatbotChangedSidebar = false;
  assetsUrl: string = environment.assetsUrl;
  unityLogo: string = this.assetsUrl + 'brand/Unityone-AI.png';
  public navItems: UnityNavData[] = [];
  public sidebarMinimized = true;
  public sidebarHidden = false;
  public unityChatbotOpen = false;
  public unityChatbotExpanded = false;
  public modalOpen = false;
  private changes: MutationObserver;
  public element: HTMLElement;
  mainWidth = 0;
  contentHeight = '0px';
  chatbotData: ChatbotDataType;
  isPlayground: boolean;

  public trialPopupOpen = false;
  constructor(private appMainSvc: AppMainService,
    private reportService: ReportAnIssueService,
    private searchService: AppSearchService,
    public user: UserInfoService,
    public appService: AppLevelService,
    private permissionService: PermissionService,
    public mapService: MapService,
    private terminalService: FloatingTerminalService,
    private mainService: AppMainService,
    @Inject(DOCUMENT) private readonly document: Document) {
  }

  ngOnInit() {
    // Nav items and custom tenant logo
    this.navItems = GET_UNITY_NAV_DATA(this.permissionService, this.user);
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
      this.unityChatbotOpen = body.classList.contains('unity-chatbot-open');
      this.modalOpen = body.classList.contains('modal-open');
      const isChatbotActive = this.unityChatbotOpen && !this.modalOpen;
      const chatbotWidth = isChatbotActive ? 420 : 0;
      this.mainWidth = this.sidebarHidden ? 0 : this.sidebarMinimized ? 50 + chatbotWidth : 225;
      this.appMainSvc.sidebarChanges(chatbotWidth);
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

    this.isPlayground = this.isOrgPlayground();
  }

  ngOnDestroy(): void {
    this.clearChatbotShellState();
    this.restoreSidebarAfterChatbot();
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

  @HostListener('document:click')
  closeTrialPopup(): void {
    this.trialPopupOpen = false;
  }

  isOrgPlayground(): boolean {
    return this.user.userDetails.org.name == 'Playground'
  }

  openFreeTrial() {
    window.open('https://unityone.ai/free-trial/', '_blank');
  }

  onChatbotStateChange(state: { isOpen: boolean; isExpanded: boolean }): void {
    this.applyChatbotShellState(state);

    if (state.isOpen) {
      this.minimizeSidebarForChatbot();
    } else {
      this.restoreSidebarAfterChatbot();
    }
  }

  private applyChatbotShellState(state: { isOpen: boolean; isExpanded: boolean }): void {
    const body = this.document.body;
    body.classList.toggle(this.chatbotOpenClass, state.isOpen);
    body.classList.toggle(this.chatbotExpandedClass, state.isOpen && state.isExpanded);
  }

  private clearChatbotShellState(): void {
    const body = this.document.body;
    body.classList.remove(this.chatbotOpenClass);
    body.classList.remove(this.chatbotExpandedClass);
  }

  private minimizeSidebarForChatbot(): void {
    if (this.chatbotChangedSidebar) {
      return;
    }
    const body = this.document.body;
    this.sidebarWasMinimizedBeforeChat = body.classList.contains(this.sidebarMinimizedClass);
    this.brandWasMinimizedBeforeChat = body.classList.contains(this.brandMinimizedClass);
    this.chatbotChangedSidebar = true;

    if (!this.sidebarWasMinimizedBeforeChat) {
      body.classList.add(this.sidebarMinimizedClass);
    }
    if (!this.brandWasMinimizedBeforeChat) {
      body.classList.add(this.brandMinimizedClass);
    }
  }

  private restoreSidebarAfterChatbot(): void {
    if (!this.chatbotChangedSidebar) {
      return;
    }
    const body = this.document.body;
    if (!this.sidebarWasMinimizedBeforeChat) {
      body.classList.remove(this.sidebarMinimizedClass);
    }
    if (!this.brandWasMinimizedBeforeChat) {
      body.classList.remove(this.brandMinimizedClass);
    }
    this.sidebarWasMinimizedBeforeChat = false;
    this.brandWasMinimizedBeforeChat = false;
    this.chatbotChangedSidebar = false;
  }
}
