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
      this.unityLogo = this.user.logo.includes('data:image') ? this.user.logo : 'data:image/png;base64,' + this.user.logo;
    }
  }

  ngOnDestroy(): void {
    this.changes.disconnect();
  }

  private input: ConsoleAccessInput;
  private stats: any;
  private lastStatsAt: Date;

  menuInput(input: ConsoleAccessInput) {
    this.input = input;
    this.buildNavItems();
  }

  menuStats(msg: any) {
    if (msg && msg.ok) {
      this.stats = msg.stats;
      this.lastStatsAt = new Date();
    } else if (!this.stats) {
      this.stats = { unavailable: true };
    }
    this.buildNavItems();
  }

  private buildNavItems() {
    if (!this.input) {
      return;
    }
    const items: any[] = [
      { name: `Device Name : ${this.input.deviceName}`, title: true },
      { name: `Ip Address : ${this.input.managementIp}`, title: true }
    ];
    const stats = this.stats;
    if (stats && stats.unavailable) {
      items.push({ name: 'Stats : Not available', title: true });
    } else if (stats) {
      if (stats.cpu_percent !== undefined) {
        items.push({ name: `CPU : ${stats.cpu_percent}%`, title: true });
      }
      if (stats.memory) {
        items.push({
          name: `RAM : ${this.formatKb(stats.memory.used_kb)} / ${this.formatKb(stats.memory.total_kb)} (${stats.memory.percent}%)`,
          title: true
        });
      }
      for (const disk of (stats.disks || [])) {
        items.push({
          name: `Storage ${disk.mount} : ${this.formatKb(disk.used_kb)} / ${this.formatKb(disk.total_kb)} (${disk.percent}%)`
            + (disk.avail_kb !== undefined ? ` · ${this.formatKb(disk.avail_kb)} free` : ''),
          title: true
        });
      }
      if (stats.load_avg) {
        items.push({ name: `Load Avg : ${stats.load_avg.join(' / ')}`, title: true });
      }
      if (this.lastStatsAt) {
        items.push({ name: `Stats updated : ${this.lastStatsAt.toLocaleTimeString()}`, title: true });
      }
    }
    this.navItems = items;
  }

  private formatKb(kb: number): string {
    const gb = kb / (1024 * 1024);
    if (gb >= 1) {
      return `${gb.toFixed(2)} GB`;
    }
    return `${Math.round(kb / 1024)} MB`;
  }
}
