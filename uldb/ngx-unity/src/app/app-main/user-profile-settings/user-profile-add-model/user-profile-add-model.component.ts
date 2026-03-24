import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { UserProfileAddModelService } from './user-profile-add-model.service';
import { AILLMModel, SupportedLLMConfigData } from 'src/app/shared/SharedEntityTypes/ai-chatbot/llm-model.type';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';

@Component({
  selector: 'user-profile-add-model',
  templateUrl: './user-profile-add-model.component.html',
  styleUrls: ['./user-profile-add-model.component.scss'],
  providers: [UserProfileAddModelService]
})
export class UserProfileAddModelComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  llmData: AILLMModel;
  availableModels: any[] = [];
  modelId: string = '';

  action: 'Create' | 'Update';
  form: FormGroup;
  formErrors: any;
  formValidationMessages: any;
  nonFieldErr: String = '';
  providerImages = providerImages;

  compatibleApplications: { key: string, name: string }[] = [];
  appSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'name',
    keyToSelect: 'key',
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 3,
    displayAllSelectedText: true,
    showCheckAll: false,
    showUncheckAll: false,
  };

  // Text configuration
  appTexts: IMultiSelectTexts = {
    defaultTitle: 'Select Applications',
    allSelected: 'All Applications',
  };

  constructor(private svc: UserProfileAddModelService,
    private router: Router,
    private route: ActivatedRoute,
    private utilService: AppUtilityService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,) {
    this.route.paramMap.subscribe(params => this.modelId = params.get('modelId'));
    this.modelId ? this.action = 'Update' : this.action = 'Create';
  }

  ngOnInit(): void {
    if (this.modelId) {
      this.getLLMModelData();
    } else {
      this.getLLMModelList();
    }
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getLLMModelData() {
    this.spinner.start('main');
    this.svc.getLLMModelData(this.modelId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.llmData = res;
      this.getLLMModelList();
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get LLM data'));
      this.spinner.stop('main');
    });
  }

  getLLMModelList() {
    this.svc.getLLMModelList().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      // edit : show all create : show the models which are not already owned by user
      this.availableModels = this.modelId ? res : res?.filter(m => !m.is_user_owned);
      this.buildForm();
    }, (err: HttpErrorResponse) => {
      this.buildForm();
      this.notification.error(new Notification('Failed to get Supported Llms'));
      this.spinner.stop('main');
    });
  }

  buildForm() {
    let selectedModel: SupportedLLMConfigData
    if (this.modelId && this.llmData && this.availableModels?.length) {
      selectedModel = this.availableModels.find(m =>
        m.provider == this.llmData.provider &&
        m.model_name == this.llmData.model_name
      );
      if(selectedModel?.compatible_applications){
        let keys = Object.keys(selectedModel?.compatible_applications);
        keys.forEach(k => {
          this.compatibleApplications.push({ 'key': k, 'name': selectedModel?.compatible_applications[k] })
        })
      }
    }
    this.form = this.svc.buildForm(this.llmData, selectedModel);
    this.formErrors = this.svc.resetFormErrors();
    this.formValidationMessages = this.svc.formValidationMessages;
    this.spinner.stop('main');

    this.form.get('model_and_provider').valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val => {
      this.compatibleApplications = [];
      if (val?.compatible_applications) {
        let keys = Object.keys(val?.compatible_applications);
        keys.forEach(k => {
          this.compatibleApplications.push({ 'key': k, 'name': val?.compatible_applications[k] })
        })
      }

      if (this.form.get('active_for_applications')) {
        this.form.get('active_for_applications').setValue([], [Validators.required]);
      } else {
        this.form.addControl('active_for_applications', new FormControl([], [Validators.required]));
      }
    })
  }

  onModelSelected(value: any) {
    this.form.patchValue({
      model_and_provider: value
    });
    this.formErrors['model_and_provider'] = '';
    // Auto fill dependent fields
    this.form.patchValue({
      description: value.description || '',
      endpoint_url: value.endpoint_url || ''
    });

  }

  confirmAddOrEditModel() {
    const selected = this.form.get('model_and_provider')?.value;
    if (selected) {
      this.form.patchValue({ provider: selected.provider, model_name: selected.model_name });
    }
    this.form.removeControl('model_and_provider');
    let obj = Object.assign({}, this.form.getRawValue());
    if (this.form.invalid) {
      this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      console.log('errors : ', this.formErrors);
      this.form.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((data: any) => {
        this.formErrors = this.utilService.validateForm(this.form, this.formValidationMessages, this.formErrors);
      });
    } else {
      this.spinner.start('main');
      if (this.llmData) {
        this.svc.updateModel(obj, this.modelId).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Model Updated Successfully'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.handleError(err.error);
        });
      } else {
        this.svc.addModel(obj).pipe(takeUntil(this.ngUnsubscribe)).subscribe(data => {
          this.spinner.stop('main');
          this.notification.success(new Notification('Model Added Successfully'));
          this.goBack();
        }, (err: HttpErrorResponse) => {
          this.spinner.stop('main');
          this.handleError(err.error);
        });
      }
    }
  }

  handleError(err: any) {
    // this.formErrors = this.svc.resetFormErrors();
    this.spinner.stop('main');
    if (err.non_field_errors) {
      this.nonFieldErr = err.non_field_errors[0];
    } else if (err.error) {
      if (err.error == "verification_failed") {
        this.nonFieldErr = "Verification failed for this configuration. Please ensure correct model name and the API key."
      } else {
        this.nonFieldErr = err.error
      }
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

  goBack() {
    if (this.modelId) {
      this.router.navigate(['../../'], { relativeTo: this.route })
    } else {
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

}

const providerImages = {
  openai: 'static/assets/images/external-brand/ai-models/openai.svg',
  anthropic: 'static/assets/images/external-brand/ai-models/claude-color.svg',
  google: 'static/assets/images/external-brand/ai-models/gemini.svg',
  groq: 'static/assets/images/external-brand/ai-models/grok.svg'
};