import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { FieldsType, InputParamsType, OutputParamsType } from '../orchestration-agentic-workflow-container/orchestration-agentic-workflow-container.type';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { DeviceDiscoveryCredentials } from 'src/app/unity-setup/discovery-credentials/discovery-credentials.type';
import { GET_ADVANCED_DISCOVERY_CREDENTIALS } from 'src/app/shared/api-endpoint.const';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { UnityServicesModule } from 'src/app/unity-services/unity-services.module';
import { CorrelationRuleFields } from 'src/app/unity-services/aiml-event-mgmt/aiml-rules/aiml-rules.type';
import { QueryBuilderConfig, Rule, RuleSet } from 'src/app/shared/query-builder/query-builder.interfaces';

@Injectable()
export class OrchestrationAgenticWorkflowParamsService {

  constructor(private fb: FormBuilder,
    private http: HttpClient
  ) { }

  private valueToSQL(value) {
    switch (typeof value) {
      case 'string':
        return "'" + value + "'";
      case 'boolean':
        return value ? '1' : '0';
      case 'number':
        if (isFinite(value)) return value;
    }
  }

  private isDefined(value) {
    return value !== undefined;
  }


  getTableList(): Observable<any> {
    return this.http.get<any>(`rest/unity_itsm/tables/?is_enabled=true`);
  }

  getTableDetails(uuid: string): Observable<any> {
    return this.http.get<any>(`rest/unity_itsm/tables/${uuid}/`);
  }

  getDropdownFields(aimlType?: string): Observable<CorrelationRuleFields[]> {
    let params = new HttpParams().append("aiml_type", aimlType)
    return this.http.get<CorrelationRuleFields[]>(`rest/orchestration/aiml/field_meta/`, { params: params });
  }

  buildTaskForm(nodeData, nodeId) {
    // if (nodeData?.formErrors) {
    //   this.resetTaskForm = nodeData.formErrors;
    // }
    const valid = nodeData?.config?.target_type === 'Host' ? [Validators.required, NoWhitespaceValidator] : [];
    return this.fb.group({
      name: [nodeData.name, [Validators.required, NoWhitespaceValidator]],
      target: [nodeData?.config?.target, valid],
      credential: [nodeData?.config?.credential, valid],
      inputs: this.fb.array(nodeData.inputs.map(input => this.createInputParamGroup(input))),
      // outputs: nodeData.outputs ? this.fb.array(nodeData.outputs?.map(input => this.createOutputParamGroup(input))) : [],
      timeouts: [nodeData?.config?.settings?.timeout ? nodeData?.config?.settings?.timeout : 3600],
      retries: [nodeData?.config?.settings?.retries ? nodeData?.config?.settings?.retries : 0],
      continue_on_failure: [nodeData?.config?.settings?.continue_on_failure ? nodeData?.config?.settings?.continue_on_failure : false],
      node_id: [nodeId]
    });

  }

  resetTaskForm() {
    return {
      'name': '',
      'target': '',
      'credential': '',
      'inputs': [],
      'outputs': []
    }
  }

  taskFormValidationMessage = {
    'name': {
      'required': 'Name is required.'
    },
    'target': {
      'required': 'Target is required.'
    },
    'credential': {
      'required': 'Credential is required.'
    },
    'inputs': {
      'default_value': {
        'required': 'Value is required.'
      }
    },
    'outputs': {
      'param_name': {
        'required': 'Param name is required in added output.',
      },
      'expression_type': {
        'required': 'Type  of Expression is required in added output.'
      },
      'expression': {
        'required': 'Expression is required in added output.'
      },
    }
  }

  createInputParamGroup(input: InputParamsType) {
    const isComplexType = input.param_type === 'List' || input.param_type === 'Dictionary';

    const defaultValue = isComplexType ? JSON.stringify(input.default_value) : (input.default_value || '');

    return this.fb.group({
      param_name: [input.param_name || ''],
      // param_type: [input.param_type || ''],
      default_value: [defaultValue, [Validators.required, NoWhitespaceValidator]],
    });
  }

  createOutputParamGroup(input: OutputParamsType) {
    return this.fb.group({
      param_name: [input.param_name || ''],
      expression_type: [input.expression_type || ''],
      expression: [input.expression || ''],
    })
  }

  buildIfElseForm(selectedCondition, nodeId) {
    // if (selectedCondition?.formErrors) {
    //   this.resetIfElseForm = selectedCondition.formErrors;
    // }
    return this.fb.group({
      name: [selectedCondition?.name ? selectedCondition?.name : 'If Else', [Validators.required, NoWhitespaceValidator]],
      node_id: [nodeId],
      operator: [selectedCondition?.config.operator ? selectedCondition?.config.operator : '', [Validators.required, NoWhitespaceValidator]],
      condition_value: [selectedCondition?.config.condition_value ? selectedCondition?.config.condition_value : '', [Validators.required, NoWhitespaceValidator]],
      condition_key: [selectedCondition?.config.condition_key ? selectedCondition?.config.condition_key : '', [Validators.required, NoWhitespaceValidator]],
      timeouts: [selectedCondition?.config?.settings?.timeout ? selectedCondition?.config?.settings?.timeout : 3600],
      retries: [selectedCondition?.config?.settings?.retries ? selectedCondition?.config?.settings?.retries : 0],
      continue_on_failure: [selectedCondition?.config?.settings?.continue_on_failure ? selectedCondition?.config?.settings?.continue_on_failure : false],
    })
  }

  resetIfElseForm() {
    return {
      'name': '',
      'operator': '',
      'condition_value': '',
      'condition_key': '',
      'outputs': []
    }
  }

  ifElseFormValidationMessage = {
    'name': {
      'required': 'Name is required.'
    },
    'operator': {
      'required': 'Operator is required.'
    },
    'condition_value': {
      'required': 'Condition Value is required.'
    },
    'condition_key': {
      'required': 'Condition Key is required.'
    },
    'outputs': {
      'param_name': {
        'required': 'Param name is required in added output.',
      },
      'expression_type': {
        'required': 'Type  of Expression is required in added output.'
      },
      'expression': {
        'required': 'Expression is required in added output.'
      },
    }
  }

  buildSwitchForm(selectedCondition, nodeId) {
    const switchConditionsArray = this.fb.array([]);
    if (selectedCondition) {
      selectedCondition?.config?.conditions?.forEach(cfg => {
        switchConditionsArray.push(this.fb.group({
          condition_key: this.fb.control(cfg?.condition_key || '', [Validators.required, NoWhitespaceValidator]),
          operator: this.fb.control(cfg?.operator || '', [Validators.required]),
          condition_value: this.fb.control(cfg?.condition_value || '', [Validators.required, NoWhitespaceValidator]),
        }));
      });
    } else {
      switchConditionsArray.push(this.fb.group({
        condition_key: this.fb.control('', [Validators.required, NoWhitespaceValidator]),
        operator: this.fb.control('', [Validators.required]),
        condition_value: this.fb.control('', [Validators.required, NoWhitespaceValidator])
      }));
    }

    return this.fb.group({
      name: this.fb.control(selectedCondition?.name || 'Switch Case', { validators: [Validators.required] }),
      node_id: this.fb.control(nodeId),
      switchConditions: switchConditionsArray,
      timeouts: [selectedCondition?.config?.settings?.timeout ? selectedCondition?.config?.settings?.timeout : 3600],
      retries: [selectedCondition?.config?.settings?.retries ? selectedCondition?.config?.settings?.retries : 0],
      continue_on_failure: [selectedCondition?.config?.settings?.continue_on_failure ? selectedCondition?.config?.settings?.continue_on_failure : false],
    });
  }

  resetSwitchForm() {
    return {
      'name': '',
      'switchConditions': [],
      'outputs': []
    };
  }

  switchFormValidationMessage = {
    'name': {
      'required': 'Name is required.'
    },
    'switchConditions': {
      'condition_key': {
        'required': 'Condition Key is required.'
      },
      'operator': {
        'required': 'Operator is required.'
      },
      'condition_value': {
        'required': 'Condition Value is required.'
      }
    },
    'outputs': {
      'param_name': {
        'required': 'Param name is required in added output.',
      },
      'expression_type': {
        'required': 'Type  of Expression is required in added output.'
      },
      'expression': {
        'required': 'Expression is required in added output.'
      },
    }
  };



  buildEmailForm(selectedOutput, nodeId) {
    return this.fb.group({
      name: [selectedOutput?.name ? selectedOutput?.name : 'Email', [Validators.required, NoWhitespaceValidator]],
      node_id: [nodeId],
      to: [selectedOutput?.config ? selectedOutput?.config?.to : '', [Validators.required, NoWhitespaceValidator]],
      subject: [selectedOutput?.config ? selectedOutput?.config?.subject : '', [Validators.required, NoWhitespaceValidator]],
      body: [selectedOutput?.config ? selectedOutput?.config?.body : '', [Validators.required, NoWhitespaceValidator]],
      timeouts: [selectedOutput?.config?.settings?.timeout ? selectedOutput?.config?.settings?.timeout : 3600],
      retries: [selectedOutput?.config?.settings?.retries ? selectedOutput?.config?.settings?.retries : 0],
      continue_on_failure: [selectedOutput?.config?.settings?.continue_on_failure ? selectedOutput?.config?.settings?.continue_on_failure : false],
    })
  }

  resetEmailForm() {
    return {
      'name': '',
      'to': '',
      'subject': '',
      'body': '',
      'outputs': []
    }
  }

  emailFormValidationMessage = {
    'name': {
      'required': 'Name is required.'
    },
    'to': {
      'required': 'To is required.'
    },
    'subject': {
      'required': 'Subject is required.'
    },
    'body': {
      'required': 'Body is required.'
    },
    'outputs': {
      'param_name': {
        'required': 'Param name is required in added output.',
      },
      'expression_type': {
        'required': 'Type  of Expression is required in added output.'
      },
      'expression': {
        'required': 'Expression is required in added output.'
      },
    },
  }

  buildChartForm(selectedOutput, nodeId) {
    return this.fb.group({
      name: [selectedOutput?.name ? selectedOutput?.name : 'Chart', [Validators.required, NoWhitespaceValidator]],
      node_id: [nodeId],
      chart_type: [selectedOutput?.chart_type ? selectedOutput?.chart_type : 'Pie', [Validators.required, NoWhitespaceValidator]],
      x_label: [selectedOutput?.config ? selectedOutput?.config?.x_label : '', [Validators.required, NoWhitespaceValidator]],
      y_label: [selectedOutput?.config ? selectedOutput?.config?.y_label : '', [Validators.required, NoWhitespaceValidator]],
      x_values: [selectedOutput?.config ? selectedOutput?.config?.x_values : '', [Validators.required, NoWhitespaceValidator]],
      y_values: [selectedOutput?.config ? selectedOutput?.config?.y_values : '', [Validators.required, NoWhitespaceValidator]],
      timeouts: [selectedOutput?.config?.settings?.timeout ? selectedOutput?.config?.settings?.timeout : 3600],
      retries: [selectedOutput?.config?.settings?.retries ? selectedOutput?.config?.settings?.retries : 0],
      continue_on_failure: [selectedOutput?.config?.settings?.continue_on_failure ? selectedOutput?.config?.settings?.continue_on_failure : false],
    })
  }

  resetChartForm() {
    return {
      'name': '',
      'chart_type': '',
      'x_label': '',
      'y_label': '',
      'x_values': '',
      'y_values': '',
      'outputs': []
    }
  }

  chartFormValidationMessage = {
    'name': {
      'required': 'Name is required.'
    },
    'chart_type': {
      'required': 'Chart Type is required.'
    },
    'x_label': {
      'required': 'X Label is required.'
    },
    'y_label': {
      'required': 'Y Label is required.'
    },
    'x_values': {
      'required': 'X Values is required.'
    },
    'y_values': {
      'required': 'Y Values is required.'
    },
    'outputs': {
      'param_name': {
        'required': 'Param name is required in added output.',
      },
      'expression_type': {
        'required': 'Type  of Expression is required in added output.'
      },
      'expression': {
        'required': 'Expression is required in added output.'
      },
    }
  }

  buildSourceTaskForm(selectedSourceTask, nodeId) {
    return this.fb.group({
      name: [selectedSourceTask.name, [Validators.required, NoWhitespaceValidator]],
      inputs: this.fb.array(selectedSourceTask.inputs.map(input => this.createInputParamGroup(input))),
      timeouts: [selectedSourceTask?.config?.settings?.timeout ? selectedSourceTask?.config?.settings?.timeout : 3600],
      retries: [selectedSourceTask?.config?.settings?.retries ? selectedSourceTask?.config?.settings?.retries : 0],
      continue_on_failure: [selectedSourceTask?.config?.settings?.continue_on_failure ? selectedSourceTask?.config?.settings?.continue_on_failure : false],
      node_id: [nodeId]
    });
  }

  resetSourceTaskForm(selectedSourceTask?: any) {
    return {
      'name': '',
      'inputs': [],
      'outputs': []
    };
  }


  sourceTaskFormValidationMessage = {
    'name': {
      'required': 'Name is required.'
    },
    'inputs': [
      { 'default_value': { 'required': 'Default value is required for added input.' } }
    ],
    'outputs': {
      'param_name': {
        'required': 'Param name is required in added output.',
      },
      'expression_type': {
        'required': 'Type  of Expression is required in added output.'
      },
      'expression': {
        'required': 'Expression is required in added output.'
      },
    }
  }

  buildActionTaskForm(selectedActionTask, nodeId) {
    return this.fb.group({
      name: [selectedActionTask.name, [Validators.required, NoWhitespaceValidator]],
      inputs: this.fb.array(selectedActionTask.inputs.map(input => this.createInputParamGroup(input))),
      timeouts: [selectedActionTask?.config?.settings?.timeout ? selectedActionTask?.config?.settings?.timeout : 3600],
      retries: [selectedActionTask?.config?.settings?.retries ? selectedActionTask?.config?.settings?.retries : 0],
      continue_on_failure: [selectedActionTask?.config?.settings?.continue_on_failure ? selectedActionTask?.config?.settings?.continue_on_failure : false],
      node_id: [nodeId]
    });
  }

  resetActionTaskForm(selectedActionTask?: any) {
    return {
      'name': '',
      'inputs': [],
      'outputs': []
    };
  }


  actionTaskFormValidationMessage = {
    'name': {
      'required': 'Name is required.'
    },
    'inputs': [
      { 'default_value': { 'required': 'Default value is required for added input.' } }
    ],
    'outputs': {
      'param_name': {
        'required': 'Param name is required in added output.',
      },
      'expression_type': {
        'required': 'Type  of Expression is required in added output.'
      },
      'expression': {
        'required': 'Expression is required in added output.'
      },
    }
  }

  buildLLMForm(selectedLLM, nodeId) {
    return this.fb.group({
      name: [selectedLLM?.name ? selectedLLM?.name : 'LLM', [Validators.required, NoWhitespaceValidator]],
      node_id: [nodeId],
      prompt: [selectedLLM?.config ? selectedLLM?.config?.prompt : '', [Validators.required, NoWhitespaceValidator]],
      model: [selectedLLM?.config?.model?.llm_integ || '', [Validators.required, NoWhitespaceValidator]],
      timeouts: [selectedLLM?.config?.settings?.timeout ? selectedLLM?.config?.settings?.timeout : 3600],
      retries: [selectedLLM?.config?.settings?.retries ? selectedLLM?.config?.settings?.retries : 0],
      continue_on_failure: [selectedLLM?.config?.settings?.continue_on_failure ? selectedLLM?.config?.settings?.continue_on_failure : false],
    })
  }

  resetLLMForm() {
    return {
      'name': '',
      'prompt': '',
      'model': '',
      'outputs': []
    }
  }

  llmFormValidationMessage = {
    'name': {
      'required': 'Name is required.'
    },
    'prompt': {
      'required': 'Prompt is required.'
    },
    'model': {
      'required': 'Model is required.'
    },
    'outputs': {
      'param_name': {
        'required': 'Param name is required in added output.',
      },
      'expression_type': {
        'required': 'Type  of Expression is required in added output.'
      },
      'expression': {
        'required': 'Expression is required in added output.'
      },
    }
  }


  buildAIAgentForm(selectedLLM, nodeId) {
    return this.fb.group({
      name: [selectedLLM?.name ? selectedLLM?.name : 'LLM', [Validators.required, NoWhitespaceValidator]],
      node_id: [nodeId],
      user_prompt: [selectedLLM?.config ? selectedLLM?.config?.user_prompt : '', [Validators.required, NoWhitespaceValidator]],
      system_prompt: [selectedLLM?.config ? selectedLLM?.config?.system_prompt : ''],
      model: [selectedLLM?.config?.model?.llm_integ || '', [Validators.required, NoWhitespaceValidator]],
      memory: [selectedLLM?.config?.memory?.type || ''],
      tools: this.fb.array(selectedLLM.config.tools.map(tool => this.createToolsGroup(tool))),
      timeouts: [selectedLLM?.config?.settings?.timeout ? selectedLLM?.config?.settings?.timeout : 3600],
      retries: [selectedLLM?.config?.settings?.retries ? selectedLLM?.config?.settings?.retries : 0],
      continue_on_failure: [selectedLLM?.config?.settings?.continue_on_failure ? selectedLLM?.config?.settings?.continue_on_failure : false],
    })
  }

  resetAIAgentForm() {
    return {
      'name': '',
      'user_prompt': '',
      'model': '',
      'tools': [],
      'outputs': []
    }
  }

  aiAgentFormValidationMessage = {
    'name': {
      'required': 'Name is required.'
    },
    'model': {
      'required': 'Model is required.'
    },
    'user_prompt': {
      'required': 'User Prompt is required.'
    },
    'tools': {
      'name': {
        'required': 'Tool selection is required.'
      },
      'credential': {
        'required': 'Credential is required.'
      },
      'target': {
        'required': 'Target is required.'
      },
      'inputs': {
        'default_value': {
          'required': 'Default value is required in added input.'
        }
      },
      'outputs': {
        'param_name': {
          'required': 'Param name is required in added output.',
        },
        'expression_type': {
          'required': 'Type  of Expression is required in added output.'
        },
        'expression': {
          'required': 'Expression is required in added output.'
        },
      }
    }
  };

  createToolsGroup(tool) {
    return this.fb.group({
      name: [tool?.name || '', [Validators.required]],
      type: [tool?.type || ''],
      target: [tool?.config?.target || '', [Validators.required, NoWhitespaceValidator]],
      target_type: [tool?.config?.target_type || '', [Validators.required, NoWhitespaceValidator]],
      credential: [tool?.config?.credential || '', [Validators.required, NoWhitespaceValidator]],
      cloud_type: [tool?.config?.cloud_type ?? tool?.cloud_type ?? null],
      task: [tool?.task ?? tool?.task ?? ''],
      inputs: this.fb.array(
        (tool?.inputs ?? []).map(input => this.createInputParamGroup(input))
      )
    });
  }



  /////////////////////////////////////////// OUTPUT FORM /////////////////////////////////////////// 
  // creteOutputArray(nodeData?: any) {
  //   return this.fb.array([nodeData]);
  // }

  creteOutputArray(nodeData?: any): FormArray {
    console.log(nodeData, "node data output")
    if (!nodeData?.outputs?.length) {
      return this.fb.array([]);
    }

    return this.fb.array(
      nodeData.outputs.map(output =>
        this.fb.group({
          param_name: [output.param_name, Validators.required],
          expression_type: [output.expression_type, Validators.required],
          expression: [output.expression, Validators.required]
        })
      )
    );
  }

  createOuputForm(): FormGroup {
    return this.fb.group({
      outputs: this.fb.array([])
    });
  }

  createOutput(param_name: string = '', expression_type: string = '', expression: string = ''): FormGroup {
    return this.fb.group({
      param_name: [param_name, Validators.required],
      expression_type: [expression_type, Validators.required],
      expression: [expression, Validators.required]
    });
  }

  getOutputs(form: FormGroup): FormArray {
    return form.get('outputs') as FormArray;
  }

  addOutput(form: FormGroup, param_name: string = '', expression_type: string = '', expression: string = ''): void {
    this.getOutputs(form).push(this.createOutput(param_name, expression_type, expression));
  }

  removeOutput(form: FormGroup, index: number): void {
    this.getOutputs(form).removeAt(index);
  }

  outputFormErrors() {
    return {
      'outputs': []
    };
  }

  outputValidationMessage = {
    'outputs': {
      'param_name': {
        'required': 'Param name is required in added output.',
      },
      'expression_type': {
        'required': 'Type  of Expression is required in added output.'
      },
      'expression': {
        'required': 'Expression is required in added output.'
      },
    }
  }

  /////////////////////////////////////////////// TRIGGER & SCHEDULE TRIGGER FORM /////////////////////////////////////////// 

  getAllCloud(): Observable<any> {
    let param = new HttpParams().set('page_size', 0);
    return this.http.get<any>(`customer/cloud_fast/`, { params: param });
  }

  getCredentials(): Observable<Array<DeviceDiscoveryCredentials>> {
    let param = new HttpParams().set('page_size', 0);
    return this.http.get<Array<DeviceDiscoveryCredentials>>(GET_ADVANCED_DISCOVERY_CREDENTIALS(), { params: param });
  }

  getHost(search: string): Observable<any> {
    let params = new HttpParams().set('page_size', 0).set('search', search);
    return this.http.get<any>(`customer/advanced_search_fast/`, { params: params });
  }

  buildParameterForm(isDefaultRequired: boolean = false): FormGroup {
    return this.fb.group({
      param_name: ['', [Validators.required, paramNameValidator]],
      param_type: ['', Validators.required],
      default_value: ['', isDefaultRequired ? Validators.required : []]
    });
  }

  createTriggerForm(nodeData, nodeId): FormGroup {
    return this.fb.group({
      name: [nodeData.name, [Validators.required]],
      inputs: this.fb.array([
        this.buildParameterForm(false)
      ])
    });
  }

  getTriggers(form: FormGroup): FormArray {
    return form.get('inputs') as FormArray;
  }

  triggerFormErrors(nodeData, nodeId) {
    return {
      'inputs': []
    };
  }

  triggerValidationMessage = {
    'inputs': {
      'param_name': {
        'required': 'Param name is required in added input.',
        'invalidParamName': 'Must start with a letter or underscore; only letters, numbers, and underscores allowed.'
      },
      'param_type': {
        'required': 'Param type is required in added input.'
      }
    }
  }

  createScheduleTriggerForm(nodeData, nodeId): FormGroup {
    return this.fb.group({
      name: [nodeData.name],
      inputs: this.fb.array([
        this.buildParameterForm(true)
      ])
    });
  }

  scheduleTriggerFormErrors(nodeData, nodeId) {
    return {
      'inputs': []
    };
  }


  scheduleTriggerValidationMessage = {
    'inputs': {
      'param_name': {
        'required': 'Param name is required in added input.',
        'invalidParamName': 'Must start with a letter or underscore; only letters, numbers, and underscores allowed.'
      },
      'param_type': {
        'required': 'Param type is required in added input.'
      },
      'default_value': {
        'required': 'Default value is required in added input.'
      },
    }
  }


  createItsmTriggerForm(nodeData, nodeId): FormGroup {
    return this.fb.group({
      name: [nodeData.name ? nodeData.name : '', [Validators.required]],
      itsm_table: [nodeData?.config?.itsm_table ? nodeData?.config?.itsm_table : '', [Validators.required]],
      event_type: [nodeData?.config?.event_type ? nodeData?.config?.event_type : [], [Validators.required]],
      skip_workflow_event: [nodeData?.config?.skip_workflow_event ? nodeData?.config?.skip_workflow_event : false],
    });
  }

  itsmTriggerFormErrors(nodeData, nodeId) {
    if (nodeData?.formErrors) {
      return { ...nodeData.formErrors };
    }

    return {
      name: '',
      itsm_table: '',
      event_type: ''
    };
  }


  itsmTriggerValidationMessage = {
    'name': {
      'required': 'Name is required.'
    },
    'itsm_table': {
      'required': 'Table or Module is required.'
    },
    'event_type': {
      'required': 'Event Type is required.'
    }
  }


  createWebhookTriggerForm(nodeData, nodeId): FormGroup {
    return this.fb.group({
      name: [nodeData.name ? nodeData.name : '', [Validators.required]],
      webhook_url: [{ value: nodeData?.config?.webhook_url ? nodeData?.config?.webhook_url : '', disabled: true }, [Validators.required]],
      payload: [
        nodeData?.config?.payload
          ? JSON.stringify(nodeData.config.payload, null, 2)
          : '{}',
        [Validators.required]
      ],

    });
  }

  webhookTriggerFormErrors = {
    name: '',
    webhook_url: '',
    payload: ''
  }

  webhookTriggerValidationMessage = {
    'name': {
      'required': 'Name is required.'
    },
    'payload': {
      'required': 'Payload is required.'
    }
  }

  createTicketForm(nodeData, nodeId): FormGroup {
    return this.fb.group({
      name: [nodeData.name ? nodeData.name : '', [Validators.required]],
      itsm_table: [nodeData?.config?.itsm_table ? nodeData?.config?.itsm_table : '', [Validators.required]],
      inputs: this.fb.array(nodeData?.inputs.map(input => this.itsmFieldsGroup(input))),
      timeouts: [nodeData?.config?.settings?.timeout ? nodeData?.config?.settings?.timeout : 3600],
      retries: [nodeData?.config?.settings?.retries ? nodeData?.config?.settings?.retries : 0],
      continue_on_failure: [nodeData?.config?.settings?.continue_on_failure ? nodeData?.config?.settings?.continue_on_failure : false],
      // inputs: this.fb.array([]),
    });
  }

  createTicketFormErrors(nodeData, nodeId) {
    if (nodeData?.formErrors) {
      return { ...nodeData.formErrors };
    }

    return {
      name: '',
      itsm_table: '',
      inputs: [],
      outputs: []
    };
  }

  createTicketValidationMessage = {
    'name': {
      'required': 'Name is required.'
    },
    'itsm_table': {
      'required': 'Table or Module is required.'
    },
    'inputs': {
      'default_value': {
        'required': 'Value is required.'
      }
    },
    'outputs': {
      'param_name': {
        'required': 'Param name is required in added output.',
      },
      'expression_type': {
        'required': 'Type  of Expression is required in added output.'
      },
      'expression': {
        'required': 'Expression is required in added output.'
      },
    }
  }

  updateTicketForm(nodeData, nodeId): FormGroup {
    return this.fb.group({
      name: [nodeData.name ? nodeData.name : '', [Validators.required]],
      itsm_table: [nodeData?.config?.itsm_table ? nodeData?.config?.itsm_table : '', [Validators.required]],
      ticket_id: [nodeData?.config?.ticket_id ? nodeData?.config?.ticket_id : '', [Validators.required]],
      inputs: this.fb.array(nodeData?.inputs.map(input => this.itsmFieldsGroup(input))),
      timeouts: [nodeData?.config?.settings?.timeout ? nodeData?.config?.settings?.timeout : 3600],
      retries: [nodeData?.config?.settings?.retries ? nodeData?.config?.settings?.retries : 0],
      continue_on_failure: [nodeData?.config?.settings?.continue_on_failure ? nodeData?.config?.settings?.continue_on_failure : false],
    });
  }

  updateTicketFormErrors(nodeData, nodeId) {
    if (nodeData?.formErrors) {
      return { ...nodeData.formErrors };
    }

    return {
      name: '',
      itsm_table: '',
      ticket_id: '',
      inputs: [],
      outputs: []
    };
  }

  updateTicketValidationMessage = {
    'name': {
      'required': 'Name is required.'
    },
    'itsm_table': {
      'required': 'Table or Module is required.'
    },
    'ticket_id': {
      'required': 'Ticket Id is required.'
    },
    'inputs': {
      'param_name': {
        'required': 'Field Name is required.'
      },
      'default_value': {
        'required': 'Value is required.'
      }
    },

    'outputs': {
      'param_name': {
        'required': 'Param name is required in added output.',
      },
      'expression_type': {
        'required': 'Type  of Expression is required in added output.'
      },
      'expression': {
        'required': 'Expression is required in added output.'
      },
    }
  }

  commentInTicketForm(nodeData, nodeId): FormGroup {
    return this.fb.group({
      name: [nodeData.name ? nodeData.name : '', [Validators.required]],
      itsm_table: [nodeData?.config?.itsm_table ? nodeData?.config?.itsm_table : '', [Validators.required]],
      ticket_id: [nodeData?.config?.ticket_id ? nodeData?.config?.ticket_id : '', [Validators.required]],
      field_name: [nodeData?.config?.field_name ? nodeData?.config?.field_name : '', [Validators.required]],
      comment: [nodeData?.config?.comment ? nodeData?.config?.comment : '', [Validators.required]],
      timeouts: [nodeData?.config?.settings?.timeout ? nodeData?.config?.settings?.timeout : 3600],
      retries: [nodeData?.config?.settings?.retries ? nodeData?.config?.settings?.retries : 0],
      continue_on_failure: [nodeData?.config?.settings?.continue_on_failure ? nodeData?.config?.settings?.continue_on_failure : false],
    });
  }


  commentInTicketFormErrors(nodeData, nodeId) {
    if (nodeData?.formErrors) {
      return { ...nodeData.formErrors };
    }

    return {
      name: '',
      itsm_table: '',
      ticket_id: '',
      comment: '',
      inputs: []
    };
  }

  commentInTicketFormValidationMessage = {
    'name': {
      'required': 'Name is required.'
    },
    'itsm_table': {
      'required': 'Table or Module is required.'
    },
    'ticket_id': {
      'required': 'Ticket Id is required.'
    },
    'comment': {
      'required': 'Comment is required.'
    },
    'inputs': {
      'default_value': {
        'required': 'Value is required.'
      }
    }
  }


  getTicketForm(nodeData, nodeId): FormGroup {
    return this.fb.group({
      name: [nodeData.name ? nodeData.name : '', [Validators.required]],
      itsm_table: [nodeData?.config?.itsm_table ? nodeData?.config?.itsm_table : '', [Validators.required]],
      filters: this.fb.array(
        nodeData?.config?.filters?.length
          ? nodeData.config.filters.map(f => this.itsmFilterParamGroup(f))
          : [this.itsmFilterParamGroup()]
      ),
      timeouts: [nodeData?.config?.settings?.timeout ? nodeData?.config?.settings?.timeout : 3600],
      retries: [nodeData?.config?.settings?.retries ? nodeData?.config?.settings?.retries : 0],
      continue_on_failure: [nodeData?.config?.settings?.continue_on_failure ? nodeData?.config?.settings?.continue_on_failure : false],
    });
  }

  resetgetTicketForm(nodeData, nodeId) {
    if (nodeData?.formErrors) {
      return { ...nodeData.formErrors };
    }

    return {
      'name': '',
      'itsm_table': '',
      'filters': [],
      'outputs': []
    };
  }

  getTicketFormValidationMessage = {
    'name': {
      'required': 'Name is required.'
    },
    'itsm_table': {
      'required': 'Table or Module is required.'
    },
    'filters': {
      'condition_key': {
        'required': 'Condition Key is required.'
      },
      'operator': {
        'required': 'Operator is required.'
      },
      'condition_value': {
        'required': 'Condition Value is required.'
      }
    },
    'outputs': {
      'param_name': {
        'required': 'Param name is required in added output.',
      },
      'expression_type': {
        'required': 'Type  of Expression is required in added output.'
      },
      'expression': {
        'required': 'Expression is required in added output.'
      },
    }
  }

  createAimlEventTriggerForm(nodeData): Observable<FormGroup> {
    return of(this.fb.group({
      name: [nodeData?.name ?? '', Validators.required],
      aiml_type: [nodeData?.config?.aiml_type ?? 'Event', Validators.required],
      event_type: [nodeData?.config?.event_type ?? [], Validators.required],
      filter: [nodeData?.config?.filter ?? null, Validators.required],
      description: [{ value: nodeData?.config?.description ?? '', disabled: true }]
    }));
  }

  aimlEventTriggerFormErrors(nodeData) {
    if (nodeData?.formErrors) {
      return { ...nodeData.formErrors };
    }

    return {
      name: '',
      aiml_type: '',
      event_type: '',
      filter: ''
    };
  }


  aimlEventTriggerValidationMessage = {
    'name': {
      'required': 'Name is required.'
    },
    'aiml_type': {
      'required': 'Table or Module is required.'
    },
    'event_type': {
      'required': 'Event Type is required.'
    }
  }

  convertQueryBuilderData(data: CorrelationRuleFields[]): QueryBuilderConfig {
    let fieldMeta: QueryBuilderConfig = { fields: {} }
    data.forEach(field => {
      fieldMeta.fields[field.name] = {
        name: field.display_name,
        type: field.choices.length ? 'category' : 'string',
        operators: field.choices.length ? ['is', 'in'] : ['is', 'contains'],
        defaultOperator: 'is',
        options: field.choices.length ? field.choices.map(choice => {
          return { name: choice[1], value: choice[0] }
        }) : [],
        defaultValue: field.choices.length ? field.choices[0][0] : '',
        value: field.name
      }
    });
    // if (aimlType === 'Condition') {
    //   fieldMeta.fields['device_name'] = { name: '', type: '' }
    // }
    return fieldMeta;
  }

  basicRulesetToSQL(ruleset: RuleSet) {
    if (!ruleset) {
      return '';
    }
    return ruleset.rules.map((rule) => {
      if ((rule as RuleSet).rules) {
        return `(${this.basicRulesetToSQL(rule as RuleSet)})`;
      }
      rule = (rule as Rule);
      var column = rule.field,
        operator, value;

      switch (rule.operator) {
        case 'is null':
        case 'is not null':
          operator = rule.operator;
          value = '';
          break;
        case 'in':
        case 'not in':
          operator = rule.operator;
          if (Array.isArray(rule.value) && rule.value.length) {
            value = `(${rule.value.map(this.valueToSQL).filter(this.isDefined).join(', ')})`;
          }
          break;
        default:
          operator = rule.operator;
          value = this.valueToSQL(rule.value);
          break;
      }

      if (this.isDefined(column) && this.isDefined(operator)) {
        return `(${column} ${operator} ${value})`.trim();
      }
    }).filter(this.isDefined).join(` ${ruleset.condition} `);
  }

  // itsmFieldsGroup(field: FieldsType) {
  //   return this.fb.group({
  //     field_name: [field.field_name ?? field.param_name ?? ''],
  //     is_required: [field.is_required ?? field.is_required ?? false],
  //     default_value: [field.default_value || '', [Validators.required, NoWhitespaceValidator]],
  //   })
  // }

  itsmFieldsGroup(field: FieldsType) {
    const group = this.fb.group({
      param_name: [field.field_name ?? field.param_name ?? '', [Validators.required]],
      is_required: [field.is_required === true],
      default_value: [field.default_value ?? '']
    });

    const ctrl = group.get('default_value');

    if (field.is_required === true) {
      ctrl?.setValidators([Validators.required, NoWhitespaceValidator]);
    }

    ctrl?.updateValueAndValidity();
    return group;
  }



  itsmFilterParamGroup(cfg?: any) {
    return this.fb.group({
      condition_key: [cfg?.condition_key || '', [Validators.required, NoWhitespaceValidator]],
      operator: [cfg?.operator || '', [Validators.required]],
      condition_value: [cfg?.condition_value || '', [Validators.required, NoWhitespaceValidator]],
    });
  }
  createWaitForm(nodeData, nodeId): FormGroup {
    return this.fb.group({
      name: [nodeData.name ? nodeData.name : '', [Validators.required]],
      duration_value: [nodeData?.config?.duration_value ? nodeData?.config?.duration_value : '', [Validators.required]],
      duration_unit: [nodeData?.config?.duration_unit ? nodeData?.config?.duration_unit : '', [Validators.required]],
    });
  }

  resetWaitForm() {
    return {
      'name': '',
      'duration_value': '',
      'duration_unit': ''
    }
  }

  waitFormValidationMessage = {
    'name': {
      'required': 'Name is required.'
    },
    'duration_value': {
      'required': 'Duration is required.'
    },
    'duration_unit': {
      'required': 'Unit is required.'
    }
  }



  //////////////////////////////// ON CHAT MESSAGE /////////////////////////////////////

  buildOnChatForm(nodeData, nodeId): FormGroup {
    const inputsArray = (nodeData?.inputs || []).map(() =>
      this.buildParameterForm(true)
    );

    return this.fb.group({
      name: [nodeData?.name || ''],
      welcome_message: [nodeData?.config?.welcome_message || 'Hi, How can I assist you today?'],
      inputs: this.fb.array(inputsArray.length ? inputsArray : [])
    });
  }

  getOnChat(form: FormGroup): FormArray {
    return form.get('inputs') as FormArray;
  }

  onChatFormErrors(nodeData, nodeId) {
    const existingInputs = nodeData?.inputs || [];
    return {
      name: '',
      inputs: existingInputs.map(() => ({
        param_name: '',
        param_type: '',
        default_value: ''
      }))
    };
  }

  onChatValidationMessage = {
    inputs: {
      param_name: { required: 'Param name is required in added input.', 'invalidParamName': 'Must start with a letter or underscore; only letters, numbers, and underscores allowed.' },
      param_type: { required: 'Param type is required in added input.' },
      default_value: { required: 'Default value is required in added input.' }
    }
  };


}


export const cloudAttributes = [
  {
    cloudType: "AWS",
    attributes: ["name", "account_id", "cloud_type", "aws_user", "access_key", "secret_key", "account_name"]
  },
  {
    cloudType: "Azure",
    attributes: ["name", "account_id", "cloud_type", "user_name", "subscription_id", "secret_key", "client_id", "tenant_id", "client_secret"
    ]
  },
  {
    cloudType: "GCP",
    attributes: ["name", "account_id", "cloud_type", "email", "project_id", "service_account_info"]
  },
  {
    cloudType: "Oracle",
    attributes: ["name", "account_id", "cloud_type", "user_ocid", "tenancy_ocid", "region"]
  },
  {
    cloudType: "OpenStack",
    attributes: ["name", "account_id", "cloud_type", "hostname", "username", "password", "project", "user_domain", "project_domain"
    ]
  },
  {
    cloudType: "Proxmox",
    attributes: ["name", "account_id", "cloud_type", "host_address", "username", "password"]
  },
  {
    cloudType: "VMware",
    attributes: ["name", "account_id", "cloud_type", "hostname", "username", "password"]
  },
  {
    cloudType: "Hyperv",
    attributes: ["name", "account_id", "cloud_type", "username", "password", "domain", "host_address"]
  },
  {
    cloudType: "Nutanix",
    attributes: ["name", "account_id", "cloud_type", "credentials", "hostname", "prism_type", "protection_domain_name"
    ]
  },
  {
    cloudType: "vCloud Director",
    attributes: ["name", "account_id", "cloud_type", "username", "password"]
  },
  {
    cloudType: "ESXi",
    attributes: ["name", "account_id", "cloud_type", "username", "password", "hostname", "config", "port"]
  }
];

export const TOOLTIP_MESSAGES: Record<string, string> = {
  name: 'Unique name to identify this node in the workflow',
  paramName: 'Key name used to reference this parameter during execution',
  paramType: 'Defines the data type this parameter accepts',
  defaultValue: 'Value used automatically if nothing is provided',
  expressionType: "The method used to interpret the expression, like a pattern match (Regex) or a structured data query",
  expression: "The actual pattern or query that will be applied to find or extract information",
  welcomeMessage: 'Message displayed to greet the user',
  userPrompt: "Directs the AI on the task or question to address",
  systemPrompt: "Controls the AI's behavior, style, or role in responses",
  model: "Determines which AI engine processes the request",
  memory: "Maintains context from prior interactions for continuity",
  tool: "Extends AI capabilities using external functions or services",
  target: "Specify the target device to execute the task",
  credential: "Specify the credential to use to login to target device",
  inputParameter: "Parameters required for this task",
  prompt: "Text that directs what action or response is needed",
  retries: "Number of times to retry if it fails",
  timeouts: "Maximum execution time (in seconds) before the task is terminated",
  key: "Specifies the field whose value will be evaluated in this condition.",
  operator: "Defines how the selected field will be compared (e.g., equals, greater than)",
  value: "Reference value for the condition",
  emailTo: "Recipient email address for sending the message",
  subject: "Brief summary or heading of the email content",
  body: "Main message content that will be sent to recipients",
  chartLabels: "Names or categories displayed on the chart",
  chartValue: "Numeric values represented for each label",
  chartType: "Style of chart to visualize the data (e.g., bar, line)",
  chartXLabel: "Title or description for the X-axis",
  chartXValue: "Data points plotted along the X-axis",
  chartYLabel: "Title or description for the Y-axis",
  chartYValue: "Data points plotted along the Y-axis",
  tableOrModule: "Select the table or module from the dropdown",
  eventType: "Select the type of event from the dropdown"
};

export function paramNameValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  const regex = /^[A-Za-z_][A-Za-z0-9_]*$/;
  return regex.test(value) ? null : { invalidParamName: true };
}



