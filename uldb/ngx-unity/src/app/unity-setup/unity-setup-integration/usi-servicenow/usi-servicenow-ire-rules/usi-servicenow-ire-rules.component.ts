import { Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subject, from } from 'rxjs';
import { UsiServicenowIreRulesService } from './usi-servicenow-ire-rules.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { ServiceNowResourceType } from '../usi-servicenow.type';
import { IREIdentifierRule, IREReconciliationRule, IRERefreshRule, IRERuleEntryAttribute } from './usi-servicenow-ire-rules.type';

@Component({
  selector: 'usi-servicenow-ire-rules',
  templateUrl: './usi-servicenow-ire-rules.component.html',
  styleUrls: ['./usi-servicenow-ire-rules.component.scss'],
  providers: [UsiServicenowIreRulesService]
})
export class UsiServicenowIreRulesComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  instanceId: string;
  currentCriteria: SearchCriteria;
  resourceTypes: ServiceNowResourceType[] = [];

  count: number = 0;
  viewData: IREIdentifierRule[] = [];
  selectedView: IREIdentifierRule;
  @ViewChildren('fold') folds: QueryList<ElementRef>;

  constructor(private svc: UsiServicenowIreRulesService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.instanceId = params.get('snId');
    });
    this.currentCriteria = {
      sortColumn: '', sortDirection: '', searchValue: '',
      pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE,
      params: [{ 'uuid': this.instanceId, 'resource': null }]
    };
  }

  ngOnInit(): void {
    this.getSnResourceList();
    this.getIdentifierRules();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData(pageNo: number) {
    this.currentCriteria = {
      sortColumn: '', sortDirection: '', searchValue: '',
      pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE,
      params: [{ 'uuid': this.instanceId, 'resource': null }]
    };
    this.getIdentifierRules();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getIdentifierRules();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getIdentifierRules();
  }

  pageSizeChange(pageSize: number) {
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getIdentifierRules();
  }

  getSnResourceList() {
    this.svc.getSnResourceList(this.instanceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.resourceTypes = res;
    }, err => {
      this.resourceTypes = [];
    });
  }

  getIdentifierRules() {
    this.spinner.start('main');
    this.svc.getRules(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = res.results;
      this.viewData.forEach(d => {
        d.isOpen = false;
      })
      this.getRuleData();
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
    });
  }

  getRuleData() {
    from(this.viewData).pipe(
      mergeMap((e) => this.svc.getRuleData(this.instanceId, e)),
      takeUntil(this.ngUnsubscribe))
      .subscribe(res => { },
        err => console.log(err)
      )
  }

  switchIdentifierRuleStatus(status: string, index: number) {
    if (this.viewData[index].active == status) {
      return;
    }
    this.spinner.start('main');
    let obj = Object.assign({}, this.viewData[index], { active: status });
    this.svc.updateIdentifierRule(this.instanceId, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData[index].active = status;
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
    });
  }

  selectView(view: IREIdentifierRule) {
    this.selectedView = view;
    this.openRow(view);
  }

  openRow(view: IREIdentifierRule) {
    this.viewData.map(data => {
      if (data != view) {
        data.isOpen = false;
      }
    });
    view.isOpen = !view.isOpen;
  }

  show(view: IREIdentifierRule, val: string) {
    view.target = val;
  }

  isActive(view: IREIdentifierRule, val: string) {
    if (view.target == val) {
      return 'active text-primary border-primary bg-colour shadow-none';
    } else {
      return 'text-muted btn-outline-light'
    }
  }

  switchEntryAttributeStatus(status: string, index: number, parentIndex: number) {
    if (this.viewData[parentIndex].entry_attributes[index].active == status) {
      return;
    }
    this.spinner.start('main');
    let obj = Object.assign({}, this.viewData[parentIndex].entry_attributes[index], { active: status });
    this.svc.updateEntryAttributes(this.instanceId, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData[parentIndex].entry_attributes[index].active = status;
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
    });
  }

  switchReconciliationRuleStatus(status: string, index: number, parentIndex: number) {
    if (this.viewData[parentIndex].reconciliation_rules[index].active == status) {
      return;
    }
    this.spinner.start('main');
    let obj = Object.assign({}, this.viewData[parentIndex].reconciliation_rules[index], { active: status });
    this.svc.updateReconciliationRule(this.instanceId, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData[parentIndex].reconciliation_rules[index].active = status;
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
    });
  }

  switchRefreshRuleStatus(status: string, index: number, parentIndex: number) {
    if (this.viewData[parentIndex].refresh_rules[index].active == status) {
      return;
    }
    this.spinner.start('main');
    let obj = Object.assign({}, this.viewData[parentIndex].refresh_rules[index], { active: status });
    this.svc.updateRefreshRule(this.instanceId, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData[parentIndex].refresh_rules[index].active = status;
      this.spinner.stop('main');
    }, err => {
      this.spinner.stop('main');
    });
  }

  goBack() {
    if (this.router.url.includes('instances')) {
      this.router.navigate(['servicenow', 'instances', this.instanceId, 'edit'], { relativeTo: this.route.parent });
    } else {
      this.router.navigate(['servicenow', this.instanceId, 'edit'], { relativeTo: this.route.parent });
    } 
  }

}
