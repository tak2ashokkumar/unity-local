import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PRIVATE_CLOUD_WIDGET_DATA } from 'src/app/shared/api-endpoint.const';
import { PCFastData } from '../pc-fast.type';
import { CurrencyPipe } from '@angular/common';

@Injectable()
export class PrivateCloudWidgetClustersService {

  constructor(private http: HttpClient, 
      private currencyPipe: CurrencyPipe) { }
  
  getClusterAllocations(cloud: PCFastData): Observable<ClusterDataType> {
    return this.http.get<ClusterDataType>(PRIVATE_CLOUD_WIDGET_DATA(cloud.uuid));
  }

  convertToPCWidgetViewData(cloud: PCFastData, widgetData: ClusterDataType): any {
    let a: ClusterViewData = new ClusterViewData();
    a.totalClusters = widgetData.total_clusters ? Number(widgetData.total_clusters.toFixed(2)) : 0;
    a.totalResources = widgetData.total_resources ? Number(widgetData.total_resources.toFixed(2)) : 0;
    a.highestHost = widgetData.highest_host;
    a.highestHostValue = widgetData.highest_host.length ? widgetData.highest_host[0] : '';
    a.extraHighestHosts = widgetData.highest_host.length > 1 ? widgetData.highest_host.slice(1) : [];
    if(widgetData.alerts){
      let alert = new Alert();
      alert.total = widgetData.alerts.total ? Number(widgetData.alerts.total.toFixed(2)) : 0;
      alert.information = widgetData.alerts.information ? Number(widgetData.alerts.information.toFixed(2)) : 0;
      alert.warning = widgetData.alerts.warning ? Number(widgetData.alerts.warning.toFixed(2)) : 0;
      alert.critical = widgetData.alerts.critical ? Number(widgetData.alerts.critical.toFixed(2)) : 0;
      a.alerts = alert;
    }
    if(widgetData.top_cpu_usage){
      let cpuUsage:TopUsageItem[] = [];
      widgetData.top_cpu_usage.forEach((cluster)=>{
        let c = new TopUsageItem();
        c.name = cluster.name;
        c.uuid = cluster.uuid;
        c.status = cluster.status;
        // c.usage = cluster.usage;
        if(cluster.usage){
          c.capacity = `${cluster.usage.total?.value ? Number(cluster.usage.total.value.toFixed(2)) : 0} ${cluster.usage.total?.unit}`;
          c.used = `${cluster.usage.used?.value ? Number(cluster.usage.used.value.toFixed(2)) : 0} ${cluster.usage.used?.unit}`;
          c.free = `${cluster.usage.available?.value ? Number(cluster.usage.available.value.toFixed(2)) : 0} ${cluster.usage.available?.unit}`;
          c.free_percentage = cluster.usage.available_percentage?.value ? Number(cluster.usage.available_percentage.value.toFixed(2)) : 0;
          c.used_percentage = cluster.usage.consumed_percentage?.value ? Number(cluster.usage.consumed_percentage.value.toFixed(2)) : 0;
        }
        cpuUsage.push(c);
      });
      a.topCpuUsage = cpuUsage;
    }
    if(widgetData.top_memory_usage){
      let mUsage:TopUsageItem[] = [];
      widgetData.top_memory_usage.forEach((cluster)=>{
        let c = new TopUsageItem();
        c.name = cluster.name;
        c.uuid = cluster.uuid;
        c.status = cluster.status;
        // c.usage = cluster.usage;
        if(cluster.usage){
          c.capacity = `${cluster.usage.total?.value ? Number(cluster.usage.total.value.toFixed(2)) : 0} ${cluster.usage.total?.unit}`;
          c.used = `${cluster.usage.used?.value ? Number(cluster.usage.used.value.toFixed(2)) : 0} ${cluster.usage.used?.unit}`;
          c.free = `${cluster.usage.available?.value ? Number(cluster.usage.available.value.toFixed(2)) : 0} ${cluster.usage.available?.unit}`;
          c.free_percentage = cluster.usage.available_percentage?.value ? Number(cluster.usage.available_percentage.value.toFixed(2)) : 0;
          c.used_percentage = cluster.usage.consumed_percentage?.value ? Number(cluster.usage.consumed_percentage.value.toFixed(2)) : 0;
        }
        mUsage.push(c);
      });      
      a.topMemoryUsage = mUsage;
    }
    if(widgetData.top_storage_usage){
      let sUsage:TopUsageItem[] = [];
      widgetData.top_storage_usage.forEach((cluster)=>{
        let c = new TopUsageItem();
        c.name = cluster.name;
        c.uuid = cluster.uuid;
        c.status = cluster.status;
        // c.usage = cluster.usage;
        if(cluster.usage){
          c.capacity = `${cluster.usage.total?.value ? Number(cluster.usage.total.value.toFixed(2)) : 0} ${cluster.usage.total?.unit}`;
          c.used = `${cluster.usage.used?.value ? Number(cluster.usage.used.value.toFixed(2)) : 0} ${cluster.usage.used?.unit}`;
          c.free = `${cluster.usage.available?.value ? Number(cluster.usage.available.value.toFixed(2)) : 0} ${cluster.usage.available?.unit}`;
          c.free_percentage = cluster.usage.available_percentage?.value ? Number(cluster.usage.available_percentage.value.toFixed(2)) : 0;
          c.used_percentage = cluster.usage.consumed_percentage?.value ? Number(cluster.usage.consumed_percentage.value.toFixed(2)) : 0;
        }
        sUsage.push(c);
      });
      a.topStorageUsage = sUsage;
      const monthToDateCost = widgetData.month_to_date_cost ? widgetData.month_to_date_cost : 0;
      /*  "~~" is a bitwise operator used to round the floating point values */
      a.monthToDateCost = this.currencyPipe.transform(~~monthToDateCost, 'USD' , 'symbol', '1.0-0');
    }
    return a;
  }

}

export class ClusterViewData {
  constructor() { }
  totalClusters: number;
  totalResources: number;
  highestHost: string[];
  highestHostValue: string;
  extraHighestHosts: string[];
  alerts: Alert;
  topCpuUsage: TopUsageItem[];
  topMemoryUsage: TopUsageItem[];
  topStorageUsage: TopUsageItem[];
  monthToDateCost: string;
}

class Alert {
  constructor() { }
  information: number;
  total: number;
  warning: number;
  critical: number;
}

export class TopUsageItem {
  constructor() { }
  // usage: Usage;
  status: string;
  name: string;
  uuid: string;
  capacity:string;
	free: string;
	used: string;
	free_percentage: number;
	used_percentage: number;
}
class Usage {
  constructor() { }
  total: ValueAndUnit;
  available: ValueAndUnit;
  consumed_percentage: ValueAndUnit;
  used: ValueAndUnit;
  available_percentage: ValueAndUnit;
}
class ValueAndUnit {
  constructor() { }
  value: number;
  unit: string;
}

export interface ClusterDataType {
  total_clusters: number;
  total_resources: number;
  highest_host: string[];
  alerts: AlertsType;
  top_cpu_usage: TopUsageItemType[];
  top_memory_usage: TopUsageItemType[];
  top_storage_usage: TopUsageItemType[];
  month_to_date_cost: number;
}
interface AlertsType {
  information: number;
  total: number;
  warning: number;
  critical: number;
}
interface TopUsageItemType {
  usage: UsageType;
  status: string;
  name: string;
  uuid: string;
}
interface UsageType {
  total: ValueAndUnitType;
  available: ValueAndUnitType;
  consumed_percentage: ValueAndUnitType;
  used: ValueAndUnitType;
  available_percentage: ValueAndUnitType;
}
interface ValueAndUnitType {
  value: number;
  unit: string;
}