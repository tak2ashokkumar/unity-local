import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { UnityResourceType } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { AttributeValueTypes, UnityDeviceTypeList, UnitySetupCustomAttributesService, UnitySetupCustomAttributeViewData } from './unity-setup-custom-attributes.service';

@Component({
  selector: 'unity-setup-custom-attributes',
  templateUrl: './unity-setup-custom-attributes.component.html',
  styleUrls: ['./unity-setup-custom-attributes.component.scss'],
  providers: [UnitySetupCustomAttributesService]
})
export class UnitySetupCustomAttributesComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  currentCriteria: SearchCriteria;
  resourceTypes: UnityResourceType[] = UnityDeviceTypeList;
  valueTypes: string[] = AttributeValueTypes;

  count: number = 0;
  viewData: UnitySetupCustomAttributeViewData[] = [];
  selectedView: UnitySetupCustomAttributeViewData;

  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  modalRef: BsModalRef;

  resourceTypeSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "label",
    keyToSelect: "value",
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: false,
    showUncheckAll: false,
    appendToBody: true
  };

  resourceTypeTexts: IMultiSelectTexts = {
    defaultTitle: 'Resource Type',
  };

  valueTypeSettings: IMultiSelectSettings = {
    isSimpleArray: true,
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: false,
    showUncheckAll: false,
    appendToBody: true
  };

  valueTypeTexts: IMultiSelectTexts = {
    defaultTitle: 'Value Type',
  };
  constructor(private svc: UnitySetupCustomAttributesService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private modalSvc: BsModalService,
    private notification: AppNotificationService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, multiValueParam: { 'resource_type': [], 'value_type': [] } };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.getAttributes();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSorted($event: SearchCriteria) {
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getAttributes();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getAttributes();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo != pageNo) {
      this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getAttributes();
    }
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getAttributes();
  }

  refreshData() {
    this.spinner.start('main');
    this.currentCriteria.pageNo = 1;
    this.currentCriteria.multiValueParam.resource_type = [];
    this.currentCriteria.multiValueParam.value_type = [];
    this.getAttributes();
  }

  onFilterChange() {
    this.spinner.start('main');
    this.currentCriteria.pageNo = 1;
    this.getAttributes();
  }

  getAttributes() {
    this.svc.getAttributes(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.count = res.count;
      this.viewData = this.svc.convertToViewData(res.results);
      this.spinner.stop('main');
    }, err => {
      this.viewData = [];
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get custom attribues. Tryagain later.'))
    })
  }

  add() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  edit(view: UnitySetupCustomAttributeViewData) {
    this.router.navigate([view.id, 'edit'], { relativeTo: this.route });
  }

  onChangeValue(event: any, index: number) {
    if (this.viewData[index].valueForm.valid) {
      this.viewData[index].valueForm = null;
      let obj = Object.assign({}, this.viewData[index].attr, { 'default_value': event.target.value });
      this.svc.save(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.viewData[index].attr = res;
        this.viewData[index].valueForm = this.svc.buildValueForm(res);
      }, err => {
        this.viewData[index].valueForm = this.svc.buildValueForm(this.viewData[index].attr);
        this.notification.error(new Notification(`Failed to update value for attribute <strong>${this.viewData[index].name}<strong>`));
      })
    }
  }

  deleteAttribute(view: UnitySetupCustomAttributeViewData) {
    this.selectedView = view;
    this.modalRef = this.modalSvc.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmDelete() {
    this.spinner.start('main');
    this.svc.deleteAttribute(this.selectedView.id).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.modalRef.hide();
      this.notification.success(new Notification('Attribute deleted successfully.'));
      this.getAttributes();
    }, err => {
      this.modalRef.hide();
      this.spinner.stop('main');
      this.notification.error(new Notification("Failed to delete attribute. Tryagain later."))
    })
  }

}
