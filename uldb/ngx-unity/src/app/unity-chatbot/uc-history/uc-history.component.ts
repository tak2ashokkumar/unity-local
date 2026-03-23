import { Component, OnDestroy, OnInit } from '@angular/core';
import { TabNames } from '../unity-chatbot.service';
import { UcHistoryService } from './uc-history.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UnityAssistantHistory } from './uc-history.type';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { IPageInfo } from 'ngx-virtual-scroller';
import { UserInfoService } from 'src/app/shared/user-info.service';

@Component({
  selector: 'uc-history',
  templateUrl: './uc-history.component.html',
  styleUrls: ['./uc-history.component.scss'],
  providers: [UcHistoryService]
})
export class UcHistoryComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();

  tabs = [...TabNames];
  selectedTab: string = this.tabs.getFirst().name;
  onChat: boolean = false;
  historyList: UnityAssistantHistory[] = [];
  infiniteHistoryList: UnityAssistantHistory[] = [];
  historyCurrentCriteria: SearchCriteria;
  selectedHistory: UnityAssistantHistory;
  isHistoryLoading: boolean = false;
  noMoreHistory: boolean = false;

  constructor(private service: UcHistoryService,
    private userService: UserInfoService,) {
    this.historyCurrentCriteria = {
      searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.TEN,
      params: [{
        'org_id': userService.userOrgId,
        'user_id': userService.userDetails.id,
        'application': 'Assistant'
      }]
    }
  }

  ngOnInit(): void {
    // this.historyCurrentCriteria.params.getFirst()['application']
    this.getHistory();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }


  getHistory() {
    // this.historyList = [];
    this.service.getHistory(this.historyCurrentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res.results.length < this.historyCurrentCriteria.pageSize) {
        this.noMoreHistory = true;
      }
      this.historyList = this.historyList.concat(res.results);
      this.infiniteHistoryList = this.labelHistoryList(this.historyList);
      this.isHistoryLoading = false;
    })
  }

  fetchMoreHistory(event: IPageInfo) {
    if (!this.infiniteHistoryList.length || this.isHistoryLoading || this.noMoreHistory) {
      return;
    }
    if (this.infiniteHistoryList.length % this.historyCurrentCriteria.pageSize !== 0 ||
      event.endIndex !== this.infiniteHistoryList.length - 1) {
      return;
    }
    this.isHistoryLoading = true;
    this.historyCurrentCriteria.pageNo = this.infiniteHistoryList.length / this.historyCurrentCriteria.pageSize + 1;
    this.getHistory();
  }

  labelHistoryList(items: UnityAssistantHistory[]): UnityAssistantHistory[] {
    const now = new Date();
    const todayStr = now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    const seenLabels = new Set<string>();

    return items.map(item => {
      const itemDateStr = new Date(item.last_message_at).toDateString();
      let group: string;

      if (itemDateStr === todayStr) group = 'Today';
      else if (itemDateStr === yesterdayStr) group = 'Yesterday';
      else group = 'Previous';

      const displayLabel = seenLabels.has(group) ? null : group;
      seenLabels.add(group);

      return { ...item, displayLabel };
    });
  }

  manageTabs(tab: any, fromInsights?: boolean) {
    if (tab.name == this.selectedTab) {
      return;
    }
    this.selectedTab = tab.name;
    this.tabs.forEach(tab => tab.isSelected = false);
    tab.isSelected = true;
  }

  toSelectedHistoryChat(history: UnityAssistantHistory) {
    this.selectedHistory = history;
    this.onChat = true;
  }

  handleBack() {
    // this.infiniteHistoryList = [];
    // this.getHistory();
    this.onChat = false;
  }
}
