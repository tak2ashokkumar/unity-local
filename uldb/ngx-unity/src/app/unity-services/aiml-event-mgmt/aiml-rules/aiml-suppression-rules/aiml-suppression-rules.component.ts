import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal/';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { AimlSuppressionRulesService, AIMLSuppressionRuleViewdata } from './aiml-suppression-rules.service';
import { DataRefreshBtnService } from 'src/app/shared/data-refresh-btn/data-refresh-btn.service';

@Component({
  selector: 'aiml-suppression-rules',
  templateUrl: './aiml-suppression-rules.component.html',
  styleUrls: ['./aiml-suppression-rules.component.scss'],
  providers: [AimlSuppressionRulesService]
})
export class AimlSuppressionRulesComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  confirmDeleteModalRef: BsModalRef;

  @ViewChild('confirmenable') confirmenable: ElementRef;
  confirmEnableModalRef: BsModalRef;

  @ViewChild('confirmdisable') confirmdisable: ElementRef;
  confirmDisableModalRef: BsModalRef;

  selectedRule: AIMLSuppressionRuleViewdata;
  viewData: AIMLSuppressionRuleViewdata[] = [];
  constructor(private rulesSvc: AimlSuppressionRulesService,
    private notification: AppNotificationService,
    private route: ActivatedRoute,
    private router: Router,
    private spinner: AppSpinnerService,
    private modalService: BsModalService,
    private refreshService: DataRefreshBtnService,) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.ZERO };
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

  viewRule(view: AIMLSuppressionRuleViewdata) {
    this.router.navigate([view.uuid], { relativeTo: this.route });
  }

  editRule(view: AIMLSuppressionRuleViewdata) {
    this.router.navigate([view.uuid], { relativeTo: this.route });
  }

  deleteRule(view: AIMLSuppressionRuleViewdata) {
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

  enableRule(view: AIMLSuppressionRuleViewdata) {
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

  disableRule(view: AIMLSuppressionRuleViewdata) {
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
