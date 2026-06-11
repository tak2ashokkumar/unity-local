export const CREATE_REPORT_AN_ISSUE = () => `/customer/dynamics_crm/feedback/`;

export const ACTIVITY_LOG = (deviceType: string, deviceId: string) => `/customer/${deviceType}/${deviceId}/update_activity_log/`;

export const CHECK_TASK_STATUS_BY_TASK_ID = (taskId: string) => `task/${taskId}/`;

export const LOGOUT = () => `logout/`;

export const STOP_IMPERSONATING = () => `hijack/release-hijack/`;

export const GET_ALL_DEVICES_TAGS = () => `customer/tags/?page_size=0`;

export const GET_MONITORING_CONFIG = () => `/customer/monitoring_config/`;

export const CREATE_TENANT = () => `/customer/mtp/tenant/create/`;

export const TENANT_LIST = () => `/customer/mtp/tenant/`;

export const GET_ALL_TEMPLATES = () => '/customer/mtp/template-manage/';

export const GET_MTP_USER_PROFILE_DATA = () => `customer/mtp/profile/`;

export const POST_MTP_USER_PROFILE_DATA = (uuid: string) => `customer/mtp/profile/${uuid}/`;

export const GET_USER_PROFILE_ACTIVITY_LOG = () => `/customer/mtp/user-log/`;

export const USER_PROFILE_RESET_PASSWORD = () => `customer/mtp/profile/reset_password/`

export const GET_TEMPLATE_METRICS = (templateId: string) => `/customer/mtp/metrics/?template_id=${templateId}`;

export const GET_METRICS_TRIGGERS = (templateId: string) => `/customer/mtp/item-triggers/?item_id=${templateId}`;

export const GET_TEMPLATE_GRAPHS = (templateId: string) => `/customer/mtp/graphs/?template_id=${templateId}`;

export const GET_ALL_METRICS_TRIGGERS = (templateId: string) => `/customer/mtp/triggers/?template_id=${templateId}`

export const GET_ROLES = () => `/customer/mtp/mtp_roles/`;

export const CREATE_USER = () => `/customer/mtp/mtpusers/`;

export const UPDATE_USER = (userId: string) => `/customer/mtp/mtpusers/${userId}/`;

export const GET_USERS = () => `/customer/mtp/mtpusers/`;

export const GET_USER_DATA = (userId: string) => `/customer/mtp/mtpusers/${userId}/`;

export const TOGGLE_USER = (userId: string) => `/customer/mtp/mtpusers/${userId}/`;

export const USER_PASSWORD_RESET = () => `/customer/uldbusers/send_password_reset_link/`;

export const DELETE_USER = (userId: string) => `/customer/mtp/mtpusers/${userId}/`;

export const GET_GROUPS = () => `/customer/mtp/mtp_group_roles/`;

export const CREATE_GROUP = () => `/customer/mtp/mtp_group_roles/`;

export const GET_GROUP_DATA = (groupId: string) => `/customer/mtp/mtp_group_roles/${groupId}/`;

export const UPDATE_GROUP = (groupId: string) => `/customer/mtp/mtp_group_roles/${groupId}/`;

export const TOGGLE_GROUP = (groupId: string) => `/customer/mtp/mtp_group_roles/${groupId}/`;

export const DELETE_GROUP = (groupId: string) => `/customer/mtp/mtp_group_roles/${groupId}/`;

export const GET_TENANTS = () => `/customer/mtp/tenant/`;

export const TENANT_USER_LIST = (uuid: string) => `/customer/mtp/user_list/${uuid}/get_user_list/`;

export const GET_TENANT_GROUP = () => `/customer/mtp/mtpgroup/`;

export const GET_UNITY_MODULES = () => `/customer/mtp/tenant/create/get_unity_modules/`;

export const GET_ACTIVITY_LOG = (uuid: string) => `/customer/mtp/user_audit_log/?uuid=${uuid}`;

export const GET_TENANT_INFO = (tenantUuid: string) => `/customer/mtp/tenant/${tenantUuid}/`

export const GET_TENANT_SUBSCRIPTION = (tenantUuid: string) => `/customer/mtp/subscriptions/${tenantUuid}/get_all_org_subscription/`

export const LOCATION_STATUS = (uuid: string) => `customer/mtp/tenantlocation/${uuid}/get_tenants_dc_location/`;

export const GET_ACTIVITY_LOG_DASHBOARD = () => `/customer/mtp/activity-log/`;

export const ASSIGN_ROLES = (roleId: number) => `/customer/mtp/mtp_roles/${roleId}/`;

export const EDIT_TENANT_DETAILS = (tenantUuid: string) => `/customer/mtp/tenant/${tenantUuid}/`;

export const GET_TENANT_BY_GROUP_UUID = (groupUuid: string) => `/customer/mtp/mtpgroup/${groupUuid}/get_tenant_list/`

export const EDIT_USER_DETAILS = (uuid: string) => `/customer/mtp/user_list/${uuid}/update_user/`;

export const DELETE_USER_BY_UUID = (uuid: string) => `/customer/mtp/user_list/${uuid}/delete_user/`;

export const TOGGLE_USER_TENANTS = (userUuid: string, tenantUuid: string, isActive: string) => `/customer/mtp/user_list/${userUuid}/disable/?tenant_uuid=${tenantUuid}&is_active=${isActive}`;

export const CREATE_MTP_ADMINISTRATION_SLA_GROUP = (instanceId: string) => `customer/mtp_dynamics_crm/instances/${instanceId}/mtpslagroup/`;

export const MTP_ADMINISTRATION_SLA_GROUP_BY_ID = (instanceId: string, uuid: string) => `/customer/mtp_dynamics_crm/instances/${instanceId}/mtpslagroup/${uuid}/`;

export const MTP_ADMINISTRATION_SLA_GET_CRM_INSTANCES = () => `/customer/mtp_dynamics_crm/instances/`;

export const MTP_ADMINISTRATION_SLA_GET_TENANTS_BY_CRM_INSTANCE_ID = (uuid: string) => `/customer/mtp_dynamics_crm/instances/${uuid}/crmtenants/`;

export const MTP_USER_MANAGEMENT_DETAILS = () => `customer/mtp/tenants_settings/get_tenants_settings/`;

export const MTP_USER_MANAGEMENT_AUTO_REMEDIATION = (uuid: string) => `/customer/mtp/tenants_settings/${uuid}/`

export const MTP_TENANT_DELETE = (uuid: string) => `/customer/mtp/tenant/${uuid}`;

export const MTP_TENANT_USER_PASSWORD_RESET = (uuid: string) => `/customer/mtp/user_list/${uuid}/send_password_reset_link/`;

export const MTP_TENANT_USER_TOGGLE = (uuid: string) => `/customer/mtp/user_list/${uuid}/disable/`;

export const MTP_TENANT_USER_ROLE = () => `/customer/mtp/user_roles/`;

export const MTP_TENANT_CARRIER = () => `customer/mtp/carrier_list_data`;

export const MTP_EDIT_USER_DETAILS = (userUuid: string, tenantUuid: string) => `/customer/mtp/user_list/${userUuid}/update_user/?tenant_uuid=${tenantUuid}`;

export const MTP_ADD_SUBCRIPTION = (tenantId: string) => `customer/mtp/subscriptions/${tenantId}/add_subscription/`;

export const MTP_DASHBOARD_TENANT_MAP_API = () => `/customer/mtp/tenantlocation/get_tenants_location/`;

export const GET_SLA_ITEM_BY_INSTANCEID = (instanceId: string) => `/customer/mtp_dynamics_crm/instances/${instanceId}/crmslaitem/`;

export const CREATE_SLA_ITEM_BY_INSTANCEID_AND_SLA_GROUP_ID = (instanceId: string, groupId: string) => `/customer/mtp_dynamics_crm/instances/${instanceId}/crmslaitem/create_sla_item/?sla_id=${groupId}`;

export const MTP_ADMINISTRATION_SLA_ITEM_BY_INSTANCEID_AND_ITEM_ID = (instanceId: string, uuid: string) => `/customer/mtp_dynamics_crm/instances/${instanceId}/crmslaitem/${uuid}/`;

export const MTP_ADMINISTRATION_CRM_USERS_BY_INSTANCEID = (instanceId: string) => `/customer/mtp_dynamics_crm/instances/${instanceId}/crmslaitem/get_emails/`;

export const MTP_TENANT_TOGGLE = (tenantId: string) => `/customer/mtp/tenant/${tenantId}/`;

export const MTP_IMPERSONATE_USER = (userId: number) => `/hijack/${userId}/`;

export const GET_CARRIER_LIST = () => `customer/mtp/carrier_list_data`;

export const GET_AZURE_CLOUD_LIST = () => `/customer/azure_ad_account/`;

export const EDIT_AZURE_ACCOUNT = (accountId: string) => `customer/azure_ad_account/${accountId}/`;

export const DELETE_AZURE_ACCOUNT = (accountId: string) => `customer/azure_ad_account/${accountId}/`;

export const GET_AZURE_ACCOUNTS = () => GET_AZURE_CLOUD_LIST();

export const AZURE_SYNC_DISCOVERED_VMS = () => `customer/azure_ad_account/discover_azure_vms/`;

export const CHANGE_AZURE_PASSWORD = () => `customer/azure_ad_account/change_password/`;

export const GET_USER_IMPORT_LIST = (accountId: string) => `customer/azure_ad_account/${accountId}/import_users/`;

export const BULK_USER_IMPORT = () => `customer/mtp/mtpusers/bulk_create_users/`;

export const NOTIFICATION_CUSTOMIZE_EMAIL = (instanceId: string) => `customer/mtp_dynamics_crm/instances/${instanceId}/emailbody/retrieve_event/`;

export const NOTIFICATION_UPDATE_EMAIL = (eventId: string, instanceId: string) => `customer/mtp_dynamics_crm/instances/${instanceId}/emailbody/${eventId}/`;

export const ADD_SERVICE_NOW = () => `customer/mtp/servicenow/`;

export const EDIT_SERVICE_NOW = (serviceNowId: string) => `customer/mtp/servicenow/${serviceNowId}/`;

export const GET_TEANT_USER_GROUPS = () => `customer/mtp/mtp_group_roles/`;

export const GET_DATACENTER_FAST = () => `customer/colo_cloud_fast/`;

export const GET_PRIVATE_CLOUD_FAST = () => `customer/private_cloud_fast/`;

export const CREATE_SCHEDULE = () => `customer/mtp/mschedules/`;

export const GET_SCHEDULE = (uuid: string) => `customer/mtp/mschedules/${uuid}/`;

export const EDIT_SCHEDULE = (uuid: string) => `customer/mtp/mschedules/${uuid}/`;

export const GET_MAINTENANCE_INSTANCE = () => `/customer/mtp/mschedules/`;

export const DELETE_MAINTENANCE_INSTANCE = (uuid: string) => `/customer/mtp/mschedules/${uuid}`;

export const GET_MTP_TICKET_STATES = (instanceId: string) => `/customer/mtp_dynamics_crm/instances/instance_attributes/?uuid=${instanceId}&attribute=statecode`;

export const GET_MTP_CHANGE_TICKET_STAGES = (instanceId: string) => `/customer/mtp_dynamics_crm/instances/instance_attributes/?uuid=${instanceId}&attribute=changestage`;

export const GET_MTP_TICKET_TYPES = (instanceId: string) => `/customer/mtp_dynamics_crm/instances/instance_attributes/?uuid=${instanceId}&attribute=casetype`;

export const GET_MTP_TICKET_PRIORITIES = (instanceId: string) => `/customer/mtp_dynamics_crm/instances/instance_attributes/?uuid=${instanceId}&attribute=prioritycode`;

export const GET_MTP_TICKET_RESOLUTION_TYPES = (instanceId: string, resolvedStateVal: number) => `/customer/mtp_dynamics_crm/instances/instance_attributes/?uuid=${instanceId}&attribute=statuscode&resolve=true&state=${resolvedStateVal}`;

export const GET_MTP_TICKET_STATUS = (instanceId: string) => `/customer/mtp_dynamics_crm/instances/instance_attributes/?uuid=${instanceId}&attribute=statuscode`;

export const GET_MTP_TICKET_CANCEL_STATUS = (instanceId: string, cancelledStateVal: number) => `/customer/mtp_dynamics_crm/instances/instance_attributes/?uuid=${instanceId}&attribute=statuscode&cancel=true&state=${cancelledStateVal}`;

export const GET_MTP_KPIS = (instanceId: string) => `/customer/mtp_dynamics_crm/instances/instance_attributes/?uuid=${instanceId}&attribute=kpi`;

export const SYNC_MTP_TICKET_ATTRIBUTES = (instanceId: string) => `/customer/mtp_dynamics_crm/instances/${instanceId}/sync_attributes/`;