import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { AuthType } from '../../check-auth/check-auth.service';
import { AppNotificationService } from '../../app-notification/app-notification.service';
import { AppSpinnerService } from '../../app-spinner/app-spinner.service';
import { ConditionInvestigationFloatingTerminalService } from './condition-investigation-floating-terminal.service';
import { ConditionInvestigationNewTerminalService } from '../condition-investigation-new-terminal/condition-investigation-new-terminal.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from '../../app-notification/notification.type';
import { ResizeEvent } from 'angular-resizable-element';

@Component({
  selector: 'condition-investigation-floating-terminal',
  templateUrl: './condition-investigation-floating-terminal.component.html',
  styleUrls: ['./condition-investigation-floating-terminal.component.scss']
})
export class ConditionInvestigationFloatingTerminalComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  terms: { input: any, auth: AuthType }[] = [];
  activeIndex: number;
  show = false;
  autoRefresh = false;
  constructor(private notification: AppNotificationService,
    private spinner: AppSpinnerService,
    private termService: ConditionInvestigationFloatingTerminalService,
    private newTerminalService: ConditionInvestigationNewTerminalService) {
    this.newTerminalService.terminalData$
      .subscribe((data: any) => {
        const { input, auth } = data;
        this.terms.push({ input, auth });
        this.activeIndex = this.terms.length - 1;
        this.show = true;
        setTimeout(() => {
          this.style.height = '250px';
          this.resizeTerminal();
        }, 0);

      });
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public style: { height: string } = { height: '0px' };

  validate(event: ResizeEvent): boolean {
    const MIN_DIMENSIONS_PX = 40;
    const MAX_DIMENSIONS_PX = window.innerHeight - 55;
    if (event.rectangle.height && ((event.rectangle.height < MIN_DIMENSIONS_PX) || (event.rectangle.height > MAX_DIMENSIONS_PX))) {
      return false;
    }
    return true;
  }

  onResizeEnd(event: ResizeEvent): void {
    this.style.height = `${event.rectangle.height}px`;
    this.resizeTerminal();
    this.autoRefresh = true;
    this.termService.termToggled(this.autoRefresh);
  }

  maximize() {
    this.style.height = `calc(100% - 55px)`;
    this.resizeTerminal();
    this.autoRefresh = true;
    this.termService.termToggled(this.autoRefresh);
  }

  restore() {
    this.style.height = `250px`;
    this.resizeTerminal();
    this.autoRefresh = true;
    this.termService.termToggled(this.autoRefresh);
  }

  minimize() {
    this.style.height = `40px`;
    this.resizeTerminal();
    this.autoRefresh = false;
    this.termService.termToggled(this.autoRefresh);
  }

  closeTerminal() {
    this.terms = [];
    this.termService.resizEnd('0px');
    this.show = false;
    this.autoRefresh = false;
    this.termService.termToggled(this.autoRefresh);
    this.publishActiveIndex();
  }

  getDetails(input: any) {
    this.spinner.start('main');
    this.termService.getDetails(input.deviceType, input.deviceId)
      .pipe(takeUntil(this.ngUnsubscribe)).subscribe(
        (res: any) => {
          input.managementIp = res;
          this.spinner.stop('main');
          this.openTerminalDirect(input, {});
        },
        err => {
          this.spinner.stop('main');
          this.notification.error(new Notification('Error while fetching VM details. Please contact support'));
        }
      );
  }

  openTerminalDirect(input, auth) {
    this.terms.push({ input, auth });
    this.activeIndex = this.terms.length - 1;
    this.show = true;
  }

  // checkAuthentication(input: any) {
  //   this.authService.checkAuth({
  //     label: input.deviceName, deviceType: input.deviceType,
  //     deviceId: input.deviceId, managementIp: input.managementIp, port: input.port, newTab: false, deviceName: input.deviceName,
  //     userName: input.userName, osType: input.osType, ipType: input.ipType
  //   }).pipe(take(1))
  //     .subscribe(res => {
  //       if (res != null) {
  //         this.terms.push({ input: input, auth: res });
  //         this.activeIndex = this.terms.length - 1;
  //         this.show = true;
  //         this.autoRefresh = true;
  //         this.termService.termToggled(this.autoRefresh);
  //         this.publishActiveIndex();
  //         if (this.activeIndex == 0) {
  //           setTimeout(() => {
  //             this.style.height = '250px';
  //             this.setHeightToContainer();
  //           }, 0);
  //         }
  //       }
  //     });
  // }

  resizeTerminal() {
    setTimeout(() => {
      this.setHeightToContainer();
    }, 0);
  }

  setHeightToContainer() {
    this.termService.resizEnd(this.style.height);
    let ele = document.getElementsByClassName('terminal-container')[0];
    ele.setAttribute('style', 'height:' + '100%');
  }

  close(i: number) {
    this.terms.splice(i, 1);
    let curLen = this.terms.length;
    if (curLen) {
      if (curLen - 1 >= i) {
        this.goTo(i);
      } else if (i > curLen - 1) {
        this.goTo(curLen - 1);
      }
    } else {
      this.closeTerminal();
    }
  }

  goTo(i: number) {
    this.activeIndex = i;
    this.publishActiveIndex();
  }

  private publishActiveIndex() {
    if (this.terms.length) {
      this.termService.tabChanged(this.terms[this.activeIndex].input.deviceId, this.terms[this.activeIndex].input.deviceType);
    } else {
      this.termService.tabChanged(null, null);
    }
  }

}
