import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SelfHelpPopupService } from './self-help-popup.service';
import { Subject } from 'rxjs';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { SelfHelpEndpointMapping } from './self-help-endpoint.enum';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'self-help-popup',
  templateUrl: './self-help-popup.component.html',
  styleUrls: ['./self-help-popup.component.scss']
})
export class SelfHelpPopupComponent implements OnInit {
  private ngUnsubscribe = new Subject();
  @ViewChild('helpModal') helpModal: ElementRef;
  modalRef: BsModalRef;
  heading: string;
  steps: string[] = [];
  constructor(private popupService: SelfHelpPopupService,
    private modalService: BsModalService) {
    this.popupService.selfHelpAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.modalRef = null;
      this.openPopup(res);
    });
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  openPopup(mapping: SelfHelpEndpointMapping) {
    this.popupService.getSelfHelpData(mapping).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.heading = res.heading;
      this.steps = res.steps;
      this.modalRef = this.modalService.show(this.helpModal, Object.assign({}, { class: 'modal-lg', keyboard: true, ignoreBackdropClick: true }));
    }, err => {

    });
  }

  closePopup() {
    this.heading = '';
    this.steps = [];
    this.modalRef.hide();
  }

}
