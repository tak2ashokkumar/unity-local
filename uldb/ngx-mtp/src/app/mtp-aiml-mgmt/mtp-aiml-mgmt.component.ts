import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router, UrlSegment } from '@angular/router';
import { cloneDeep as _clone } from 'lodash-es';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Tenant } from '../shared/SharedEntityTypes/tenants.type';
import { UnityTimeDuration } from '../shared/app-utility/app-utility.service';
import { DataRefreshBtnService } from '../shared/data-refresh-btn/data-refresh-btn.service';
import { IMultiSelectSettings, IMultiSelectTexts } from '../shared/multiselect-dropdown/types';
import { AIMLFilterFormData, AIMLHeaderViewData, MtpAimlMgmtService } from './mtp-aiml-mgmt.service';

@Component({
  selector: 'mtp-aiml-mgmt',
  templateUrl: './mtp-aiml-mgmt.component.html',
  styleUrls: ['./mtp-aiml-mgmt.component.scss'],
  providers: []
})
export class MtpAimlMgmtComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  subscr: Subscription;
  currentPath: string;
  crudRoute: string;

  filterForm: FormGroup;
  filterFormErrors: any;
  filterFormData: AIMLFilterFormData;
  viewData: AIMLHeaderViewData = new AIMLHeaderViewData();
  duration = UnityTimeDuration;

  tenants: Tenant[] = [];
  tnSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: "uuid",
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true
  };
  tnTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'Tenant selected',
    checkedPlural: 'Tenants selected',
    searchPlaceholder: 'Find',
    defaultTitle: 'Select Tenants',
    allSelected: 'All Tenants',
  };
  currentRouteUrl: string = '';
  constructor(private svc: MtpAimlMgmtService,
    private router: Router,
    private route: ActivatedRoute,
    private refreshService: DataRefreshBtnService,) {
    this.route.parent.url.subscribe((urlPath: UrlSegment[]) => {
      urlPath.forEach((path) => this.currentRouteUrl = this.currentRouteUrl.concat(path.path + '/'));
    });
    this.route.url.subscribe((urlPath: UrlSegment[]) => {
      urlPath.forEach((path) => this.currentRouteUrl = this.currentRouteUrl.concat(path.path + '/'));
    });
  }

  ngOnInit(): void {
    this.getDropDownData();
  }

  ngOnDestroy(): void {
    if (this.subscr) {
      this.subscr.unsubscribe();
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  refreshData() {
    this.getDropDownData();
  }

  getDropDownData() {
    this.svc.getDropdownData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      if (res.tenants) {
        this.tenants = _clone(res.tenants);
      } else {
        this.tenants = [];
      }
      this.buildForm();
    });
  }

  buildForm() {
    this.filterForm = this.svc.buildFilterForm(this.tenants);
    this.filterFormErrors = this.svc.resetFilterFormErrors();
    this.filterFormData = this.filterForm.getRawValue();
    // this.filterForm.get('tenants').valueChanges.subscribe(res => {
    //   this.getAIMLSummary();
    // })
    this.getAIMLSummary();
  }

  onTenantChange() {
    this.filterFormData = this.filterForm.getRawValue();
    console.log('onTenantChange')
    this.svc.filterChanged(this.filterFormData);
  }

  getAIMLSummary() {
    this.svc.getAIMLSummary().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.viewData = this.svc.convertToViewData(res);
    });
  }

  isActive(tab: string) {
    if (this.router.url.match(this.currentRouteUrl.concat(tab))) {
      return 'active text-success';
    }
  }

  goTo(path: string) {
    if (this.currentRouteUrl == path) {
      return;
    }
    this.refreshData();
    switch (path) {
      default: this.router.navigate([path], { relativeTo: this.route });
    }
  }

  goToRules(){
    this.router.navigate(['rules', 'suppressionrules'], { relativeTo: this.route });
  }

}
