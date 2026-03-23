import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { FileSystemFileEntry } from 'ngx-file-drop';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { KnowledgeManagementCrudService } from './knowledge-management-crud.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'knowledge-management-crud',
  templateUrl: './knowledge-management-crud.component.html',
  styleUrls: ['./knowledge-management-crud.component.scss'],
  providers: [KnowledgeManagementCrudService]
})
export class KnowledgeManagementCrudComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();

  fileNames: string[] = [];
  droppedFiles: File[] = [];
  resourceId: string;
  categories: any[] = [];

  actionMessage: 'Create' | 'Update';
  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;

  constructor(private service: KnowledgeManagementCrudService,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserInfoService,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService) {
    this.route.paramMap.pipe(takeUntil(this.ngUnsubscribe)).subscribe((params: ParamMap) => {
      this.resourceId = params.get('resourceId');
      this.actionMessage = this.resourceId ? 'Update' : 'Create';
    });
  }

  ngOnInit(): void {
    this.getCategories();
    this.buildForm();
  }

  ngOnDestroy(): void {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getCategories() {
    this.categories = [];
    this.service.getCategories().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.categories = res.map(c => c.name);
    })
  }

  buildForm() {
    this.form = this.service.buildForm();
    this.formErrors = this.service.resetFormErrors();
    this.formValidationMessages = this.service.validationMessages;
  }

  fileOver(event: any) {
  }

  fileLeave(event: any) {
  }

  dropped(files: any[]) {
    for (const droppedFile of files) {
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {
          if (!file.name.toLowerCase().endsWith('.txt')) {
            this.notification.warning(new Notification('The service only supports .txt files now.'));
            console.log('Skipped non-txt file:', file.name);
            return;
          }
          this.droppedFiles.push(file);
          this.fileNames.push(`${file.name}`);
          this.form.get('files').setValue(this.fileNames);
        });
      } else {
      }
    }
  }

  removeFile(file: File) {
    this.droppedFiles = this.droppedFiles.filter(f => f != file);
    this.fileNames = this.fileNames.filter(f => f != file.name);
    this.form.get('files').setValue(this.fileNames);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      })
    } else {
      // this.categories.includes(this.form.get('category').value) || this.addCategory(this.form.get('category').value);
      // this.categories.includes(this.form.get('category').value) && this.createResource();
      this.createResource();
    }
  }

  createResource() {
    let formData = new FormData();
    this.droppedFiles.forEach(file => {
      formData.append('files', file, file.name);
    });
    formData.set('category', this.form.get('category').value);
    //default values to send, will be changed later
    formData.set('type', 'txt');
    formData.set('sub_category', 'general');
    this.spinner.start('main');
    this.service.createResource(formData).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.notification.success(new Notification('Resource created successfuly.'));
      this.goBack();
    }, (err: HttpErrorResponse) => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Resource creation failed. Please try again.'));
    });
  }

  addCustomValue(field: string) {
    return (name: string) => {
      // this.addCategory(name);
      return name;
    };
  }

  addCategory(name: string) {
    this.service.createCategory(name).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.createResource();
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Category creation failed. Please try again.'));
    }
    )
  }

  goBack() {
    if (this.actionMessage == 'Create') {
      this.router.navigate(['../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../../'], { relativeTo: this.route });
    }
  }

}
