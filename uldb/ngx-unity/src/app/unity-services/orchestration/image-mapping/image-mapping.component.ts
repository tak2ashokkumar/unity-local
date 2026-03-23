import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { ImageMappingModel, ImageMappingService, ImageMappingViewModel, nodesColumnMapping } from './image-mapping.service';
import { Subject } from 'rxjs';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { TableColumnMapping } from 'src/app/shared/SharedEntityTypes/unity-utils.type';
import { FormGroup } from '@angular/forms';
import { cloneDeep as _clone } from 'lodash-es';


@Component({
  selector: 'image-mapping',
  templateUrl: './image-mapping.component.html',
  styleUrls: ['./image-mapping.component.scss']
})
export class ImageMappingComponent implements OnInit {

  currentCriteria: SearchCriteria;
  private ngUnsubscribe = new Subject();
  viewData: ImageMappingViewModel[] = [];
  count: number;
  isPageSizeAll: boolean = true;
  @ViewChild('edit') edit: ElementRef;
  editModelRef: BsModalRef;
  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  deleteModalRef: BsModalRef;
  imageMapId: string;
  columnSelectionSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    selectAsObject: true,
    selectionLimit: 10,
    buttonClasses: 'btn btn-default btn-block p-1',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: false,
    showCheckAll: false,
    showUncheckAll: false
  };
  columnSelectionTexts: IMultiSelectTexts = {
    checkAll: 'Select all columns',
    uncheckAll: 'Deselect all columns',
    checked: 'column',
    checkedPlural: 'columns',
    defaultTitle: 'Select columns',
    allSelected: 'All columns selected',
  };
  tableColumns: TableColumnMapping[] = nodesColumnMapping;
  columnForm: FormGroup;
  columnsSelected: TableColumnMapping[] = [];



  constructor(
    private svc: ImageMappingService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private router: Router,
    private route: ActivatedRoute,
    private modalService: BsModalService
  ) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE };
  }

  ngOnInit(): void {
    this.spinner.start('main');
    this.columnsSelected = this.tableColumns.filter(col => col.default);
    this.getImageMapping();
    this.buildColumnForm();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete()
  }

  onSorted($event: SearchCriteria) {
    this.spinner.start('main');
    this.currentCriteria.sortColumn = $event.sortColumn;
    this.currentCriteria.sortDirection = $event.sortDirection;
    this.currentCriteria.pageNo = 1;
    this.getImageMapping();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getImageMapping();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo !== pageNo) {
      this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getImageMapping();
    }
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getImageMapping();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    this.getImageMapping();
  }

  getImageMapping() {
    this.svc.getImageMappingData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      this.viewData = this.svc.convertToViewData(data.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get VM Images'));
    });
  }

  createVMImage() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  editVMImage(view: ImageMappingViewModel) {
    this.imageMapId = view.uuid;
    this.editModelRef = this.modalService.show(this.edit, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmEdit() {
    this.editModelRef.hide();
    this.router.navigate([this.imageMapId, 'edit'], { relativeTo: this.route });
  }

  

  buildColumnForm() {
    this.columnForm = this.svc.buildColumnSelectionForm(this.columnsSelected);
  }

  columnChange() {
    this.spinner.start('main');
    this.columnsSelected = _clone(this.columnForm.getRawValue().columns);
    this.spinner.stop('main');
  }

  deleteVMImage(uuid: string) {
    this.imageMapId = uuid;
    this.deleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmVMImageDelete() {
    this.deleteModalRef.hide();
    this.spinner.start('main');
    this.svc.deleteRecord(this.imageMapId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.notification.success(new Notification('VM Image deleted successfully.'));
      this.getImageMapping();
    }, err => {
      this.notification.error(new Notification('VM Image can not be deleted!! Please try again.'));
    });
  }

}


