import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal/';
import { Subject } from 'rxjs';
import { SearchCriteria, PAGE_SIZES } from 'src/app/shared/table-functionality/search-criteria';
import { AimlCorrelationRulesService, AIMLCorrelationRuleViewdata } from './aiml-correlation-rules.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { AIMLCorrelationRule } from '../aiml-rules.type';

@Component({
  selector: 'aiml-correlation-rules',
  templateUrl: './aiml-correlation-rules.component.html',
  styleUrls: ['./aiml-correlation-rules.component.scss'],
  providers: [AimlCorrelationRulesService]
})
export class AimlCorrelationRulesComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;

  viewData: AIMLCorrelationRuleViewdata[] = [];
  selectedRule: AIMLCorrelationRuleViewdata;

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmDeleteModalRef: BsModalRef;

  @ViewChild('confirmenable') confirmenable: ElementRef;
  confirmEnableModalRef: BsModalRef;

  @ViewChild('confirmdisable') confirmdisable: ElementRef;
  confirmDisableModalRef: BsModalRef;

  selectedRuleFlag: boolean;
  modifiedOrderValue: number;

  constructor(private rulesSvc: AimlCorrelationRulesService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService,
    private modalService: BsModalService,
    private refreshService: DataRefreshBtnService,) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.TEN };
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
  }

  ngOnInit() {
    this.getRules();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getRules();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getRules();
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getRules();
  }

  refreshData() {
    this.currentCriteria.pageNo = 1;
    this.currentCriteria.searchValue = '';
    this.getRules();
  }

  getRules() {
    this.spinner.start('main');
    this.rulesSvc.getRules(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe((res: AIMLCorrelationRule[
    ]) => {
      this.viewData = [...this.rulesSvc.convertToViewdata(res)];
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while fetching rules!!'));
    });
  }

  addRule() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  viewRule(view: AIMLCorrelationRuleViewdata) {
    this.router.navigate([view.uuid], { relativeTo: this.route });
  }

  editRule(view: AIMLCorrelationRuleViewdata) {
    this.router.navigate([view.uuid], { relativeTo: this.route });
  }

  deleteRule(view: AIMLCorrelationRuleViewdata) {
    this.selectedRule = view;
    this.confirmDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.rulesSvc.deleteRule(this.selectedRule.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.confirmDeleteModalRef.hide();
      this.getRules();
      this.notification.success(new Notification('Rule deleted successfully.'));
    }, err => {
      this.confirmDeleteModalRef.hide();
      this.notification.error(new Notification('Rule could not be deleted!!'));
    });
  }

  enableRule(view: AIMLCorrelationRuleViewdata) {
    this.selectedRule = view;
    this.confirmEnableModalRef = this.modalService.show(this.confirmenable, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmEnable() {
    this.rulesSvc.enableRule(this.selectedRule.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.confirmEnableModalRef.hide();
      this.getRules();
      this.notification.success(new Notification('Rule enabled successfully.'));
    }, err => {
      this.confirmEnableModalRef.hide();
      this.notification.error(new Notification('Rule could not be enabled!!'));
    });
  }

  disableRule(view: AIMLCorrelationRuleViewdata) {
    this.selectedRule = view;
    this.confirmDisableModalRef = this.modalService.show(this.confirmdisable, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDisable() {
    this.rulesSvc.disableRule(this.selectedRule.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.confirmDisableModalRef.hide();
      this.getRules();
      this.notification.success(new Notification('Rule disabled successfully.'));
    }, err => {
      this.confirmDisableModalRef.hide();
      this.notification.error(new Notification('Rule could not be disabled!!'));
    });
  }

  changePriority(index: number, event: Event) {
    this.selectedRule = this.viewData[index];
    this.selectedRuleFlag = true;
    event.stopPropagation();
    event.preventDefault();
    this.viewData.forEach(val => {
      val.orderChangeFlag = false;
    });
    setTimeout(() => {
      this.viewData[index].orderChangeFlag = true;
    });
  }

  setOrderInputVal(value: number) {
    this.modifiedOrderValue = value;
  }

  onOrderChange() {
    this.selectedRuleFlag = false;
    this.calculateRelavance(this.modifiedOrderValue);
  }

  calculateRelavance(modifiedOrderValue: number) {
    // let currenctSpecificity = modifiedOrderValue < this.selectedRule.order ? this.selectedRule.specificity : this.viewData.find(val => val.order === Number(modifiedOrderValue)).specificity;
    let currenctSpecificity = this.selectedRule.specificity;
    let nextRecord = this.viewData.find((val: AIMLCorrelationRuleViewdata) => { return val.order === Number(modifiedOrderValue) });
    let nextRecordIndex = this.viewData.findIndex(val => val.order === Number(modifiedOrderValue));
    let calculatedRelevance = this.modifiedRelavance(nextRecord, nextRecordIndex);
    let modifiedPriority = Math.round(calculatedRelevance / currenctSpecificity);

    this.rulesSvc.updatePriority(this.selectedRule.uuid, { priority: modifiedPriority }).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getRules();
      this.notification.success(new Notification('Priority of Rule updated Successfully'));
    }, err => {
      this.notification.error(new Notification('Priority could not be updated.'));
    });
  }

  modifiedRelavance(nextRecord, nextRecordIndex) {
    let result;
    if (nextRecordIndex === 0) { //when we are moving a row to the 1st row
      let firstRulerelevance = nextRecord.relevance;
      result = firstRulerelevance + ((firstRulerelevance) - (firstRulerelevance + this.viewData[nextRecordIndex + 1].relevance) / 2) + firstRulerelevance / 20;
    } else if (nextRecordIndex === this.viewData.length - 1) { // when we are moving a row to the last row
      let lastRuleRelevance = this.viewData[this.viewData.length - 1].relevance;
      let secondLastRuleRelevance = this.viewData[nextRecordIndex - 1].relevance;
      result = lastRuleRelevance - (secondLastRuleRelevance - ((secondLastRuleRelevance + lastRuleRelevance) / 2)) - lastRuleRelevance / 20;
    } else if (this.selectedRule.order < Number(this.modifiedOrderValue)) { // when we are moving a row downwards
      result = (nextRecord.relevance + this.viewData[nextRecordIndex + 1].relevance) / 2;
    } else if (this.selectedRule.order > Number(this.modifiedOrderValue)) { // when we are moving a row upwards
      result = (nextRecord.relevance + this.viewData[nextRecordIndex - 1].relevance) / 2;
    }
    return result;
  }
}
