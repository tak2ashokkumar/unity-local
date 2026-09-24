import { TabData } from 'src/app/shared/tabdata';

export interface DatacenterDeviceTabResponse {
  device: string;
  count: number;
}

export interface DatacenterDeviceTabDefinition {
  apiDeviceName: string;
  name: string;
  url: string;
}

export interface DatacenterDeviceTabIcon extends Pick<TabData, 'name' | 'icon'> { }
