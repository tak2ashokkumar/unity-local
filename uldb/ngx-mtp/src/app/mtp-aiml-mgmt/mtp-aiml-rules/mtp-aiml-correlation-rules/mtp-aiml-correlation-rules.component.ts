import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AIMLCorrelationRuleViewdata, MtpAimlCorrelationRulesService } from './mtp-aiml-correlation-rules.service';
import { Subject } from 'rxjs';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ActivatedRoute, Router } from '@angular/router';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Component({
  selector: 'mtp-aiml-correlation-rules',
  templateUrl: './mtp-aiml-correlation-rules.component.html',
  styleUrls: ['./mtp-aiml-correlation-rules.component.scss'],
  providers: [MtpAimlCorrelationRulesService]
})
export class MtpAimlCorrelationRulesComponent implements OnInit, OnDestroy {
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

  constructor(private rulesSvc: MtpAimlCorrelationRulesService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: AppNotificationService,
    private spinner: AppSpinnerService,
    private modalService: BsModalService,
    private refreshService: DataRefreshBtnService,) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.ZERO };
    this.refreshService.refreshAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.refreshData();
    });
  }

  ngOnInit(): void {
    this.getRules();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
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
    this.rulesSvc.getRules(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.rulesSvc.convertToViewdata(res);
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

}
