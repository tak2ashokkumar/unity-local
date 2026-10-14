import { DeviceProxy } from 'src/app/shared/SharedEntityTypes/device-common-utils.type';
import { PrivateCloudRemoteWebAccessType } from 'src/app/shared/SharedEntityTypes/private-cloud.type';
import { UnityScheduleType } from 'src/app/shared/SharedEntityTypes/schedule.type';

export interface FirewallManagementCenterAccountType {
  uuid: string;
  name: string;
  account_url: string;
  port: number;
  username: string;
  version: string;
  proxy: DeviceProxy;
  remote_web_access?: PrivateCloudRemoteWebAccessType;
  created_at: string;
  updated_at: string;
  schedule_meta: UnityScheduleType;
  // collector: DeviceDiscoveryAgentConfigurationType;
  collector: string;
}
