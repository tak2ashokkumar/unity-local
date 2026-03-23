import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { UnityChartDetails } from 'src/app/shared/unity-chart-config.service';
import { Category } from './knowledge-management-crud/knowledge-management-crud.type';
import { KnowledgeManagementService, ResourceViewData } from './knowledge-management.service';

@Component({
  selector: 'knowledge-management',
  templateUrl: './knowledge-management.component.html',
  styleUrls: ['./knowledge-management.component.scss'],
  providers: [KnowledgeManagementService]
})
export class KnowledgeManagementComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();

  chartData: UnityChartDetails = new UnityChartDetails();
  categories: Category[] = [];
  selectedCategory: Category = null;
  selectedCategoryId: string;
  resources: ResourceViewData[] = [];
  count: number;
  selectedResourceId: string;
  currentCriteria: SearchCriteria;

  actionMessage: 'Create' | 'Edit';
  deleteMessage: 'Resource' | 'Category';
  categoryForm: FormGroup;
  categoryFormErrors: any;
  categoryValidationMessages: any;
  modalRef: BsModalRef;
  @ViewChild('category') category: ElementRef;
  nonFieldErr: string = '';

  deleteModalRef: BsModalRef;
  @ViewChild('confirmDelete') confirmDelete: ElementRef;

  constructor(private service: KnowledgeManagementService,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService) {
    this.currentCriteria = { searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{}] };
  }

  ngOnInit(): void {
    this.getResources();
    this.getCategories();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getResources();
  }

  pageChange(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getResources();
  }

  getResources() {
    this.resources = [];
    this.spinner.start('main');
    this.service.getResources(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.resources = this.service.convertToResourceViewData(res.results);
      this.count = res.count;
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get resources. Please try again.'));
      this.spinner.stop('main');
    })
  }

  getCategories() {
    this.categories = [];
    this.service.getCategories().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.categories = res;
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get categories. Please try again.'));
    })
  }

  getCategoryClasses(category: any, last: boolean): any {
    return {
      'border-bottom': !last && this.selectedCategory?.name !== category.name,
      'selected-category': this.selectedCategory?.name == category.name,
      'text-muted': this.selectedCategory?.name != category.name,
    };
  }

  addCategory() {
    this.actionMessage = 'Create';
    this.modalRef = this.modalService.show(this.category, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
    this.buildCategoryForm(null);
  }

  buildCategoryForm(category: string) {
    this.categoryForm = this.service.buildCategoryForm(category);
    this.categoryFormErrors = this.service.resetCategoryFormErrors();
    this.categoryValidationMessages = this.service.categoryValidationMessages;
  }

  selectCategory(category: Category) {
    this.selectedCategory = category;
    this.currentCriteria.pageNo = 1
    this.currentCriteria.params[0]['category'] = category.name;
    this.getResources();
  }

  selectAll() {
    this.selectedCategory = null;
    this.currentCriteria.pageNo = 1
    delete this.currentCriteria.params[0]['category'];
    this.getResources();
  }

  onCategorySubmit() {
    if (this.categoryForm.invalid) {
      this.categoryFormErrors = this.utilService.validateForm(this.categoryForm, this.categoryValidationMessages, this.categoryFormErrors);
      this.categoryForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.categoryFormErrors = this.utilService.validateForm(this.categoryForm, this.categoryValidationMessages, this.categoryFormErrors);
      });
    } else {
      if (this.actionMessage == 'Create') {
        this.spinner.start('main');
        this.service.createCategory(this.categoryForm.get('name').value).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.modalRef.hide();
          this.spinner.stop('main');
          this.getCategories();
          this.notification.success(new Notification('Category created successfuly.'));
        }, (err: HttpErrorResponse) => {
          this.spinner.stop('main');
          this.notification.error(new Notification('Failed to create category. Please try again.'));
        });
      } else {
        this.spinner.start('main');
        this.service.updateCategory(this.categoryForm.get('name').value, this.selectedCategoryId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.modalRef.hide();
          this.spinner.stop('main');
          this.getCategories();
          this.notification.success(new Notification('Category updated successfuly.'));
        }, (err: HttpErrorResponse) => {
          this.spinner.stop('main');
          this.notification.error(new Notification('Failed to update category. Please try again.'));
        });
      }
    }
  }

  editCategory(category: Category) {
    this.actionMessage = 'Edit';
    this.selectedCategoryId = category.id;
    this.buildCategoryForm(category.name);
    this.modalRef = this.modalService.show(this.category, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  deleteCategory() {
    this.spinner.start('main');
    this.service.deleteCategory(this.selectedCategoryId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getCategories();
      this.deleteModalRef.hide();
      this.spinner.stop('main');
      this.notification.success(new Notification('Category deleted successfuly.'));
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to delete category. Please try again.'));
    });
  }

  addResource() {
    this.router.navigate(['create'], { relativeTo: this.route })
  }

  deleteResource() {
    this.spinner.start('main');
    this.service.deleteResource(this.selectedResourceId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.getResources();
      this.getCategories();
      this.deleteModalRef.hide();
      this.spinner.stop('main');
      this.notification.success(new Notification('Resource deleted successfuly.'));
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to delete resource. Please try again.'));
    });
  }

  onDelete(entity: string, resourceId?: string, categoryId?: string) {
    if (entity == 'Resource') {
      this.selectedResourceId = resourceId;
      this.deleteMessage = 'Resource';
    } else {
      this.selectedCategoryId = categoryId;
      this.deleteMessage = 'Category';
    }
    this.deleteModalRef = this.modalService.show(this.confirmDelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));

  }

  onConfirmDelete() {
    if (this.deleteMessage == 'Resource') {
      this.deleteResource();
    } else {
      this.deleteCategory();
    }
  }

}

