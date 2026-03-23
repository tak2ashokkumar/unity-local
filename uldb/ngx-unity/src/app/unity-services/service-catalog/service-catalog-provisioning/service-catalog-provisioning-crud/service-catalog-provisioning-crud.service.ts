import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ORCHESTRATION_GET_TASK, SERVICE_CATALOG, SERVICE_CATALOG_METADATA } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { OrchestrationTaskDataType } from 'src/app/unity-services/orchestration/orchestration-tasks/orchestration-task.type';
import { WorkflowDetailsViewData } from 'src/app/unity-services/orchestration/orchestration-workflows/orchestration-workflow-execution/orchestration-workflow-execution.service';
import { WorkflowDetails, WorkflowTask } from 'src/app/unity-services/orchestration/orchestration-workflows/orchestration-workflow-execution/orchestration-workflow-execution.type';
import { Catalog } from '../service-catalog-provisioning-type';


@Injectable()
export class ServiceCatalogProvisioningCrudService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private tableService: TableApiServiceService) { }

  getTaskList(): Observable<any[]> {
    return this.http.get<any[]>(`/${ORCHESTRATION_GET_TASK()}?page_size=0`);
  }

  getWorkflowList(): Observable<any[]> {
    return this.http.get<any[]>(`/orchestration/workflows/?page_size=0`);
  }

  getCatalogDataById(catalogId: string): Observable<any> {
    return this.http.get<any>(SERVICE_CATALOG(catalogId));
  }

  updateCatalog(catalogId: string, obj: Catalog, fileToUpload?: File): Observable<any> {
    if (fileToUpload) {
      const formData = this.manageFormData(obj, fileToUpload);
      return this.http.put<Catalog>(SERVICE_CATALOG(catalogId), formData);
    } else {
      return this.http.put<Catalog>(SERVICE_CATALOG(catalogId), obj);
    }
  }

  createCatalog(obj: Catalog, fileToUpload: File): Observable<any> {
    const formData = this.manageFormData(obj, fileToUpload);
    return this.http.post<Catalog>(SERVICE_CATALOG(), formData);
  }

  getMetaData(): Observable<any> {
    return this.http.get<any>(SERVICE_CATALOG_METADATA());
  }

  getTaskData(uuid: string): Observable<OrchestrationTaskDataType> {
    return this.http.get<OrchestrationTaskDataType>(`${ORCHESTRATION_GET_TASK()}${uuid}/get_variable/`);
  }

  getWorkflowDetails(workflowId: string): Observable<WorkflowDetails> {
    return this.http.get<WorkflowDetails>(`/orchestration/workflows/${workflowId}/get_variable/`);
  }

  buildForm(catalogData: any): FormGroup {
    if (catalogData) {
      let form = this.builder.group({
        'name': [catalogData.name, [Validators.required]],
        'description': [catalogData.description, [Validators.required]],
        'category': [catalogData.category, [Validators.required]],
        'catalog_type': [catalogData.catalog_type, [Validators.required]],
        'price': [catalogData.price, [priceValidator()]],
        'auto_approval': [catalogData.auto_approval, [Validators.required]],
        'inputs': this.builder.group({}),
      });
      if (catalogData.category == 'Operational') {
        form.addControl('logo', new FormControl(catalogData.logo, [Validators.required]));
        form.removeControl('cloud_type');
      } else {
        form.addControl('cloud_type', new FormControl(catalogData.cloud_type, [Validators.required]));
        form.removeControl('logo');
      }
      if (catalogData.catalog_type == 'Task') {
        form.addControl('task', new FormControl(catalogData.task, [Validators.required]));
        form.removeControl('workflow');
      } else {
        form.addControl('workflow', new FormControl(catalogData.workflow, [Validators.required]));
        form.removeControl('task');
      }
      return form;
    } else {
      let form = this.builder.group({
        'name': ['', [Validators.required]],
        'description': ['', [Validators.required]],
        'category': ['', [Validators.required]],
        'catalog_type': ['Task', [Validators.required]],
        'task': ['', [Validators.required]],
        'price': ['', [priceValidator()]],
        'auto_approval': [false, [Validators.required]],
        'inputs': this.builder.group({}),
      });
      return form;
    }
  }

  private manageFormData(obj: any, fileToUpload: File) {
    const formData = new FormData();
    formData.append('name', obj.name);
    formData.append('catalog_type', obj.catalog_type);
    formData.append('description', obj.description);
    formData.append('auto_approval', obj.auto_approval);
    formData.append('category', obj.category);
    formData.append('price', obj.price);
    if (obj.workflow) {
      formData.append('workflow', obj.workflow);
    } else {
      formData.append('task', obj.task);
    }
    if (obj.inputs) {
      formData.append('inputs', JSON.stringify(obj.inputs));
    }
    if (obj.logo) {
      formData.append('logo', fileToUpload);
    } else {
      formData.append('cloud_type', obj.cloud_type);
    }
    return formData;
  }

  resetFormErrors() {
    return {
      'name': '',
      'description': '',
      'logo': '',
      'catalog_type': '',
      'task': '',
      'workflow': '',
      'price': '',
      'auto_approval': '',
      'category': '',
      'cloud_type': '',
      'inputs': {}
    }
  }

  formValidationMessages = {
    'name': {
      'required': 'Name is required'
    },
    'description': {
      'required': 'Description is required'
    },
    'logo': {
      'required': 'Logo is required'
    },
    'category': {
      'required': 'Category is required'
    },
    'cloud_type': {
      'required': 'Cloud is required'
    },
    'catalog_type': {
      'required': 'Catalog Type is required'
    },
    'task': {
      'required': 'Task is required'
    },
    'workflow': {
      'required': 'Workflow is required'
    },
    'auto_approval': {
      'required': 'Auto Approval is required'
    },
    'inputs': {},
    'price': {
      'priceInvalid': 'Price should be greater than 0'
    }
  }

  converToViewData(data: WorkflowDetails): WorkflowDetailsViewData[] {
    let viewData: WorkflowDetailsViewData[] = [];
    if (data.tasks.length) {
      data.tasks.forEach((task: WorkflowTask) => {
        let view: WorkflowDetailsViewData = new WorkflowDetailsViewData();
        view.taskName = task.name;
        view.taskForm = this.buildTaskForm(task);
        view.taskFormErrors = this.resetTaskFormErrors();
        view.taskValidationMessages = this.taskValidationMessages;
        view.type = task.type;
        view.inputs = task.inputs;
        viewData.push(view);
      });
    }
    return viewData;
  }

  converToViewDataWorkflowEdit(data: Catalog): WorkflowDetailsViewData[] {
    let viewData: WorkflowDetailsViewData[] = [];
    if (data.inputs.length) {
      data.inputs.forEach((input: WorkflowTask) => {
        let view: WorkflowDetailsViewData = new WorkflowDetailsViewData();
        view.taskName = input.name;
        view.taskForm = this.buildTaskForm(input);
        view.taskFormErrors = this.resetTaskFormErrors();
        view.taskValidationMessages = this.taskValidationMessages;
        view.type = input.type;
        view.inputs = input.inputs;
        viewData.push(view);
      });
    }
    return viewData;
  }

  buildTaskForm(data: WorkflowTask): FormGroup {
    let form = this.builder.group({
      'name_id': [data?.name_id],
      'uuid': [data?.uuid],
      'name': [data?.name],
    });
    if (data.inputs && data.inputs.length) {
      form.addControl('inputs', this.builder.group({}));
      data.inputs.forEach(input => {
        if (input.param_type === 'Input Template') {
          (form.get('inputs') as FormGroup).addControl(input.param_name, new FormGroup({
            template_name: new FormControl({ value: input.template_name, disabled: false }),
            attribute: new FormControl({ value: input.attribute, disabled: false }),
            param_type: new FormControl({ value: input.param_type, disabled: false }),
            default_value: new FormControl({ value: input.default_value, disabled: false }),
            template: new FormControl({ value: input.template, disabled: false })
          }));
        }
        else {
          const defaultValueGroup = new FormGroup({
            default_value: new FormControl(input.default_value, [Validators.required])
          });
          (form.get('inputs') as FormGroup).addControl(input.param_name, defaultValueGroup);
        }
      });
    }
    return form;
  }

  resetTaskFormErrors() {
    return {
      'inputs': {}
    }
  }

  taskValidationMessages = {
    'inputs': {}
  }

}

export function priceValidator(): ValidatorFn {
  return (control: AbstractControl) => {
    const value = control.value;

    if (value < 0) {
      return { 'priceInvalid': true };
    }
    return null;
  };
}
