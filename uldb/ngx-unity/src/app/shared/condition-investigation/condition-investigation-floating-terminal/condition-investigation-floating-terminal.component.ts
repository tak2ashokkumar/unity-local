import { Component, OnDestroy, OnInit, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { Subject } from 'rxjs';
import { AuthType } from '../../check-auth/check-auth.service';
import { AppNotificationService } from '../../app-notification/app-notification.service';
import { AppSpinnerService } from '../../app-spinner/app-spinner.service';
import { ConditionInvestigationFloatingTerminalService } from './condition-investigation-floating-terminal.service';
import { ConditionInvestigationNewTerminalService } from '../condition-investigation-new-terminal/condition-investigation-new-terminal.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from '../../app-notification/notification.type';
import { ResizeEvent } from 'angular-resizable-element';
import { ConditionInvestigationTerminalWindowRegistryService } from '../condition-investigation-new-terminal/condition-investigation-terminal-window-registry.service';
import { ConditionInvestigationFloatingTerminalItemComponent } from './condition-investigation-floating-terminal-item/condition-investigation-floating-terminal-item.component';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ActivatedRoute } from '@angular/router';
import { ConditionInvestigationAuthModalService } from '../condition-investigation-auth-modal/condition-investigation-auth-modal.service';

@Component({
  selector: 'condition-investigation-floating-terminal',
  templateUrl: './condition-investigation-floating-terminal.component.html',
  styleUrls: ['./condition-investigation-floating-terminal.component.scss']
})
export class ConditionInvestigationFloatingTerminalComponent implements OnInit, OnDestroy {
  @ViewChildren(ConditionInvestigationFloatingTerminalItemComponent)
  terminalItems: QueryList<ConditionInvestigationFloatingTerminalItemComponent>;
  @ViewChild('addTerminalConfirmation')
  addTerminalConfirmation: TemplateRef<any>;
  addTerminalModalRef: BsModalRef;

  private ngUnsubscribe = new Subject();
  terms: { tabId: string, input: any, auth: AuthType }[] = [];
  activeIndex: number;
  show = false;
  autoRefresh = false;
  constructor(private notification: AppNotificationService,
    private spinner: AppSpinnerService,
    private termService: ConditionInvestigationFloatingTerminalService,
    private newTerminalService: ConditionInvestigationNewTerminalService,
    private windowRegistry: ConditionInvestigationTerminalWindowRegistryService,
    private modalService: BsModalService,
    private route: ActivatedRoute,
    private authApi: ConditionInvestigationAuthModalService) {
    this.newTerminalService.terminalData$
      .subscribe((data: any) => {
        const { input, auth } = data;
        this.terms.push({ tabId: input.tabId, input, auth });
        this.activeIndex = this.terms.length - 1;
        this.show = true;
        setTimeout(() => {
          this.style.height = '250px';
          this.resizeTerminal();
        }, 0);

      });
  }

  ngOnInit() {
    this.termService.switchTab$.subscribe(tabId => {
      this.switchToTabById(tabId);
    });
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

  openAddTerminalConfirmation() {
    this.addTerminalModalRef = this.modalService.show(this.addTerminalConfirmation, {
      class: '',
      keyboard: true,
      ignoreBackdropClick: true
    });
  }

  confirmAddTerminal(tabType: 'sameTab' | 'newTab') {
    const activeTerminal = this.terms[this.activeIndex];
    if (!activeTerminal) {
      return;
    }

    this.addTerminalModalRef.hide();

    const conditionId = this.route.snapshot.paramMap.get('conditionId');
    const conversationId = (activeTerminal.auth as any).conversation_id;

    const openAuthForm = (device?: any) => {
      this.newTerminalService.setBackendTabId(null);
      this.newTerminalService.setPendingTabType(tabType);
      this.newTerminalService.setConversationId(conversationId);
      const hasUsableDevice = device?.id || device?.host || device?.device_ip_address;
      this.newTerminalService.openTerminal({
        command: '',
        conditionId,
        conversationId,
        tabType,
        device: hasUsableDevice ? device : undefined
      });
    };

    this.authApi.getDefaultDevice(conditionId, conversationId)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
        (device: any) => openAuthForm(device),
        () => openAuthForm()
      );
  }

  openActiveTerminalInNewTab() {
    const activeTerminal = this.terms[this.activeIndex];
    if (!activeTerminal) {
      return;
    }

    const tabId = 'tab-' + Math.random().toString(36).substring(2, 10);
    const input = { ...activeTerminal.input, tabId };
    const auth: any = { ...activeTerminal.auth, tab_type: 'new' };
    const activeTerminalItem = this.terminalItems
      ?.find(item => item.termInput?.input?.tabId === activeTerminal.input.tabId);
    const terminalSnapshot = activeTerminalItem?.getTerminalSnapshot() || '';
    const terminalData = { input, auth, terminalSnapshot };

    const newWin = window.open(
      `/main#/terminal-new-tab?conversationId=${auth.conversation_id || ''}&tabId=${tabId}`,
      '_blank'
    );

    if (!newWin) {
      this.notification.error(new Notification('Unable to open terminal in a new window.'));
      return;
    }

    this.windowRegistry.register(tabId, newWin);
    this.sendTerminalDataToNewTab(tabId, terminalData);
  }

  private sendTerminalDataToNewTab(tabId: string, terminalData: any) {
    if (typeof BroadcastChannel === 'undefined') {
      return;
    }

    const channel = new BroadcastChannel('terminal-tabs');
    const payload = {
      type: 'OPEN_TERMINAL',
      tabId,
      terminalData
    };

    let attempts = 0;
    let interval: any;

    const closeChannel = () => {
      clearInterval(interval);
      channel.close();
    };

    channel.onmessage = (event) => {
      if (event.data.type === 'TERMINAL_ACK' && event.data.tabId === tabId) {
        closeChannel();
      }
    };

    const send = () => {
      channel.postMessage(payload);
      attempts++;
      if (attempts >= 10) {
        closeChannel();
      }
    };
    send();
    interval = setInterval(send, 250);
  }

  getDetails(input: any) {
    this.spinner.start('main');
    this.termService.getDetails(input.deviceType, input.tabId)
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
    this.terms.push({ tabId: input.tabId, input, auth });
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
    const tabId = this.terms[i]?.input?.tabId;
    if (tabId) {
      this.termService.setTabRunning(tabId, false); // update lastUsed
    }
  }

  switchToTabById(tabId: string) {
    const index = this.terms.findIndex(t => t.tabId === tabId);

    if (index !== -1) {
      this.goTo(index);
    }
  }

  private publishActiveIndex() {
    if (this.terms.length) {
      this.termService.tabChanged(this.terms[this.activeIndex].input.tabId, this.terms[this.activeIndex].input.deviceType);
    } else {
      this.termService.tabChanged(null, null);
    }
  }

}
