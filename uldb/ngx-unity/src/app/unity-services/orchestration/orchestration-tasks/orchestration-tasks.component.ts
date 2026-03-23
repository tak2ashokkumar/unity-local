import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { CategoryViewData, HistoryViewData, ListSummaryResModel, ListSummaryViewModel, OrchestrationTasksService, SCRIPT_CHOICES, TaskViewData } from './orchestration-tasks.service';

@Component({
  selector: 'orchestration-tasks',
  templateUrl: './orchestration-tasks.component.html',
  styleUrls: ['./orchestration-tasks.component.scss'],
  providers: [OrchestrationTasksService]
})
export class OrchestrationTasksComponent implements OnInit, OnDestroy {

  currentCriteria: SearchCriteria;
  private ngUnsubscribe = new Subject();
  viewData: TaskViewData[] = [];
  count: number;
  isPageSizeAll: boolean = true;
  nonFieldErr: string = '';
  action: 'Add' | 'Edit';
  taskModalRef: BsModalRef;
  @ViewChild('createcategory') createcategory: ElementRef;
  taskUUID: string;
  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  taskDeleteModalRef: BsModalRef;
  @ViewChild('history') history: ElementRef;
  viewHistoryData: HistoryViewData[] = [];
  categoryData: CategoryViewData[] = [];
  categoryForm: FormGroup;
  categoryFormErrors: any;
  categoryValidationMessages: any;
  currentCategory: string = '';
  cloneModalRef: BsModalRef;
  @ViewChild('clone') clone: ElementRef;
  taskName: string;
  listSummaryViewData: ListSummaryViewModel;
  @ViewChild('edit') edit: ElementRef;
  editModelRef: BsModalRef;
  celeryTaskIds: string[] = [];
  editCatModalRef: BsModalRef;
  @ViewChild('editcategory') editcategory: ElementRef;
  deleteCatModalRef: BsModalRef;
  @ViewChild('deletecategory') deletecategory: ElementRef;
  catUuid: string;
  scriptChoices = SCRIPT_CHOICES;
  categoryUuid: string

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private orchestraionTaskService: OrchestrationTasksService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private storage: StorageService) {
    this.currentCriteria = { sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ category: null, script_type: null, target_type: null, enabled: null }] };
    this.route.queryParamMap.subscribe((params: ParamMap) => {
      this.currentCriteria.params[0].script_type = params.get('scriptType');
      this.currentCriteria.params[0].target_type = params.get('target');
      this.currentCriteria.params[0].enabled = params.get('status');
    });
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.categoryUuid = params.get('categoryId')
    });
  }

  ngOnInit() {
    this.spinner.start('main');
    this.taskCrudCheck();
    this.getListSummary();
    this.getCategoryData();
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
    this.getCategoryData();
  }

  onSearched(event: string) {
    this.spinner.start('main');
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getCategoryData();
  }

  pageChange(pageNo: number) {
    if (this.currentCriteria.pageNo !== pageNo) {
      this.spinner.start('main');
      this.currentCriteria.pageNo = pageNo;
      this.getCategoryData();
    }
  }

  pageSizeChange(pageSize: number) {
    this.spinner.start('main');
    this.currentCriteria.pageSize = pageSize;
    this.currentCriteria.pageNo = 1;
    this.getCategoryData();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.currentCriteria.pageNo = pageNo;
    // this.currentCriteria.params[0].category = 'All';
    this.getCategoryData();
  }

  onCategroyChange(category: string) {
    if (this.currentCategory !== category) {
      this.spinner.start('main');
      this.currentCategory = category;
      this.currentCriteria.params[0].category = category;
      this.currentCriteria.pageNo = 1;
      const selectedCategory = this.categoryData.find((cat: any) => cat.category === category);
      this.categoryUuid = selectedCategory?.uuid || '';
      // if (category === 'All') {
      //   this.router.navigate(['../'], { relativeTo: this.route });
      // } else {
      //   this.router.navigate([this.categoryUuid], { relativeTo: this.route });
      // }
      const newUrl = this.categoryUuid ? `/services/orchestration/tasks/${this.categoryUuid}` : `/services/orchestration/tasks`;
      this.router.navigateByUrl(newUrl);
      this.getCategoryData()
      this.spinner.stop('main');
    }
  }

  onFilterChange() {
    this.spinner.start('main');
    this.currentCriteria.pageNo = 1;
    this.getTaskData();
  }

  getTaskData() {
    this.orchestraionTaskService.getData(this.currentCriteria).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.count = data.count;
      this.viewData = this.orchestraionTaskService.convertToViewData(data.results);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Tasks'));
    });
  }

  taskCrudCheck() {
    this.celeryTaskIds = this.storage.getByKey('celeryTaskId', StorageType.SESSIONSTORAGE);
    if (this.celeryTaskIds && this.celeryTaskIds.length > 0) {
      // Loop through each task ID and call processNextTask
      this.celeryTaskIds.forEach((taskId, index) => {
        this.orchestraionTaskService.pollingResult(taskId)
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(
            (data: TaskStatus) => {
              if (data.state === 'SUCCESS') {
                this.notification.success(new Notification(data.result.data));
                this.celeryTaskIds.splice(index, 1);
                this.storage.put('celeryTaskId', this.celeryTaskIds, StorageType.SESSIONSTORAGE);
                this.getTaskData();
              }
            },
            (err: HttpErrorResponse) => {
              this.spinner.stop('main');
              this.notification.error(new Notification('Failed to get Tasks'));
            }
          );
      });
    }
  }

  getListSummary() {
    this.orchestraionTaskService.getListSummary().pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: ListSummaryResModel) => {
      this.listSummaryViewData = this.orchestraionTaskService.convertToListSummaryViewData(data);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Tasks'));
    });
  }

  // pollingResult(celeryTaskId: string) {
  //   return this.http.get<CeleryTask>(`/task/celeryTaskId/`).pipe(switchMap(res => this.appService.pollForTask(res.task_id, 3, 1000).pipe(take(1))), take(1));
  // }

  getCategoryData() {
    this.spinner.start('main');
    this.orchestraionTaskService.getCategoryData().pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.categoryData = this.orchestraionTaskService.convertToCategoryViewData(data.results);
      // if (this.categoryUuid) {
      if (this.categoryUuid === 'All') {
        this.currentCriteria.params[0].category = 'All';
        this.currentCategory = 'All';
      } else {
        const selectedCategory = this.categoryData.find((cat: any) => cat.uuid === this.categoryUuid);
        const category = selectedCategory?.category;
        this.currentCriteria.params[0].category = category;
        this.currentCategory = category;
      }
      // }
      this.getTaskData();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get Categories'));
    });
  }

  addTask() {
    this.router.navigate(['category', 'create'], { relativeTo: this.route });
  }

  cloneTask(taskName: string, uuid: string) {
    this.taskName = `Copy-${taskName}`;
    this.taskUUID = uuid;
    this.cloneModalRef = this.modalService.show(this.clone, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  addCategory(event: Event) {
    event.stopPropagation();
    this.catUuid = null;
    this.createCategoryForm();
    this.taskModalRef = this.modalService.show(this.createcategory, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  editCategory(catData: { uuid: string, category: string, count: string }, event: Event) {
    event.stopPropagation();
    this.catUuid = catData.uuid;
    this.createCategoryForm(catData);
    this.editCatModalRef = this.modalService.show(this.editcategory, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  deleteCategory(uuid: string, event: Event) {
    event.stopPropagation();
    this.catUuid = uuid;
    this.deleteCatModalRef = this.modalService.show(this.deletecategory, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  editTask(task: TaskViewData) {
    this.taskUUID = task.uuid;
    this.editModelRef = this.modalService.show(this.edit, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmEdit() {
    this.editModelRef.hide();
    if (this.categoryUuid) {
      this.router.navigate(['category', this.taskUUID, 'edit'], { relativeTo: this.route });
    } else {
      this.router.navigate([this.taskUUID, 'edit'], { relativeTo: this.route });
    }
  }

  executeTask(view: TaskViewData) {
    if (this.categoryUuid) {
      this.router.navigate(['category', view.uuid, view.targetType, 'execute'], { relativeTo: this.route });
    } else {
      this.router.navigate([view.uuid, view.targetType, 'execute'], { relativeTo: this.route });
    }
  }

  createCategoryForm(catData?: { uuid: string, category: string, count: string }) {
    this.categoryForm = this.orchestraionTaskService.createCategoryForm(this.catUuid, catData?.category);
    this.categoryFormErrors = this.orchestraionTaskService.resetCategoryFormErrors();
    this.categoryValidationMessages = this.orchestraionTaskService.categoryValidationMessages;
  }

  handleCategoryError(err: any) {
    this.categoryFormErrors = this.orchestraionTaskService.resetCategoryFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    }
    else if (err.detail) {
      this.nonFieldErr = err.detail;
    }
    else if (err) {
      for (const field in err) {
        if (field in this.categoryForm.controls) {
          this.categoryFormErrors[field] = err[field][0];
        }
      }
    } else {
      this.taskModalRef.hide();
      this.notification.error(new Notification(err.non_field_errors ? err.non_field_errors : 'Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  confirmCategoryCreate() {
    if (this.categoryForm.invalid) {
      this.categoryFormErrors = this.utilService.validateForm(this.categoryForm, this.categoryValidationMessages, this.categoryFormErrors);
      this.categoryForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.categoryFormErrors = this.utilService.validateForm(this.categoryForm, this.categoryValidationMessages, this.categoryFormErrors);
      });
    } else {
      let obj = this.categoryForm.getRawValue();
      console.log(this.catUuid, "catuuid")
      if (this.catUuid) {
        this.orchestraionTaskService.updateCategory(this.catUuid, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.editCatModalRef.hide();
          this.spinner.stop('main');
          this.currentCategory = obj.name;
          this.currentCriteria.params[0].category = obj.name;
          // this.getTaskData();
          this.getCategoryData();
          this.notification.success(new Notification('Category updated successfully.'));
        }, (err: HttpErrorResponse) => {
          this.handleCategoryError(err.error);
        });
      } else {
        this.orchestraionTaskService.createCategory(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.taskModalRef.hide();
          this.spinner.stop('main');
          // this.currentCriteria.params[0].category = 'All';
          // this.getTaskData();
          this.getCategoryData();
          this.notification.success(new Notification('Category created successfully.'));
        }, (err: HttpErrorResponse) => {
          this.handleCategoryError(err.error);
        });
      }
    }
  }

  confirmCatDelete() {
    this.deleteCatModalRef.hide();
    this.spinner.start('main');
    this.orchestraionTaskService.deleteCategory(this.catUuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.currentCategory = 'All';
      this.currentCriteria.params[0].category = 'All';
      this.notification.success(new Notification('Category deleted successfully.'));
      this.getCategoryData();
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Unable to delete category as there are tasks associated with it.'));
    });
  }

  deleteTask(UUID: string) {
    this.taskUUID = UUID;
    this.taskDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmTaskDelete() {
    this.taskDeleteModalRef.hide();
    this.spinner.start('main');
    this.orchestraionTaskService.deleteTask(this.taskUUID).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.notification.success(new Notification('Task deleted successfully.'));
      // this.getTaskData();
      this.getCategoryData();
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Task has more than one reference so it can not be deleted!! Please try again.'));
    });
  }

  getHistoryData(uuid: string) {
    this.orchestraionTaskService.getHistoryData(uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.viewHistoryData = this.orchestraionTaskService.convertToHistoryViewData(data);
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to get History'));
    });

  }

  viewHistory(uuid: string) {
    this.taskUUID = uuid;
    this.getHistoryData(this.taskUUID);
    this.taskModalRef = this.modalService.show(this.history, Object.assign({}, { class: 'modal-xl', keyboard: true, ignoreBackdropClick: true }));
  }

  confirmClone() {
    this.spinner.start('main');
    this.orchestraionTaskService.cloneData(this.taskUUID, this.taskName).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      // this.getTaskData();
      this.getCategoryData();
      this.spinner.stop('main');
      this.notification.success(new Notification('Task cloned successfully'));
      this.cloneModalRef.hide();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Failed to clone task'));
      this.cloneModalRef.hide();
    });
  }

  toggleStatus(status: boolean, view: TaskViewData) {
    if (status === true) {
      view['taskStatus'] = true;
    } else {
      view['taskStatus'] = false;
    }
    this.orchestraionTaskService.toggleStatus(view.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to change status'));
    });
  }

  scheduleTasks(view: TaskViewData) {
    if (this.categoryUuid) {
      this.router.navigate(['category', view.uuid, view.targetType, 'scheduleTasks'], { relativeTo: this.route });
    } else {
      this.router.navigate([view.uuid, view.targetType, 'scheduleTasks'], { relativeTo: this.route });
    }
  }
}
