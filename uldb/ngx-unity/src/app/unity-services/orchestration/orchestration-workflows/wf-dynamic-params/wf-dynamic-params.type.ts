import { IMultiSelectSettings } from "src/app/shared/multiselect-dropdown/types";

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
    cloudType: "OCI",
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
    cloudType: "VMware vCenter",
    attributes: ["name", "account_id", "cloud_type", "hostname", "username", "password"]
  },
  {
    cloudType: "HyperV",
    attributes: ["name", "account_id", "cloud_type", "username", "password", "domain", "host_address"]
  },
  {
    cloudType: "Nutanix",
    attributes: ["name", "account_id", "cloud_type", "credentials", "hostname", "prism_type", "protection_domain_name"
    ]
  },
  {
    cloudType: "VMware vCloud Director",
    attributes: ["name", "account_id", "cloud_type", "endpoint", "username", "password"]
  },
  {
    cloudType: "ESXi",
    attributes: ["name", "account_id", "cloud_type", "username", "password", "hostname", "config", "port"]
  }
];



export interface ApiValidator {
  type: string;
  value?: any;
  message?: string;
}

export interface ApiVisibleWhen {
  field?: string;
  control_name?: string;
  operator?: 'eq' | 'neq';
  value?: any;
  not_value?: any;
}

export interface ApiField {
  key?: string;
  type?: string;
  label?: string;
  placeholder?: string;
  help_text?: string;
  max_length?: number;
  rows?: number;
  default?: any;
  disabled?: any;
  add_label?: string;
  min_items?: number;
  options?: Array<{ label: string; value: any }>;
  options_api?: ApiOptionsApi;
  form_api?: ApiOptionsApi;
  validators?: any;
  required?: boolean;
  visible_when?: any;
  width?: string;
  fields?: ApiField[];
  multiselect_properties?: IMultiSelectSettings;
  show_add_remove?: boolean;
  clear_on_hide?: boolean;
  condition_type?: 'STATIC' | 'DYNAMIC';
  min_conditions?: number;
}
export interface ApiTab {
  id: string;
  label: string;
  fields: ApiField[];
}

export interface ApiSchema {
  tabs: ApiTab[];
}

export interface DynamicValidator {
  type: string;
  value?: any;
  message?: string;
}

export interface DynamicVisibleWhen {
  control_name?: string;
  value?: any;
  not_value?: any;
  is_in?: boolean;
}

export interface DynamicField {
  control_name: string;
  type: string;
  label?: string;
  placeholder?: string;
  helpText?: string;
  maxlength?: number;
  rows?: number;
  default?: any;
  disabled?: any;
  add_button_label?: string;
  min_items?: number;
  options?: Array<{ label: string; value: any }>;
  options_api?: DynamicOptionsApi | null;
  form_api?: DynamicOptionsApi | null;
  form_data?: any;
  validators?: any;
  required?: boolean;
  visible_when?: any;
  width?: string;
  fields?: DynamicField[];
  multiselect_properties?: IMultiSelectSettings;
  show_add_remove: boolean;
  clear_on_hide?: boolean;
  _conditionTree?: {
    type: 'group';
    condition: 'AND' | 'OR';
    children: any[];
  };
  key?: string;
  condition_type?: 'STATIC' | 'DYNAMIC';
  min_conditions?: number;
}

export interface DynamicTab {
  id: string;
  label: string;
  fields: DynamicField[];
}

export interface DynamicSchema {
  tabs: DynamicTab[];
}

interface ApiOptionsApi {
  depends_on: string;
  endpoint?: string;
  endpoint_by_value?: Record<string, string>;
  method?: 'GET' | 'POST';
  query_param?: string;
  static_params?: Record<string, any>;
  label_key?: string;
  value_key?: string;
  data_path?: string;
}



interface DynamicOptionsApi {
  depends_on: string;
  endpoint?: string;
  endpoint_by_value?: Record<string, string>;
  method?: 'GET' | 'POST';
  query_param?: string;
  static_params?: Record<string, any>;
  label_key?: string;
  value_key?: string;
  data_path?: string;
}

export const manualData = {
  "tabs": [
    {
      "id": "properties",
      "label": "Properties",
      "fields": [
        {
          "key": "input_params",
          "type": "form-array",
          "label": "Input Parameters",
          "add_label": "Param",
          "min_items": 0,
          "fields": [
            {
              "key": "param_name",
              "type": "text",
              "label": "Param Name",
              "placeholder": "Enter Param Name",
              "help_text": "Existing field name in the input data.",
              "width": "half",
              "validators": [
                {
                  "type": "required"
                }
              ]
            },
            {
              "key": "param_type",
              "type": "select",
              "label": "Param Type",
              "placeholder": "",
              "help_text": "Choose the operation to apply to the data fields.",
              "width": "half",
              "options": [
                {
                  "label": "Select Param Type",
                  "value": ""
                },
                {
                  "label": "Text",
                  "value": "TEXT"
                },
                {
                  "label": "Password",
                  "value": "PASSWORD"
                },
                {
                  "label": "Number",
                  "value": "NUMBER"
                },
                {
                  "label": "Cloud Account",
                  "value": "CLOUD_ACCOUNT"
                },
                {
                  "label": "Target",
                  "value": "TARGET"
                },
                {
                  "label": "Credential",
                  "value": "CREDENTIAL"
                },
                { "label": "Date", "value": "DATE" },
                { "label": "Date & Time", "value": "DATETIME" },
              ],
              "validators": [
                {
                  "type": "required"
                }
              ]
            },
            {
              "key": "default_value",
              "type": "text",
              "label": "Default Value",
              "placeholder": "Enter Default Value",
              "help_text": "Existing field name in the input data.",
              "validators": [
              ],
              "visible_when": {
                "field": "param_type",
                "operator": "eq",
                "value": ["TEXT"]
              }
            },
            {
              "key": "default_value_date",
              "type": "date",
              "label": "Default Value",
              "placeholder": "Select Default Date",
              "help_text": "Existing field name in the input data.",
              "validators": [],
              "visible_when": {
                "field": "param_type",
                "operator": "eq",
                "value": ["DATE"]
              }
            },
            {
              "key": "default_value_datetime",
              "type": "datetime",
              "label": "Default Value",
              "placeholder": "Select Default Date & Time",
              "help_text": "Existing field name in the input data.",
              "validators": [],
              "visible_when": {
                "field": "param_type",
                "operator": "eq",
                "value": ["DATETIME"]
              }
            },
            {
              "key": "default_value",
              "type": "password",
              "label": "Default Value",
              "placeholder": "Enter Default Value",
              "help_text": "Existing field name in the input data.",
              "validators": [
              ],
              "visible_when": {
                "field": "param_type",
                "operator": "eq",
                "value": ["PASSWORD"]
              }
            },
            {
              "key": "default_value",
              "type": "number",
              "label": "Default Value",
              "placeholder": "Enter Default Value",
              "help_text": "Existing field name in the input data.",
              "validators": [
              ],
              "visible_when": {
                "field": "param_type",
                "operator": "eq",
                "value": ["NUMBER"]
              }
            },
            {
              "key": "default_value",
              "type": "select",
              "label": "Default Value",
              "placeholder": "",
              "help_text": "Existing field name in the input data.",
              "validators": [
              ],
              "visible_when": {
                "field": "param_type",
                "operator": "eq",
                "value": ["CLOUD_ACCOUNT"]
              },
              "options_api": {
                "depends_on": "param_type",
                "endpoint": "/customer/cloud_fast/?page_size=0",
                "method": "GET",
                "label_key": "name",
                "value_key": "uuid",
                "data_path": ''
              }
            },
            {
              "key": "default_value",
              "type": "target_search",
              "label": "Default Value",
              "placeholder": "Enter Default Value",
              "help_text": "Existing field name in the input data.",
              "validators": [
              ],
              "visible_when": {
                "field": "param_type",
                "operator": "eq",
                "value": ["TARGET"]
              },
              "options_api": {
                "depends_on": "param_type",
                "endpoint": "/customer/advanced_search_fast/",
                "method": "GET",
                "label_key": "",
                "value_key": "",
                "data_path": ''
              }
            },
            {
              "key": "default_value",
              "type": "select",
              "label": "Default Value",
              "placeholder": "",
              "help_text": "Existing field name in the input data.",
              "validators": [
              ],
              "visible_when": {
                "field": "param_type",
                "operator": "eq",
                "value": ["CREDENTIAL"]
              },
              "options_api": {
                "depends_on": "param_type",
                "endpoint": "/customer/unity_discovery/credential/?page_size=0",
                "method": "GET",
                "label_key": "name",
                "value_key": "uuid",
                "data_path": ''
              }
            }
          ]
        }
      ]
    }
  ]
}

export const scheduleData = {
  "tabs": [
    {
      "id": "properties",
      "label": "Properties",
      "fields": [
        {
          "key": "input-params",
          "type": "form-array",
          "label": "Input Parameters",
          "add_label": "Param",
          "min_items": 0,
          "fields": [
            {
              "key": "param_name",
              "type": "text",
              "label": "Param Name",
              "placeholder": "Enter Param Name",
              "help_text": "Existing field name in the input data.",
              "validators": [
                {
                  "type": "required"
                }
              ]
            },
            {
              "key": "param_type",
              "type": "select",
              "label": "Param Type",
              "placeholder": "",
              "help_text": "Choose the operation to apply to the data fields.",
              "options": [
                {
                  "label": "Select Param Type",
                  "value": ""
                },
                {
                  "label": "Text",
                  "value": "TEXT"
                },
                {
                  "label": "Password",
                  "value": "PASSWORD"
                },
                {
                  "label": "Number",
                  "value": "NUMBER"
                },
                {
                  "label": "Cloud Account",
                  "value": "CLOUD_ACCOUNT"
                },
                {
                  "label": "Target",
                  "value": "TARGET"
                },
                {
                  "label": "Credential",
                  "value": "CREDENTIAL"
                }
              ],
              "validators": [
                {
                  "type": "required"
                }
              ]
            },
            {
              "key": "default_value",
              "type": "text",
              "label": "Default Value",
              "placeholder": "Enter Default Value",
              "help_text": "Existing field name in the input data.",
              "validators": [
              ],
              "visible_when": {
                "field": "param_type",
                "operator": "eq",
                "value": ["TEXT"]
              }
            },
            {
              "key": "default_value",
              "type": "password",
              "label": "Default Value",
              "placeholder": "Enter Default Value",
              "help_text": "Existing field name in the input data.",
              "validators": [
              ],
              "visible_when": {
                "field": "param_type",
                "operator": "eq",
                "value": ["PASSWORD"]
              }
            },
            {
              "key": "default_value",
              "type": "number",
              "label": "Default Value",
              "placeholder": "Enter Default Value",
              "help_text": "Existing field name in the input data.",
              "validators": [
              ],
              "visible_when": {
                "field": "param_type",
                "operator": "eq",
                "value": ["NUMBER"]
              }
            },
            {
              "key": "default_value",
              "type": "select",
              "label": "Default Value",
              "placeholder": "",
              "help_text": "Existing field name in the input data.",
              "validators": [
              ],
              "visible_when": {
                "field": "param_type",
                "operator": "eq",
                "value": ["CLOUD_ACCOUNT"]
              },
              "options_api": {
                "depends_on": "param_type",
                "endpoint_by_value": {
                  "CLOUD_ACCOUNT": "/customer/cloud_fast/?page_size=0",
                },
                "method": "GET",
                "label_key": "name",
                "value_key": "uuid",
                "data_path": ''
              }
            },
            {
              "key": "default_value",
              "type": "target_search",
              "label": "Default Value",
              "placeholder": "Enter Default Value",
              "help_text": "Existing field name in the input data.",
              "validators": [
              ],
              "visible_when": {
                "field": "param_type",
                "operator": "eq",
                "value": ["TARGET"]
              }
            },
            {
              "key": "default_value",
              "type": "select",
              "label": "Default Value",
              "placeholder": "",
              "help_text": "Existing field name in the input data.",
              "validators": [
              ],
              "visible_when": {
                "field": "param_type",
                "operator": "eq",
                "value": ["CREDENTIAL"]
              },
              "options_api": {
                "depends_on": "param_type",
                "endpoint_by_value": {
                  "credential": "/customer/unity_discovery/credential/?page_size=0",
                },
                "method": "GET",
                "label_key": "name",
                "value_key": "uuid",
                "data_path": ''
              }
            }
          ]
        },
        {
          "key": "unity-schedule",
          "type": "schedule",
          "label": "",
          "placeholder": "",
          "help_text": "Existing field name in the input data.",
          "default": {
            "schedule_type": "none",
            "run_now": false
          },
          "validators": [
            {
              "type": "required"
            }
          ]
        }
      ]
    }
  ]
}

export const chatData = {
  "tabs": [
    {
      "id": "properties",
      "label": "Properties",
      "fields": [
        {
          "key": "welcome_message",
          "type": "text-area",
          "label": "Welcome Message",
          "placeholder": "Enter Param Name",
          "help_text": "Existing field name in the input data.",
          "validators": [
            {
              "type": "required"
            }
          ]
        },
        {
          "key": "input-params",
          "type": "form-array",
          "label": "Input Parameters",
          "add_label": "Param",
          "min_items": 0,
          "fields": [
            {
              "key": "param_name",
              "type": "text",
              "label": "Param Name",
              "placeholder": "Enter Param Name",
              "help_text": "Existing field name in the input data.",
              "validators": [
                {
                  "type": "required"
                }
              ]
            },
            {
              "key": "param_type",
              "type": "select",
              "label": "Param Type",
              "placeholder": "",
              "help_text": "Choose the operation to apply to the data fields.",
              "options": [
                {
                  "label": "Select Param Type",
                  "value": ""
                },
                {
                  "label": "Text",
                  "value": "TEXT"
                },
                {
                  "label": "Password",
                  "value": "PASSWORD"
                },
                {
                  "label": "Number",
                  "value": "NUMBER"
                },
                {
                  "label": "Cloud Account",
                  "value": "CLOUD_ACCOUNT"
                },
                {
                  "label": "Target",
                  "value": "TARGET"
                },
                {
                  "label": "Credential",
                  "value": "CREDENTIAL"
                }
              ],
              "validators": [
                {
                  "type": "required"
                }
              ]
            },
            {
              "key": "default_value",
              "type": "text",
              "label": "Default Value",
              "placeholder": "Enter Default Value",
              "help_text": "Existing field name in the input data.",
              "validators": [
              ],
              "visible_when": {
                "field": "param_type",
                "operator": "eq",
                "value": ["TEXT"]
              }
            },
            {
              "key": "default_value",
              "type": "password",
              "label": "Default Value",
              "placeholder": "Enter Default Value",
              "help_text": "Existing field name in the input data.",
              "validators": [
              ],
              "visible_when": {
                "field": "param_type",
                "operator": "eq",
                "value": ["PASSWORD"]
              }
            },
            {
              "key": "default_value",
              "type": "number",
              "label": "Default Value",
              "placeholder": "Enter Default Value",
              "help_text": "Existing field name in the input data.",
              "validators": [
              ],
              "visible_when": {
                "field": "param_type",
                "operator": "eq",
                "value": ["NUMBER"]
              }
            },
            {
              "key": "default_value",
              "type": "select",
              "label": "Default Value",
              "placeholder": "",
              "help_text": "Existing field name in the input data.",
              "validators": [
              ],
              "visible_when": {
                "field": "param_type",
                "operator": "eq",
                "value": ["CLOUD_ACCOUNT"]
              },
              "options_api": {
                "depends_on": "param_type",
                "endpoint_by_value": {
                  "CLOUD_ACCOUNT": "/customer/cloud_fast/?page_size=0",
                },
                "method": "GET",
                "label_key": "name",
                "value_key": "uuid",
                "data_path": ''
              }
            },
            {
              "key": "default_value",
              "type": "target_search",
              "label": "Default Value",
              "placeholder": "Enter Default Value",
              "help_text": "Existing field name in the input data.",
              "validators": [
              ],
              "visible_when": {
                "field": "param_type",
                "operator": "eq",
                "value": ["TARGET"]
              }
            },
            {
              "key": "default_value",
              "type": "select",
              "label": "Default Value",
              "placeholder": "",
              "help_text": "Existing field name in the input data.",
              "validators": [
              ],
              "visible_when": {
                "field": "param_type",
                "operator": "eq",
                "value": ["CREDENTIAL"]
              },
              "options_api": {
                "depends_on": "param_type",
                "endpoint_by_value": {
                  "credential": "/customer/unity_discovery/credential/?page_size=0",
                },
                "method": "GET",
                "label_key": "name",
                "value_key": "uuid",
                "data_path": ''
              }
            }
          ]
        }
      ]
    }
  ]
}

export const webhookData = {
  "tabs": [
    {
      "id": "properties",
      "label": "Properties",
      "fields": [
        {
          "key": "url",
          "type": "text",
          "label": "URL",
          "placeholder": "",
          "read_only": true,
          "help_text": "Existing field name in the input data.",
          "validators": [
            {
              "type": "required"
            }
          ]
        },
        {
          "key": "payload",
          "type": "text-area",
          "label": "Payload",
          "placeholder": "",
          "default": "{}",
          "help_text": "Existing field name in the input data.",
          "validators": [
            {
              "type": "required"
            }
          ]
        }
      ]
    }
  ]
}

export const itsmTriggerData = {
  "tabs": [
    {
      "id": "properties",
      "label": "Properties",
      "fields": [
        {
          "key": "itsm_table",
          "type": "select",
          "label": "ITSM Table",
          "placeholder": "",
          "help_text": "Choose the operation to apply to the data fields.",
          "options_api": {
            "depends_on": "",
            "endpoint_by_value": {
              "ITSM_TABLE": "/rest/unity_itsm/tables/?is_enabled=true",
            },
            "method": "GET",
            "label_key": "name",
            "value_key": "uuid",
            "data_path": "results"
          },
          "validators": [
            {
              "type": "required"
            }
          ]
        },
        {
          "key": "event_type",
          "type": "multiselect",
          "label": "Event Type",
          "placeholder": "",
          "help_text": "Choose the operation to apply to the data fields.",
          "options": [
            {
              label: 'Ticket Created',
              value: 'TICKET_CREATED'
            },
            {
              label: 'Ticket Updated',
              value: 'TICKET_UPDATED'
            },
            {
              label: 'Comment Added',
              value: 'COMMENT_ADDED'
            }
          ],
          "multiselect_properties": {
            "isSimpleArray": false,
            "lableToDisplay": 'label',
            "enableSearch": true,
            "checkedStyle": 'fontawesome',
            "buttonClasses": 'btn btn-default btn-block',
            "dynamicTitleMaxItems": 1,
            "displayAllSelectedText": true,
            "showCheckAll": true,
            "showUncheckAll": true,
            "selectAsObject": false,
            "keyToSelect": 'value',
          },
          "validators": [
            {
              "type": "required"
            }
          ]
        }
      ]
    }
  ]
}

export const aimlTriggerData = {
  "tabs": [
    {
      "id": "properties",
      "label": "Properties",
      "fields": [
        {
          "key": "type",
          "type": "select",
          "label": "Type",
          "placeholder": "",
          "help_text": "Choose the operation to apply to the data fields.",
          "options": [
            {
              "label": "Select Type",
              "value": ""
            },
            {
              "label": "Event",
              "value": "EVENT"
            },
            {
              "label": "Alert",
              "value": "ALERT"
            },
            {
              "label": "Condition",
              "value": "CONDITION"
            }
          ],
          "validators": [
            {
              "type": "required"
            }
          ]
        },
        {
          "key": "event_type",
          "type": "multiselect",
          "label": "Event Type",
          "placeholder": "",
          "help_text": "Choose the operation to apply to the data fields.",
          "options": [
            {
              label: 'Open',
              value: 'OPEN'
            },
            {
              label: 'Resolved',
              value: 'RESOLVED'
            }
          ],
          "multiselect_properties": {
            isSimpleArray: false,
            lableToDisplay: 'label',
            enableSearch: true,
            checkedStyle: 'fontawesome',
            buttonClasses: 'btn btn-default btn-block',
            dynamicTitleMaxItems: 1,
            displayAllSelectedText: true,
            showCheckAll: true,
            showUncheckAll: true,
            selectAsObject: false,
            keyToSelect: 'value'
          },
          "validators": [
            {
              "type": "required"
            }
          ]
        },
        {
          "key": "filters",
          "type": "querybuilder",
          "label": "Filters",
          "placeholder": "",
          "help_text": "Choose the operation to apply to the data fields.",
        }
      ]
    }
  ]
}

export const aiAgentMockData = {
  tabs: [
    {
      id: "properties",
      label: "Properties",

      fields: [
        {
          key: "name",
          type: "text",
          label: "Agent Name",
          placeholder: "Enter Agent Name",

          validators: [
            {
              type: "required"
            }
          ]
        },
        {
          key: "user_prompt",
          type: "text-area",
          rows: 3,
          label: "User Prompt",
          placeholder: "Enter User Prompt",

          validators: [
            {
              type: "required"
            }
          ]
        },
        {
          key: "system_prompt",
          type: "text-area",
          rows: 3,
          label: "System Prompt",
          placeholder: "Enter System Prompt"
        },
      ]
    },
    {
      id: "human-approval",
      label: "Human Approval",
      fields: [
        {
          key: "human_approval",
          type: "checkbox",
          label: "Enable Human Approval",
          default: true
        },
        {
          key: "approval_mode",
          type: "select",
          label: "Approval Mode",

          visible_when: {
            field: "human_approval",
            operator: "eq",
            value: [true]
          },

          options: [
            {
              label: "Approve / Reject",
              value: "APPROVE_REJECT"
            },
            {
              label: "Auto Approve",
              value: "AUTO_APPROVE"
            }
          ]
        },

        {
          key: "channels",
          type: "multiselect",
          label: "Channels",

          visible_when: {
            field: "human_approval",
            operator: "eq",
            value: [true]
          },

          options: [
            {
              label: "Email",
              value: "EMAIL"
            },
            {
              label: "Slack",
              value: "SLACK"
            },
            {
              label: "Teams",
              value: "TEAMS"
            }
          ],

          multiselect_properties: {
            isSimpleArray: false,
            lableToDisplay: "label",
            enableSearch: true,
            checkedStyle: "fontawesome",
            buttonClasses: "btn btn-default btn-block",
            dynamicTitleMaxItems: 1,
            displayAllSelectedText: true,
            showCheckAll: true,
            showUncheckAll: true,
            selectAsObject: false,
            keyToSelect: "value"
          }
        },

        {
          key: "approver_groups",
          type: "multiselect",
          label: "Approver Groups",

          visible_when: {
            field: "human_approval",
            operator: "eq",
            value: [true]
          },

          options_api: {
            depends_on: "",
            endpoint: "/customer/rbac/user_groups/?status=true&page_size=0",
            method: "GET",
            label_key: "name",
            value_key: "uuid",
            data_path: "results"
          },

          multiselect_properties: {
            isSimpleArray: false,
            lableToDisplay: "label",
            enableSearch: true,
            checkedStyle: "fontawesome",
            buttonClasses: "btn btn-default btn-block",
            dynamicTitleMaxItems: 1,
            displayAllSelectedText: true,
            showCheckAll: true,
            showUncheckAll: true,
            selectAsObject: false,
            keyToSelect: "value"
          }
        },

        {
          key: "approver_users",
          type: "multiselect",
          label: "Approver Users",

          visible_when: {
            field: "human_approval",
            operator: "eq",
            value: [true]
          },

          options_api: {
            depends_on: "",

            endpoint: "/customer/organizationusers/get_active_users/",

            method: "GET",
            label_key: "email",
            value_key: "email",
            data_path: ""
          },

          multiselect_properties: {
            isSimpleArray: false,
            lableToDisplay: "label",
            enableSearch: true,
            checkedStyle: "fontawesome",
            buttonClasses: "btn btn-default btn-block",
            dynamicTitleMaxItems: 2,
            displayAllSelectedText: true,
            showCheckAll: true,
            showUncheckAll: true,
            selectAsObject: false,
            keyToSelect: "value"
          }
        },

        {
          key: "approval_timeout",
          type: "number",
          label: "Timeout",
          default: 3600,

          visible_when: {
            field: "human_approval",
            operator: "eq",
            value: [true]
          }
        }
      ]
    },
    {
      id: "settings",
      label: "Settings",

      fields: [
        {
          key: "retries",
          type: "number",
          label: "Retries",
          default: 0
        },

        {
          key: "timeout",
          type: "number",
          label: "Timeout",
          default: 3600
        },

        {
          key: "continue_on_failure",
          type: "checkbox",
          label: "Continue On Failure",
          default: false
        }
      ]
    }
  ]
};

export const llmNodeData = {
  tabs: [
    {
      id: "properties",
      label: "Properties",

      fields: [
        {
          key: "name",
          type: "text",
          label: "LLM Name",
          placeholder: "Enter LLM Name",

          validators: [
            {
              type: "required"
            }
          ]
        },
        {
          key: "prompt",
          type: "text-area",
          label: "Prompt",
          rows: 3,
          placeholder: "Enter Prompt",
          validators: [
            {
              type: "required"
            }
          ]
        }
      ]
    },

    {
      id: "settings",
      label: "Settings",

      fields: [
        {
          key: "retries",
          type: "number",
          label: "Retries",
          default: 0
        },

        {
          key: "timeout",
          type: "number",
          label: "Timeout (Seconds)",
          default: 3600
        },

        {
          key: "continue_on_failure",
          type: "checkbox",
          label: "Continue On Failure",
          default: true
        }
      ]
    }
  ]
};

export const ifElseNodeData = {
  tabs: [
    {
      id: "properties",
      label: "Properties",

      fields: [
        {
          key: "name",
          type: "text",
          label: "Node Name",
          placeholder: "Enter Node Name",

          validators: [
            {
              type: "required"
            }
          ]
        },

        {
          key: "condition_key",
          type: "text",
          label: "Condition Key",
          placeholder: "Enter Condition Key",

          help_text:
            "Variable or expression that should be evaluated.",

          validators: [
            {
              type: "required"
            }
          ]
        },

        {
          key: "operator",
          type: "select",
          label: "Operator",
          placeholder: "Select Operator",

          options: [
            {
              label: "Select Operator",
              value: ""
            },
            {
              label: "Equals",
              value: "=="
            },
            {
              label: "Not Equals",
              value: "!="
            },
            {
              label: "Greater Than",
              value: ">"
            },
            {
              label: "Less Than",
              value: "<"
            },
            {
              label: "Greater Than Equal",
              value: ">="
            },
            {
              label: "Less Than Equal",
              value: "<="
            },
            {
              label: "Contains",
              value: "contains"
            },
            {
              label: "Starts With",
              value: "starts_with"
            },
            {
              label: "Ends With",
              value: "ends_with"
            },
            {
              label: "Is Empty",
              value: "is_empty"
            },
            {
              label: "Is Not Empty",
              value: "is_not_empty"
            }
          ],

          validators: [
            {
              type: "required"
            }
          ]
        },

        {
          key: "condition_value",
          type: "text",
          label: "Condition Value",
          placeholder: "Enter Condition Value",

          visible_when: {
            field: "operator",
            operator: "neq",
            value: ["is_empty", "is_not_empty"]
          },

          validators: [
            {
              type: "required"
            }
          ]
        },
      ]
    }
  ]
};

export const switchCaseNodeData = {
  tabs: [
    {
      id: "properties",
      label: "Properties",

      fields: [
        {
          key: "name",
          type: "text",
          label: "Node Name",
          placeholder: "Enter Node Name",

          validators: [
            {
              type: "required"
            }
          ]
        },

        {
          key: "conditions",
          type: "form-array",
          label: "Switch Cases",
          add_label: "Case",
          min_items: 1,

          fields: [


            {
              key: "condition_key",
              type: "text",
              label: "Condition Key",
              placeholder: "Enter Condition Key",

              validators: [
                {
                  type: "required"
                }
              ]
            },

            {
              key: "operator",
              type: "select",
              label: "Operator",
              placeholder: "Select Operator",

              options: [
                {
                  label: "Select Operator",
                  value: ""
                },
                {
                  label: "Equals",
                  value: "=="
                },
                {
                  label: "Not Equals",
                  value: "!="
                },
                {
                  label: "Greater Than",
                  value: ">"
                },
                {
                  label: "Less Than",
                  value: "<"
                },
                {
                  label: "Greater Than Equal",
                  value: ">="
                },
                {
                  label: "Less Than Equal",
                  value: "<="
                },
                {
                  label: "Contains",
                  value: "contains"
                },
                {
                  label: "Starts With",
                  value: "starts_with"
                },
                {
                  label: "Ends With",
                  value: "ends_with"
                },
                {
                  label: "Regex Match",
                  value: "regex"
                },
                {
                  label: "Is Empty",
                  value: "is_empty"
                },
                {
                  label: "Is Not Empty",
                  value: "is_not_empty"
                }
              ],

              validators: [
                {
                  type: "required"
                }
              ]
            },

            {
              key: "condition_value",
              type: "text",
              label: "Condition Value",
              placeholder: "Enter Condition Value",

              visible_when: {
                field: "operator",
                operator: "neq",
                value: ["is_empty", "is_not_empty"]
              },

              validators: [
                {
                  type: "required"
                }
              ]
            },
          ]
        }
      ]
    }
  ]
};

export const transformNodeData = {
  tabs: [
    {
      id: "properties",
      label: "Properties",

      fields: [
        {
          key: "name",
          type: "text",
          label: "Node Name",
          placeholder: "Enter Node Name",

          validators: [
            {
              type: "required"
            }
          ]
        },

        {
          key: "input",
          type: "text",
          label: "Input",
          placeholder: "Enter Input Variable",

          validators: [
            {
              type: "required"
            }
          ]
        },

        {
          key: "operation",
          type: "select",
          label: "Operation",
          placeholder: "Select Operation",

          options: [
            {
              label: "Rename",
              value: "RENAME_FIELDS"
            },
            {
              label: "Drop",
              value: "DROP_FIELDS"
            },
            {
              label: "Add",
              value: "ADD_FIELDS"
            },
            {
              label: "Filter",
              value: "FILTER"
            },
            {
              label: "Slice",
              value: "SLICE"
            },
            {
              label: "Sort",
              value: "SORT"
            }
          ],

          validators: [
            {
              type: "required"
            }
          ]
        },

        /**
         * =========================================
         * RENAME FIELDS
         * =========================================
         */

        {
          key: "rename_fields",
          type: "form-array",
          label: "Rename Fields",
          add_label: "Rename Field",
          min_items: 1,

          visible_when: {
            field: "operation",
            operator: "eq",
            value: ["RENAME_FIELDS"]
          },

          fields: [
            {
              key: "source",
              type: "text",
              label: "Source Field",
              placeholder: "Enter Source Field",

              validators: [
                {
                  type: "required"
                }
              ]
            },

            {
              key: "target",
              type: "text",
              label: "Target Field",
              placeholder: "Enter Target Field",

              validators: [
                {
                  type: "required"
                }
              ]
            }
          ]
        },

        /**
         * =========================================
         * DROP FIELDS
         * =========================================
         */

        {
          key: "drop_fields",
          type: "form-array",
          label: "Drop Fields",
          add_label: "Drop Field",
          min_items: 1,

          visible_when: {
            field: "operation",
            operator: "eq",
            value: ["DROP_FIELDS"]
          },

          fields: [
            {
              key: "field",
              type: "text",
              label: "Field Name",
              placeholder: "Enter Field Name",

              validators: [
                {
                  type: "required"
                }
              ]
            }
          ]
        },

        /**
         * =========================================
         * ADD FIELDS
         * =========================================
         */

        {
          key: "add_fields",
          type: "form-array",
          label: "Add Fields",
          add_label: "Add Field",
          min_items: 1,

          visible_when: {
            field: "operation",
            operator: "eq",
            value: ["ADD_FIELDS"]
          },

          fields: [
            {
              key: "field",
              type: "text",
              label: "Field Name",
              placeholder: "Enter Field Name",

              validators: [
                {
                  type: "required"
                }
              ]
            },

            {
              key: "value_type",
              type: "select",
              label: "Value Type",

              options: [
                {
                  label: "Text",
                  value: "TEXT"
                },
                {
                  label: "Number",
                  value: "NUMBER"
                },
                {
                  label: "Boolean",
                  value: "BOOLEAN"
                }
              ]
            },

            {
              key: "value",
              type: "text",
              label: "Value",
              placeholder: "Enter Value",

              visible_when: {
                field: "value_type",
                operator: "eq",
                value: ["TEXT"]
              }
            },

            {
              key: "value",
              type: "number",
              label: "Value",

              visible_when: {
                field: "value_type",
                operator: "eq",
                value: ["NUMBER"]
              }
            },

            {
              key: "value",
              type: "checkbox",
              label: "Value",

              visible_when: {
                field: "value_type",
                operator: "eq",
                value: ["BOOLEAN"]
              }
            }
          ]
        },

        /**
         * =========================================
         * FILTER
         * =========================================
         */

        {
          key: "filter_fields",
          type: "form-array",
          label: "Filter Conditions",
          add_label: "Condition",
          min_items: 1,

          visible_when: {
            field: "operation",
            operator: "eq",
            value: ["FILTER"]
          },

          fields: [
            {
              key: "field",
              type: "text",
              label: "Field",
              placeholder: "Enter Field Name",

              validators: [
                {
                  type: "required"
                }
              ]
            },

            {
              key: "operator",
              type: "select",
              label: "Operator",

              options: [
                {
                  label: "Equals",
                  value: "=="
                },
                {
                  label: "Not Equals",
                  value: "!="
                },
                {
                  label: "Greater Than",
                  value: ">"
                },
                {
                  label: "Less Than",
                  value: "<"
                },
                {
                  label: "Contains",
                  value: "contains"
                }
              ],

              validators: [
                {
                  type: "required"
                }
              ]
            },

            {
              key: "value_type",
              type: "select",
              label: "Value Type",

              options: [
                {
                  label: "Text",
                  value: "TEXT"
                },
                {
                  label: "Number",
                  value: "NUMBER"
                },
                {
                  label: "Boolean",
                  value: "BOOLEAN"
                }
              ]
            },

            {
              key: "value",
              type: "text",
              label: "Value",

              visible_when: {
                field: "value_type",
                operator: "eq",
                value: ["TEXT"]
              }
            },

            {
              key: "value",
              type: "number",
              label: "Value",

              visible_when: {
                field: "value_type",
                operator: "eq",
                value: ["NUMBER"]
              }
            },

            {
              key: "value",
              type: "checkbox",
              label: "Value",

              visible_when: {
                field: "value_type",
                operator: "eq",
                value: ["BOOLEAN"]
              }
            }
          ]
        },

        /**
         * =========================================
         * SLICE
         * =========================================
         */

        {
          key: "slice_config",
          type: "group",
          label: "Slice Configuration",

          visible_when: {
            field: "operation",
            operator: "eq",
            value: ["SLICE"]
          },

          fields: [
            {
              key: "start",
              type: "number",
              label: "Start Index",
              default: 0
            },

            {
              key: "limit",
              type: "number",
              label: "Limit",

              validators: [
                {
                  type: "required"
                }
              ]
            }
          ]
        },

        /**
         * =========================================
         * SORT
         * =========================================
         */

        {
          key: "sort_fields",
          type: "form-array",
          label: "Sort Fields",
          add_label: "Sort Field",
          min_items: 1,

          visible_when: {
            field: "operation",
            operator: "eq",
            value: ["SORT"]
          },

          fields: [
            {
              key: "field",
              type: "text",
              label: "Field Name",
              placeholder: "Enter Field Name",

              validators: [
                {
                  type: "required"
                }
              ]
            },

            {
              key: "order",
              type: "select",
              label: "Order",

              options: [
                {
                  label: "Ascending",
                  value: "ASC"
                },
                {
                  label: "Descending",
                  value: "DESC"
                }
              ],

              validators: [
                {
                  type: "required"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

export const emailNodeData = {
  tabs: [
    {
      id: "properties",
      label: "Properties",

      fields: [
        {
          key: "name",
          type: "text",
          label: "Node Name",
          placeholder: "Enter Node Name",

          validators: [
            {
              type: "required"
            }
          ]
        },

        {
          key: "to",
          type: "text",
          label: "To",
          placeholder: "Enter Recipient Email(s)",

          help_text:
            "Multiple emails can be separated using commas.",

          validators: [
            {
              type: "required"
            }
          ]
        },

        {
          key: "subject",
          type: "text",
          label: "Subject",
          placeholder: "Enter Email Subject",

          validators: [
            {
              type: "required"
            }
          ]
        },

        {
          key: "body",
          type: "text-area",
          label: "Body",
          placeholder: "Enter Email Body",

          validators: [
            {
              type: "required"
            }
          ]
        },
      ]
    },

    {
      id: "settings",
      label: "Settings",

      fields: [
        {
          key: "retries",
          type: "number",
          label: "Retries",
          default: 0
        },

        {
          key: "timeout",
          type: "number",
          label: "Timeout (Seconds)",
          default: 3600,

          validators: [
            {
              type: "required"
            }
          ]
        },

        {
          key: "continue_on_failure",
          type: "checkbox",
          label: "Continue On Failure",
          default: false
        },

        {
          key: "on_timeout",
          type: "select",
          label: "On Timeout",

          options: [
            {
              label: "Fail Workflow",
              value: "FAIL"
            },
            {
              label: "Continue Workflow",
              value: "CONTINUE"
            },
            {
              label: "Retry",
              value: "RETRY"
            }
          ],

          validators: [
            {
              type: "required"
            }
          ]
        }
      ]
    }
  ]
};

export const chartNodeData = {
  tabs: [
    {
      id: "properties",
      label: "Properties",

      fields: [
        {
          key: "name",
          type: "text",
          label: "Chart Name",
          placeholder: "Enter Chart Name",

          validators: [
            {
              type: "required"
            }
          ]
        },

        {
          key: "chart_type",
          type: "select",
          label: "Chart Type",
          placeholder: "Select Chart Type",

          options: [
            {
              label: "Bar",
              value: "BAR"
            },
            {
              label: "Line",
              value: "LINE"
            },
            {
              label: "Pie",
              value: "PIE"
            },
            {
              label: "Area",
              value: "AREA"
            },
          ],

          validators: [
            {
              type: "required"
            }
          ]
        },

        {
          key: "x_label",
          type: "text",
          label: "X Axis Label",
          placeholder: "Enter X Axis Label",

          visible_when: {
            field: "chart_type",
            operator: "neq",
            value: ["PIE", "DONUT"]
          },

          validators: [
            {
              type: "required"
            }
          ]
        },

        {
          key: "y_label",
          type: "text",
          label: "Y Axis Label",
          placeholder: "Enter Y Axis Label",

          visible_when: {
            field: "chart_type",
            operator: "neq",
            value: ["PIE", "DONUT"]
          },

          validators: [
            {
              type: "required"
            }
          ]
        },

        {
          key: "x_values",
          type: "text-area",
          label: "X Values",
          placeholder: "Enter X Axis Values",

          help_text:
            "Comma separated values or variable reference.",

          validators: [
            {
              type: "required"
            }
          ]
        },

        {
          key: "y_values",
          type: "text-area",
          label: "Y Values",
          placeholder: "Enter Y Axis Values",

          help_text:
            "Comma separated values or variable reference.",

          validators: [
            {
              type: "required"
            }
          ]
        },

        {
          key: "show_grid",
          type: "checkbox",
          label: "Show Grid",
          default: true,

          visible_when: {
            field: "chart_type",
            operator: "neq",
            value: ["PIE", "DONUT"]
          }
        },

        {
          key: "enable_animation",
          type: "checkbox",
          label: "Enable Animation",
          default: true
        }
      ]
    },
    {
      id: "settings",
      label: "Settings",

      fields: [
        {
          key: "timeout",
          type: "number",
          label: "Timeout (Seconds)",
          default: 3600,

          validators: [
            {
              type: "required"
            }
          ]
        },

        {
          key: "continue_on_failure",
          type: "checkbox",
          label: "Continue On Failure",
          default: false
        },

        {
          key: "on_timeout",
          type: "select",
          label: "On Timeout",

          options: [
            {
              label: "Fail Workflow",
              value: "FAIL"
            },
            {
              label: "Continue Workflow",
              value: "CONTINUE"
            },
            {
              label: "Retry",
              value: "RETRY"
            }
          ],

          validators: [
            {
              type: "required"
            }
          ]
        }
      ]
    }
  ]
};

export const taskNodeData = {
  tabs: [
    {
      id: "properties",
      label: "Properties",
      fields: [
        {
          key: "target",
          type: "text",
          label: "Target",
          placeholder: "Enter Target",
          validators: [
            {
              type: "required"
            }
          ]
        },
        {
          key: "credential",
          type: "text",
          label: "Credential",
          placeholder: "Enter Credential",
          validators: [
            {
              type: "required"
            }
          ]
        },
        {
          "key": "default_value",
          "type": "text",
          "label": "abc_param_name_from_details_api",
          "placeholder": "Enter Value",
          "help_text": "Existing field name in the input data.",
          "validators": [
            {
              "type": "required"
            }
          ]
        }
      ]
    },
    {
      id: "settings",
      label: "Settings",
      fields: [
        {
          key: "retries",
          type: "number",
          label: "Retries",
          default: 0
        },
        {
          key: "timeout",
          type: "number",
          label: "Timeout",
          default: 3600
        },
        {
          key: "continue_on_failure",
          type: "checkbox",
          label: "Continue On Failure",
          default: false
        }
      ]
    },
  ]
};


export const formGroup = {
    "tabs": [
        {
            "id": "properties",
            "label": "Properties",
            "fields": [
                {
                    "label": "ITSM Table",
                    "options_api": {
                        "endpoint": "/rest/unity_itsm/tables/?page_size=0&is_enabled=True",
                        "label_key": "name",
                        "depends_on": "",
                        "data_path": "",
                        "value_key": "uuid",
                        "method": "GET"
                    },
                    "key": "itsm_table",
                    "validators": [
                        {
                            "type": "required"
                        }
                    ],
                    "help_text": "Select the table for creating the ticket.",
                    "type": "select"
                },
                {
                    "key": "fields",
                    "type": "form-group",
                    "label": "Fields",
                    "visible_when": {
                        "operator": "eq",
                        "field": "itsm_table",
                        "value": "4b003979-44a3-4390-8020-323e574530b1"
                    },
                    "fields": [
                        {
                            "label": "Field",
                            "type": "select",
                            "options": [
                                {
                                    "value": "text",
                                    "label": "Text"
                                },
                                {
                                    "value": "reference_table",
                                    "label": "reference table"
                                },
                                {
                                    "value": "dropdown",
                                    "label": "dropdown"
                                }
                            ],
                            "key": "key",
                            "validators": [
                                {
                                    "type": "required"
                                }
                            ]
                        },
                        {
                            "default": "",
                            "type": "text",
                            "label": "Value",
                            "visible_when": {
                                "operator": "eq",
                                "field": "key",
                                "value": "text"
                            },
                            "key": "value",
                            "validators": [
                                {
                                    "type": "required"
                                }
                            ],
                            "placeholder": "Enter value"
                        },
                        {
                            "type": "select",
                            "label": "Value",
                            "options_api": {
                                "endpoint": "/rest/unity_itsm/tables/8f6ff011-1c4b-4f75-ba69-c3b3ebcb04f3/records/?page_size=0",
                                "label_key": "display_value",
                                "depends_on": "key",
                                "data_path": "results",
                                "value_key": "uuid",
                                "method": "GET"
                            },
                            "visible_when": {
                                "operator": "eq",
                                "field": "key",
                                "value": "reference_table"
                            },
                            "key": "value",
                            "validators": [
                                {
                                    "type": "required"
                                }
                            ],
                            "placeholder": "Select value"
                        },
                        {
                            "type": "select",
                            "label": "Value",
                            "visible_when": {
                                "operator": "eq",
                                "field": "key",
                                "value": "dropdown"
                            },
                            "key": "value",
                            "validators": [
                                {
                                    "type": "required"
                                }
                            ],
                            "placeholder": "Select value",
                            "options": [
                                {
                                    "value": "OPEN",
                                    "label": "OPEN"
                                },
                                {
                                    "value": "RESOLVED",
                                    "label": "RESOLVED"
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            "fields": [
                {
                    "default": 0,
                    "type": "number",
                    "key": "retries",
                    "label": "Retries"
                },
                {
                    "default": 3600,
                    "type": "number",
                    "key": "timeout",
                    "label": "Timeout"
                },
                {
                    "default": false,
                    "type": "checkbox",
                    "key": "continue_on_failure",
                    "label": "Continue On Failure"
                }
            ],
            "id": "settings",
            "label": "Settings"
        }
    ]
}
