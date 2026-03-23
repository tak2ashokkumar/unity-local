import { Component, OnDestroy, Inject, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { environment } from 'src/environments/environment';
import { UserInfoService } from '../shared/user-info.service';
import { ConsoleAccessInput } from '../shared/check-auth/check-auth.service';
import { StorageService, StorageType } from '../shared/app-storage/storage.service';

@Component({
  selector: 'app-termial-view',
  templateUrl: './app-termial-view.component.html',
  styleUrls: ['./app-termial-view.component.scss']
})
export class AppTermialViewComponent implements OnInit, OnDestroy {
  public navItems = [];
  public sidebarMinimized = true;
  private changes: MutationObserver;
  public element: HTMLElement;
  assetsUrl: string = environment.assetsUrl;
  unityLogo: string = this.assetsUrl + 'brand/Unityone-AI.png';

  constructor(public user: UserInfoService,
    private storage: StorageService,
    @Inject(DOCUMENT) _document?: any) {
    this.changes = new MutationObserver((mutations) => {
      this.sidebarMinimized = _document.body.classList.contains('sidebar-minimized');
    });
    this.element = _document.body;
    this.changes.observe(<Element>this.element, {
      attributes: true,
      attributeFilter: ['class']
    });
  }
  ngOnInit() {
    if (this.user.logo) {
      this.unityLogo = 'data:image/png;base64,' + this.user.logo;
    }
  }

  ngOnDestroy(): void {
    this.changes.disconnect();
  }

  menuInput(input: ConsoleAccessInput) {
    this.navItems = [
      {
        name: `Device Name : ${input.deviceName}`,
        title: true
      },
      {
        name: `Ip Address : ${input.managementIp}`,
        title: true
      }
    ]
  }
}
