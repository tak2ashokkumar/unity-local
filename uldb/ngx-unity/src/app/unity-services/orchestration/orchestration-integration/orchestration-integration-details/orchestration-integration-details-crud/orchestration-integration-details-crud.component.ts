import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { OrchestrationIntegrationDetailsCrudService, ScriptType } from './orchestration-integration-details-crud.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'orchestration-integration-details-crud',
  templateUrl: './orchestration-integration-details-crud.component.html',
  styleUrls: ['./orchestration-integration-details-crud.component.scss'],
  providers: [OrchestrationIntegrationDetailsCrudService]
})
export class OrchestrationIntegrationDetailsCrudComponent implements OnInit {
  private ngUnsubscribe = new Subject();

  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;

  uploadOption: string = 'false';
  scriptId: string;
  scriptData: ScriptType;
  repoId: string;

  fileToUpload: File;
  nonFieldErr: string = '';
  action: string;
  constructor(private svc: OrchestrationIntegrationDetailsCrudService,
    private router: Router,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
  ) {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.scriptId = params.get('scriptId');
      this.repoId = params.get('repoId');
      this.action = this.scriptId ? 'Update' : 'Create';
    });
  }

  ngOnInit(): void {
    if (this.scriptId) {
      this.getScriptDataById();
    } else {
      this.buildForm();
    }
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getScriptDataById() {
    this.spinner.start('main');
    this.svc.getScriptDataById(this.scriptId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
      this.scriptData = data;
      setTimeout(() => { this.buildForm() }, 100)
      this.spinner.stop('main');
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification("Couldn't fetch Script Data"));
    });
  }

  buildForm() {
    this.form = this.svc.buildForm(this.scriptData);
    this.formErrors = this.svc.resetFormErrors();
    this.formValidationMessages = this.svc.formValidationMessages;
    if (this.scriptId) {
      this.uploadOption = this.scriptData.is_source_code.toString();
      // this.form.get('is_source_code').setValue(this.uploadOption);
      if (this.uploadOption === 'true') {
        this.form.addControl('source_code', new FormControl(this.scriptData.content, [Validators.required]));
        this.form.removeControl('script_file');
      } else {
        this.form.addControl('script_file', new FormControl(this.scriptData.file_name, [Validators.required]));
        this.form.removeControl('source_code');
      }
    }
  }

  toggleStatus(uploadOption: string) {
    this.uploadOption = uploadOption;
    this.form.get('is_source_code').setValue(this.uploadOption);
    if (this.scriptId) {
      if (this.uploadOption === 'true') {
        this.form.addControl('source_code', new FormControl(this.scriptData.content, [Validators.required]));
        this.form.removeControl('script_file');
      } else {
        this.form.addControl('script_file', new FormControl(this.scriptData.file_name, [Validators.required]));
        this.form.removeControl('source_code');
      }
    } else {
      if (uploadOption === 'true') {
        this.form.removeControl('script_file');
        this.form.addControl('source_code', new FormControl('', [Validators.required]));
      } else {
        this.form.removeControl('source_code');
        this.form.addControl('script_file', new FormControl('', [Validators.required]));
      }
    }
  }

  playbookFile(files: FileList) {
    if (files && files.length > 0) {
      this.fileToUpload = files[0];
      const fileExtension = this.fileToUpload.name.split('.').pop()?.toLowerCase();
      const scriptType = this.form.get('script_type')?.value;

      const scriptTypeExtensions = {
        'Ansible Playbook': ['yml', 'yaml'],
        'Terraform Script': ['tf'],
        'Bash Script': ['sh'],
        'Python Script': ['py'],
        'Powershell Script': ['ps1']
      };

      if (scriptType && scriptTypeExtensions[scriptType]?.includes(fileExtension)) {
        this.formErrors.script_file = '';
      } else {
        this.fileToUpload = null;
        this.formErrors.script_file = `Invalid file type for ${scriptType}. Please upload valid file type.`;
      }
    } else {
      this.fileToUpload = null;
    }
  }

  addScript() {
    if (this.form.invalid) {
      const rawFormValue = this.form.getRawValue();
      console.log(this.formErrors, "error")
      this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      });
    } else {
      const rawFormValue = this.form.getRawValue();
      rawFormValue.repo = this.repoId;
      this.spinner.start('main');
      if (this.scriptId) {
        if (this.fileToUpload) {
          this.svc.updateScript(this.scriptId, rawFormValue, this.fileToUpload).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
            this.spinner.stop('main');
            this.notification.success(new Notification('Script updated successfully.'));
            this.goBack();
          }, (err: HttpErrorResponse) => {
            this.handleError(err.error);
            this.notification.error(new Notification('Something went wrong!! Please try again.'));
          });
        } else {
          this.svc.updateScript(this.scriptId, rawFormValue).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
            this.spinner.stop('main');
            this.notification.success(new Notification('Script updated successfully.'));
            this.goBack();
          }, (err: HttpErrorResponse) => {
            this.handleError(err.error);
            this.notification.error(new Notification('Something went wrong!! Please try again.'));
          });
        }
      } else {
        this.svc.addScript(rawFormValue, this.fileToUpload).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Script created successfully.'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
          this.notification.error(new Notification('Something went wrong!! Please try again.'));
        });
      }
    }
  }

  handleError(err: any) {
    this.formErrors = this.svc.resetFormErrors();
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err.detail) {
      this.nonFieldErr = err.detail;
    } else if (err) {
      for (const field in err) {
        if (field in this.form.controls) {
          this.formErrors[field] = err[field][0];
        }
      }
    } else {
      this.notification.error(new Notification('Something went wrong!! Please try again.'));
    }
    this.spinner.stop('main');
  }

  goBack() {
    if (this.scriptId) {
      this.router.navigate(['../../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }
}
