import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, QueryList, SimpleChanges, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { CONFIRM_MODAL_CONFIG } from 'src/app/shared/shared.const';
import { AppCustomDashboardPanelCrudComponent } from '../app-custom-dashboard-panel-crud/app-custom-dashboard-panel-crud.component';
import { CustomDashboard, CustomDashboardPanel } from '../app-custom-dashboards.type';
import { AppCustomDashboardPanelsService, CustomDashboardPanelCard } from './app-custom-dashboard-panels.service';

@Component({
  selector: 'app-custom-dashboard-panels',
  templateUrl: './app-custom-dashboard-panels.component.html',
  styleUrls: ['./app-custom-dashboard-panels.component.scss'],
  providers: [AppCustomDashboardPanelsService]
})
export class AppCustomDashboardPanelsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() dashboard: CustomDashboard;
  @Output() dashboardChange = new EventEmitter<CustomDashboard>();
  private readonly ngUnsubscribe = new Subject<void>();

  cards: CustomDashboardPanelCard[] = [];

  selectedCard: CustomDashboardPanelCard;

  @ViewChildren(AppCustomDashboardPanelCrudComponent) editors: QueryList<AppCustomDashboardPanelCrudComponent>;

  @ViewChild('confirmDelete') confirmDelete: TemplateRef<void>;
  confirmDeleteModalRef: BsModalRef;

  @ViewChild('confirmDiscard') confirmDiscard: TemplateRef<void>;
  confirmDiscardModalRef: BsModalRef;

  constructor(private svc: AppCustomDashboardPanelsService,
    private spinnerSvc: AppSpinnerService,
    private notificationSvc: AppNotificationService,
    private modalSvc: BsModalService) { }

  ngOnInit(): void {
    this.cards = this.svc.getPanels(this.dashboard).map((panel, i) => this.buildCard(panel, i + 1, i === 0));
    if (!this.cards.length) {
      this.addPanel();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.dashboard && !changes.dashboard.firstChange) {
      this.syncCards();
    }
  }

  ngOnDestroy(): void {
    this.confirmDeleteModalRef?.hide();
    this.confirmDiscardModalRef?.hide();
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  // Called by the wizard before it leaves the Smart Panel step.
  hasUnsavedChanges(): boolean {
    return this.editors ? this.editors.some(e => e.isDirty()) : false;
  }

  addPanel(): void {
    const card: CustomDashboardPanelCard = this.buildCard(null, this.cards.length + 1, true);
    this.cards = [...this.cards, card];
  }

  getSavedCount(): number {
    return this.cards.filter(c => c.panelId).length;
  }

  getSummary(card: CustomDashboardPanelCard): { sources: number, columns: number, widgets: number } {
    return this.svc.getPanelSummary(card.panel);
  }

  toggleCard(card: CustomDashboardPanelCard): void {
    if (!card.expanded) {
      card.expanded = true;
      return;
    }
    const editor = this.getEditor(card);
    if (editor && editor.isDirty()) {
      this.selectedCard = card;
      this.confirmDiscardModalRef = this.modalSvc.show(this.confirmDiscard, CONFIRM_MODAL_CONFIG);
      return;
    }
    card.expanded = false;
  }

  // Collapsing drops the editor; an unsaved new panel has nothing to come back to.
  discardChanges(): void {
    this.confirmDiscardModalRef.hide();
    if (!this.selectedCard.panelId) {
      this.cards = this.cards.filter(c => c !== this.selectedCard);
      return;
    }
    this.selectedCard.expanded = false;
  }

  onPanelSaved(card: CustomDashboardPanelCard, event: { dashboard: CustomDashboard, panelId: string }): void {
    card.panelId = event.panelId;
    this.dashboardChange.emit(event.dashboard);
  }

  duplicatePanel(card: CustomDashboardPanelCard): void {
    if (!card.panelId) {
      return;
    }
    this.runOperation(this.svc.duplicatePanel(this.dashboard.uuid, this.dashboard.version, card.panelId), 'Panel duplicated successfully.');
  }

  confirmDeletePanel(card: CustomDashboardPanelCard): void {
    this.selectedCard = card;
    this.confirmDeleteModalRef = this.modalSvc.show(this.confirmDelete, CONFIRM_MODAL_CONFIG);
  }

  deletePanel(): void {
    this.confirmDeleteModalRef.hide();
    if (!this.selectedCard.panelId) {
      this.cards = this.cards.filter(c => c !== this.selectedCard);
      return;
    }
    this.runOperation(this.svc.deletePanel(this.dashboard.uuid, this.dashboard.version, this.selectedCard.panelId), 'Panel deleted successfully.');
  }

  // Only saved panels have a server order; drafts stay at the end until they are saved.
  onDrop(event: CdkDragDrop<CustomDashboardPanelCard[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }
    moveItemInArray(this.cards, event.previousIndex, event.currentIndex);
    const panelIds = this.cards.filter(c => c.panelId).map(c => c.panelId);
    const savedIds = this.svc.getPanels(this.dashboard).map(p => p.id);
    if (panelIds.join() === savedIds.join()) {
      return;
    }
    this.runOperation(this.svc.reorderPanels(this.dashboard.uuid, this.dashboard.version, panelIds), 'Panel order saved.');
  }

  trackByCard(_index: number, card: CustomDashboardPanelCard): string {
    return card.key;
  }

  private runOperation(request$: Observable<CustomDashboard>, successMessage: string): void {
    this.spinnerSvc.start('main');
    request$.pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.spinnerSvc.stop('main')))
      .subscribe((res: CustomDashboard) => {
        this.notificationSvc.success(new Notification(successMessage));
        this.dashboardChange.emit(res);
      }, () => {
        this.notificationSvc.error(new Notification('Something went wrong. Please try again!!'));
        // Put the cards back in the server order if a reorder failed.
        this.syncCards();
      });
  }

  // Keep the cards in step with the server copy (duplicate / delete / reorder / save),
  // without re-creating editors that are already open.
  private syncCards(): void {
    const panels = this.svc.getPanels(this.dashboard);
    const drafts = this.cards.filter(c => !c.panelId);
    const savedCards = panels.map(panel => {
      const existing = this.cards.find(c => c.panelId === panel.id);
      if (existing) {
        existing.panel = panel;
        return existing;
      }
      return this.buildCard(panel, 0, false);
    });
    this.cards = [...savedCards, ...drafts];
    this.cards.forEach((c, i) => c.number = c.number || i + 1);
  }

  private getEditor(card: CustomDashboardPanelCard): AppCustomDashboardPanelCrudComponent {
    const index = this.cards.filter(c => c.expanded).indexOf(card);
    return index > -1 && this.editors ? this.editors.toArray()[index] : null;
  }

  private buildCard(panel: CustomDashboardPanel, panelNumber: number, expanded: boolean): CustomDashboardPanelCard {
    const card: CustomDashboardPanelCard = new CustomDashboardPanelCard();
    card.key = panel ? panel.id : this.svc.generateKey();
    card.panelId = panel ? panel.id : null;
    card.panel = panel;
    card.number = panelNumber;
    card.expanded = expanded;
    return card;
  }
}
