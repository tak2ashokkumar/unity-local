import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { OnBoardAssetsService, OnboardAssetViewData } from './on-board-assets.service';
import { Subject } from 'rxjs';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';

@Component({
  selector: 'on-board-assets',
  templateUrl: './on-board-assets.component.html',
  styleUrls: ['./on-board-assets.component.scss'],
  providers: [OnBoardAssetsService]
})
export class OnBoardAssetsComponent implements OnInit, OnDestroy {
  @Input() onbDetails: OnbDetails;
  @Output() reloadStatusDetails: EventEmitter<string> = new EventEmitter<string>();

  private ngUnsubscribe = new Subject();
  viewData: OnboardAssetViewData;

  @ViewChild('template') template: ElementRef;
  templateModalRef: BsModalRef;

  constructor(private modalService: BsModalService,
    private onBoardAssetsService: OnBoardAssetsService,
    private spinner: AppSpinnerService,
    private notificationService: AppNotificationService) { }

  ngOnInit() {
    this.viewData = this.onBoardAssetsService.converToViewData(this.onbDetails);
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onBoardAsset() {
    this.templateModalRef = this.modalService.show(this.template, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }))
  }

  emitEvent() {
    this.templateModalRef.hide();
    this.reloadStatusDetails.emit();
  }
}
