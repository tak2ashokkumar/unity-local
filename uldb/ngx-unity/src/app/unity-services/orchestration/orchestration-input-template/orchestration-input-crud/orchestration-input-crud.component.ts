import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { OrchestrationInputCrudService } from './orchestration-input-crud.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'orchestration-input-crud',
  templateUrl: './orchestration-input-crud.component.html',
  styleUrls: ['./orchestration-input-crud.component.scss'],
  providers: [OrchestrationInputCrudService]
})
export class OrchestrationInputCrudComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  templateId: string;

  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;
  categoryForm: FormGroup;
  categoryFormErrors: any;
  categoryValidationMessages: any;
  templateData: inputTemplateType;

  nonFieldErr: string = '';
  categoryList: any[];
  dependencyList: any[];
  dropdownOpen: boolean = false;
  action: 'Update' | 'Create';

  @ViewChild('dropdownContainer') dropdownContainer!: ElementRef;
  taskModalRef: BsModalRef;
  @ViewChild('createcategory') createcategory: ElementRef;

  constructor(private svc: OrchestrationInputCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private modalService: BsModalService,
    private builder: FormBuilder) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.templateId = params.get('templateId');
      this.action = this.templateId ? 'Update' : 'Create';
    });
  }

  ngOnInit(): void {
    this.getFormMetadata();
    if (this.templateId) {
      this.getTemplateDataById();
    } else {
      this.buildForm();
    }
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getFormMetadata() {
    this.categoryList = [];
    this.dependencyList = [];
    this.svc.getCategoryList().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.categoryList = res;
    });
    this.svc.getDependencyList().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.dependencyList = res;
    });
  }

  getTemplateDataById() {
    this.spinner.start('main');
    this.svc.getTemplateDataById(this.templateId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.templateData = res;
      this.buildForm();
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.handleError(err.error);
    });
  }

  buildForm() {
    this.form = this.svc.buildForm(this.templateData);
    this.formErrors = this.svc.resetFormErrors();
    this.formValidationMessages = this.svc.formValidationMessages;
  }

  toggleStatus(state: boolean) {
    if (state == true) {
      this.form.get('template_status').setValue('Enabled');
    } else {
      this.form.get('template_status').setValue('Disabled');
    }
  }


  confirmTemplateCreate() {
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      });
    } else {
      this.spinner.start('main');
      let obj = <any>Object.assign({}, this.form.getRawValue());
      if (this.templateId) {
        this.svc.updateTemplate(this.templateId, obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Task updated Successfully.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.svc.createTemplate(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Task created successfully.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      }
    }
  }

  confirmCategoryCreate() {
    if (this.categoryForm.invalid) {
      this.categoryFormErrors = this.utilService.validateForm(this.categoryForm, this.categoryValidationMessages, this.categoryFormErrors);
      this.categoryForm.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.categoryFormErrors = this.utilService.validateForm(this.categoryForm, this.categoryValidationMessages, this.categoryFormErrors);
      });
    } else {
      let obj = this.categoryForm.getRawValue();
      this.svc.createCategory(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
        this.taskModalRef.hide();
        this.svc.getCategoryList().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
          this.categoryList = res;
          this.spinner.stop('main');
        });
        this.notification.success(new Notification('Category created successfully.'));
      }, (err: HttpErrorResponse) => {
        this.handleCategoryError(err.error);
      });
    }
  }

  handleCategoryError(err: any) {
    this.categoryFormErrors = this.svc.resetCategoryFormErrors();
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
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  handleError(err: any) {
    this.formErrors = this.svc.resetFormErrors();
    this.spinner.stop('main');
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    }
    else if (err.detail) {
      this.nonFieldErr = err.detail;
    }
    else if (err) {
      for (const field in err) {
        if (field in this.form.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.notification.error(new Notification('Something went wrong!! Please try again.'));
    this.spinner.stop('main');
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  onCategoryChange(event: Event) {
    const selectedValue = (event.target as HTMLSelectElement).value;
    if (selectedValue === 'addNew') {
      // Reset the selection
      this.form.get('category')?.setValue('');
      // Handle the Add New action
      this.addNewCategory(event);
    }
  }

  addNewCategory(event: Event) {
    event.stopPropagation(); // Prevent dropdown from closing
    this.dropdownOpen = false;

    this.createCategoryForm();
    this.taskModalRef = this.modalService.show(this.createcategory, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));

  }

  createCategoryForm() {
    this.categoryForm = this.svc.createCategoryForm();
    this.categoryFormErrors = this.svc.resetCategoryFormErrors();
    this.categoryValidationMessages = this.svc.categoryValidationMessages;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (this.dropdownContainer && !this.dropdownContainer.nativeElement.contains(event.target)) {
      this.dropdownOpen = false;
    }
  }

  goBack() {
    if (this.templateId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }
}
