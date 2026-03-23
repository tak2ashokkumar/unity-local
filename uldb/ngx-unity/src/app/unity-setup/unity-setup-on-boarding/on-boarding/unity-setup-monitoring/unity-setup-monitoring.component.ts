import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { UnitySetupMonitoringService, OnnboardMonitoringViewData } from './unity-setup-monitoring.service';
import { AppLevelService } from 'src/app/app-level.service';
import { take } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'unity-setup-monitoring',
  templateUrl: './unity-setup-monitoring.component.html',
  styleUrls: ['./unity-setup-monitoring.component.scss'],
  providers: [UnitySetupMonitoringService]
})
export class UnitySetupMonitoringComponent implements OnInit, OnDestroy {
  @Input() onbDetails: OnbDetails;
  @Output() reloadStatusDetails: EventEmitter<string> = new EventEmitter<string>();

  private ngUnsubscribe = new Subject();
  viewData: OnnboardMonitoringViewData;

  selectedTab: string = 'vm-monitoring';

  @ViewChild('template') template: ElementRef;
  templateModalRef: BsModalRef;

  constructor(private modalService: BsModalService,
    private setupMonitoringService: UnitySetupMonitoringService,
    private appService: AppLevelService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService) { }

  ngOnInit() {
    this.viewData = this.setupMonitoringService.converToViewData(this.onbDetails);
  }
  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  monitor() {
    this.templateModalRef = this.modalService.show(this.template, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }))
  }

  emitEvent() {
    this.templateModalRef.hide();
    this.reloadStatusDetails.emit();
  }

  /**
   * DO NOT UNSUBSCIBE USING `ngUnsubscribe` CODE NEEDS TO 
   * EXECUTE ATLEAST ONCE EVEN IF COMPONENT IS DESTORYED
   * @param taskId 
   */
  pollForTask(taskId: string) {
    this.emitEvent();
    this.appService.pollForTask(taskId).pipe(take(1)).subscribe(res => {
      if (!res.result.length) {
        this.notification.success(new Notification('Monitoring for all the devices activeted successfully'));
      } else {
        this.notification.error(new Notification('Error while activating monitoring. Please contact support@unityonecloud.com'));
      }
    }, err => {
      this.notification.error(new Notification('Error while activating monitoring. Please contact support@unityonecloud.com'));
    });
  }
}