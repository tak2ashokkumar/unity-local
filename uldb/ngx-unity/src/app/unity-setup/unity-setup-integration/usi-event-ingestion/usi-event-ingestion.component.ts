import { Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { UsiAccountViewData, UsiEventIngestionTableColumnsModel, UsiEventIngestionTablleActionsModel } from '../unity-setup-integration.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { UsiEventIngestionService } from './usi-event-ingestion.service';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'usi-event-ingestion',
  templateUrl: './usi-event-ingestion.component.html',
  styleUrls: ['./usi-event-ingestion.component.scss']
})
export class UsiEventIngestionComponent implements OnInit {

  @Input() count: number;
  @Input() currentCriteria: SearchCriteria;
  @Input() viewData: any;
  @Input() columnFlags: UsiEventIngestionTableColumnsModel;
  @Input() actionFlags: UsiEventIngestionTablleActionsModel;
  @Output() searchedField = new EventEmitter<string>();
  @Output() refresh = new EventEmitter<number>();
  @Output() test = new EventEmitter<any>();
  @Output() copyKey = new EventEmitter<string>();
  @Output() copyUrl = new EventEmitter<string>();
  @Output() edit = new EventEmitter<UsiAccountViewData>();
  @Output() delete = new EventEmitter<UsiAccountViewData>();
  @ViewChild('confirm') confirm: ElementRef;
  deleteModalRef: BsModalRef;
  @ViewChild('payload') payload: ElementRef;
  payloadModalRef: BsModalRef;
  selectedView: UsiAccountViewData;
  payloadForm: FormGroup;
  payloadFormErrors: any;
  payloadValidationMessages: any;
  isSubmit: boolean = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private service: UsiEventIngestionService,
    private modalService: BsModalService
  ) { }

  ngOnInit(): void {
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  onSearched(searchedVal) {
    this.searchedField.emit(searchedVal);
  }

  refreshData(event) {
    this.refresh.emit(event);
  }

  cpyKey(key: string) {
    this.copyKey.emit(key);
  }

  cpyUrl(url: string) {
    this.copyUrl.emit(url);
  }

  editAccount(view: any) {
    this.edit.emit(view);
  }

  testPayloadModal(view: UsiAccountViewData) {
    this.isSubmit = true;
    this.selectedView = view;
    this.buildPayloadForm();
    this.payloadModalRef = this.modalService.show(this.payload, Object.assign({}, { class: 'modal-md', keyboard: true, ignoreBackdropClick: true }));
  }

  buildPayloadForm() {
    this.payloadForm = this.service.buildPayloadForm();
    this.payloadFormErrors = this.service.resetPaylodFormErrors();
    this.payloadValidationMessages = this.service.payloadValidationMessages;
  }

  emitPayload() {
    this.test.emit({ form: this.payloadForm, payLoadFormErrors: this.payloadFormErrors, payloadFormValidationMessages: this.payloadValidationMessages, view: this.selectedView });
    this.isSubmit = false;
  }

  deleteAccount(view: UsiAccountViewData) {
    this.selectedView = view;
    this.deleteModalRef = this.modalService.show(this.confirm, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  emitDelete() {
    this.delete.emit(this.selectedView);
    this.deleteModalRef.hide();
  }
}
