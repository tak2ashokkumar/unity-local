// Types for the Application Onboarding (APM) feature - flat shape matching the
// /apm/apm_onboarding/ contract.

// A single onboarded-application record (list row / detail / create-update payload).
export interface OnboardedApplication {
  id?: number;
  application_name: string;
  service_name: string;
  runtime: string[];
  host?: string;
  status?: string;
  deployed_date?: string;
  // device_id is the selected device's ctype_id (numeric); host is its IP.
  device_id: number;
  project_dir: string;
  log_file_path: string;
  java_agent_dir?: string;
  java_tool_option?: string;
  dotnet_runtime_dir?: string;
  content_type?: number;
  collector: number;
  credentials?: number;
  tags: number[];
  created_at?: string;
  updated_at?: string;

  // Only sent when the "My Credential" option is used (mapping pending confirmation).
  username?: string;
  password?: string;
}

// A selected Host Config target (device) from customer/advanced_search_fast/.
// The search exposes the device by uuid (there is no numeric id) + ip_address;
// ctype_id is the device's content-type id.
export interface TargetOption {
  uuid: string;
  name: string;
  ip_address: string;
  device_type?: string;
  ctype_id?: number;
}

// Runtime / language option (static list - drives the Configuration sections).
export interface RuntimeOption {
  label: string;
  value: string;
}

// Tag option from customer/tags/ (id + tag_name).
export interface ApmTag {
  id: number;
  tag_name: string;
  uuid: string;
  customer: number;
}
