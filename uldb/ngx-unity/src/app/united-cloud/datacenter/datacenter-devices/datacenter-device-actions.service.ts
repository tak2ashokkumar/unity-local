import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AppLevelService } from 'src/app/app-level.service';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { ConsoleAccessInput } from 'src/app/shared/check-auth/check-auth.service';
import { BM_SERVER_TICKET_METADATA, HYPERVISOR_TICKET_METADATA, SUMMARY_TICKET_METADATA, SWITCH_TICKET_METADATA, TICKET_SUBJECT } from 'src/app/shared/create-ticket.const';
import { DeviceZabbixEmailNotificationService } from 'src/app/shared/device-zabbix-email-notification/device-zabbix-email-notification.service';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { SharedCreateTicketService } from 'src/app/shared/shared-create-ticket/shared-create-ticket.service';
import { BmServersCrudService } from '../../shared/bm-servers/bm-servers-crud/bm-servers-crud.service';
import { FirewallCrudService } from '../../shared/firewalls/firewalls-crud/firewalls-crud.service';
import { HypervisorsCrudService } from '../../shared/hypervisors/hypervisors-crud/hypervisors-crud.service';
import { LoadbalancersCrudService } from '../../shared/loadbalancers/loadbalancers-crud/loadbalancers-crud.service';
import { StorageCrudService } from '../../shared/storage-devices/storage-crud/storage-crud.service';
import { SwitchesCrudService } from '../../shared/switches/switches-crud/switches-crud.service';
import { DatacenterDeviceActionType, DatacenterDeviceListingConfig } from './datacenter-devices.type';

@Injectable()
export class DatacenterDeviceActionsService {
  constructor(private router: Router,
    private appService: AppLevelService,
    private storageService: StorageService,
    private ticketService: SharedCreateTicketService,
    private termService: FloatingTerminalService,
    private zabbixAlertConfig: DeviceZabbixEmailNotificationService,
    private switchesCrudService: SwitchesCrudService,
    private firewallCrudService: FirewallCrudService,
    private loadbalancersCrudService: LoadbalancersCrudService,
    private hypervisorsCrudService: HypervisorsCrudService,
    private bmServersCrudService: BmServersCrudService,
    private storageCrudService: StorageCrudService) { }

  run(action: DatacenterDeviceActionType, dcId: string, deviceType: string, row: any, config: DatacenterDeviceListingConfig) {
    switch (action) {
      case 'consoleSameTab':
        this.consoleSameTab(row, config);
        break;
      case 'webAccessNewTab':
        this.webAccessNewTab(row, config);
        break;
      case 'consoleNewTab':
        this.consoleNewTab(row, config);
        break;
      case 'stats':
        this.goToStats(dcId, deviceType, row, config);
        break;
      case 'ticket':
        this.createTicket(row, config);
        break;
      case 'notify':
        this.notify(row, config);
        break;
      case 'edit':
        this.edit(deviceType, row, config);
        break;
      case 'delete':
        this.delete(deviceType, row, config);
        break;
      case 'resetPassword':
        this.resetPassword(deviceType, row, config);
        break;
      default:
        return;
    }
  }

  isDisabled(action: DatacenterDeviceActionType, row: any): boolean {
    if (row && row.isShared && (action === 'stats' || action === 'edit' || action === 'delete')) {
      return true;
    }
    if (action === 'consoleSameTab') {
      return !this.getValueByKeys(row, ['sameTabConsoleAccessUrl', 'same_tab_console_access_url']);
    }
    if (action === 'webAccessNewTab') {
      return !this.getValueByKeys(row, ['newTabWebAccessUrl', 'new_tab_web_access_url']);
    }
    if (action === 'consoleNewTab') {
      return !this.getValueByKeys(row, ['newTabConsoleAccessUrl', 'new_tab_console_access_url']);
    }
    if (action === 'resetPassword') {
      return !this.getValueByKeys(row, ['isESXIHypervisor', 'is_esxi_hypervisor']);
    }
    return false;
  }

  getTooltip(action: DatacenterDeviceActionType, row: any, fallback: string): string {
    switch (action) {
      case 'consoleSameTab':
        return row.sameTabTootipMessage || fallback;
      case 'webAccessNewTab':
      case 'consoleNewTab':
        return row.newTabTootipMessage || row.newTabTooltipMessage || fallback;
      case 'stats':
        return row.statsTooltipMessage || fallback;
      case 'edit':
        return row.editBtnTooltipMsg || fallback;
      case 'delete':
        return row.deleteBtnTooltipMsg || fallback;
      case 'resetPassword':
        return row.resetPasswordTooltip || row.resetPasswordTooltipMessage || fallback;
      default:
        return fallback;
    }
  }

  private goToStats(dcId: string, deviceType: string, row: any, config: DatacenterDeviceListingConfig) {
    if (row.isShared) {
      return;
    }
    const deviceId = this.getDeviceId(row, deviceType);
    const monitoring = row.monitoring || {};
    this.storageService.put('device', {
      name: this.getName(row),
      deviceType: config.deviceMapping,
      configured: monitoring.configured,
      redfish: row.redfish
    }, StorageType.SESSIONSTORAGE);
    if (monitoring.observium) {
      const path = monitoring.configured && monitoring.enabled ? 'overview' : 'configure';
      this.router.navigate(['/unitycloud/datacenter', dcId, 'devices', deviceType, deviceId, 'obs', path]);
      return;
    }
    const path = monitoring.configured && monitoring.enabled ? 'monitoring-graphs' : 'configure';
    this.router.navigate(['/unitycloud/datacenter', dcId, 'devices', deviceType, deviceId, 'zbx', path]);
  }

  private consoleSameTab(row: any, config: DatacenterDeviceListingConfig) {
    const url = this.getValueByKeys(row, ['sameTabConsoleAccessUrl', 'same_tab_console_access_url']);
    if (!url) {
      return;
    }
    this.termService.openTerminal(this.getConsoleAccessInput(row, config));
  }

  private webAccessNewTab(row: any, config: DatacenterDeviceListingConfig) {
    const deviceId = this.getDeviceId(row);
    const webAccessUrl = this.getValueByKeys(row, ['newTabWebAccessUrl', 'new_tab_web_access_url']);
    if (webAccessUrl) {
      this.appService.updateActivityLog(config.activityLogType, deviceId);
      window.open(webAccessUrl);
    }
  }

  private consoleNewTab(row: any, config: DatacenterDeviceListingConfig) {
    const deviceId = this.getDeviceId(row);
    const consoleAccessUrl = this.getValueByKeys(row, ['newTabConsoleAccessUrl', 'new_tab_console_access_url']);
    if (consoleAccessUrl) {
      const input = this.getConsoleAccessInput(row, config);
      input.newTab = true;
      this.storageService.put('console', input, StorageType.LOCALSTORAGE);
      this.appService.updateActivityLog(config.activityLogType, deviceId);
      window.open(consoleAccessUrl);
    }
  }

  private createTicket(row: any, config: DatacenterDeviceListingConfig) {
    const name = this.getName(row);
    this.ticketService.createTicket({
      subject: TICKET_SUBJECT(config.deviceMapping, name),
      metadata: this.getTicketMetadata(row, config)
    }, config.deviceMapping);
  }

  private notify(row: any, config: DatacenterDeviceListingConfig) {
    this.zabbixAlertConfig.notify(this.getDeviceId(row), config.deviceMapping);
  }

  private edit(deviceType: string, row: any, config: DatacenterDeviceListingConfig) {
    if (row.isShared) {
      return;
    }
    const deviceId = this.getDeviceId(row, deviceType);
    switch (config.deviceMapping) {
      case DeviceMapping.SWITCHES:
        this.switchesCrudService.addOrEditSwitch(deviceId);
        break;
      case DeviceMapping.FIREWALL:
        this.firewallCrudService.addOrEditFireWall(deviceId);
        break;
      case DeviceMapping.LOAD_BALANCER:
        this.loadbalancersCrudService.addOrEditLoadbalancer(deviceId);
        break;
      case DeviceMapping.HYPERVISOR:
        this.hypervisorsCrudService.addOrEditHypervisor(deviceId);
        break;
      case DeviceMapping.BARE_METAL_SERVER:
        this.bmServersCrudService.addOrEditBaremetalServer(deviceId);
        break;
      case DeviceMapping.STORAGE_DEVICES:
        this.storageCrudService.addOrEditStorage(deviceId);
        break;
      default:
        return;
    }
  }

  private delete(deviceType: string, row: any, config: DatacenterDeviceListingConfig) {
    if (row.isShared) {
      return;
    }
    const deviceId = this.getDeviceId(row, deviceType);
    switch (config.deviceMapping) {
      case DeviceMapping.SWITCHES:
        this.switchesCrudService.deleteSwitch(deviceId);
        break;
      case DeviceMapping.FIREWALL:
        this.firewallCrudService.deleteFireWall(deviceId);
        break;
      case DeviceMapping.LOAD_BALANCER:
        this.loadbalancersCrudService.deleteLoadbalancer(deviceId);
        break;
      case DeviceMapping.HYPERVISOR:
        this.hypervisorsCrudService.deleteHypervisor(deviceId);
        break;
      case DeviceMapping.BARE_METAL_SERVER:
        this.bmServersCrudService.deleteBaremetalServer(deviceId);
        break;
      case DeviceMapping.STORAGE_DEVICES:
        this.storageCrudService.deleteStorage(deviceId);
        break;
      default:
        return;
    }
  }

  private resetPassword(deviceType: string, row: any, config: DatacenterDeviceListingConfig) {
    if (config.deviceMapping === DeviceMapping.HYPERVISOR) {
      this.hypervisorsCrudService.resetPassword(this.getDeviceId(row, deviceType));
    }
  }

  private getConsoleAccessInput(row: any, config: DatacenterDeviceListingConfig): ConsoleAccessInput {
    return {
      label: this.getName(row),
      deviceId: this.getDeviceId(row),
      deviceName: this.getName(row),
      deviceType: config.deviceMapping,
      managementIp: this.getValueByKeys(row, ['managementIP', 'managementIp', 'management_ip']),
      port: null,
      osType: this.getValueByKeys(row, ['ssr_os', 'instance.ssr_os', 'server.ssr_os']),
      userName: null,
      newTab: false
    };
  }

  private getTicketMetadata(row: any, config: DatacenterDeviceListingConfig): string {
    const name = this.getName(row);
    if (config.deviceMapping === DeviceMapping.HYPERVISOR) {
      return HYPERVISOR_TICKET_METADATA(config.deviceMapping, name,
        this.getValueByKeys(row, ['virtualizationType', 'instance.virtualization_type', 'virtualization_type']) || 'N/A',
        this.getValueByKeys(row, ['os', 'instance.os.full_name', 'os.full_name']) || 'N/A',
        this.getValueByKeys(row, ['managementIP', 'management_ip']) || 'N/A');
    }
    if (config.deviceMapping === DeviceMapping.BARE_METAL_SERVER) {
      return BM_SERVER_TICKET_METADATA(config.deviceMapping, name,
        this.getValueByKeys(row, ['deviceStatus', 'server.status', 'status']) || 'N/A',
        this.getValueByKeys(row, ['os', 'server.os.full_name', 'os.full_name']) || 'N/A',
        this.getValueByKeys(row, ['managementIP', 'server.management_ip', 'management_ip']) || 'N/A');
    }
    if (config.deviceMapping === DeviceMapping.STORAGE_DEVICES) {
      return SUMMARY_TICKET_METADATA(config.deviceMapping, name);
    }
    return SWITCH_TICKET_METADATA(config.deviceMapping, name,
      this.getValueByKeys(row, ['deviceStatus', 'status']) || 'N/A',
      this.getValueByKeys(row, ['model', 'model.name']) || 'N/A',
      this.getValueByKeys(row, ['type', 'manufacturer.name', 'manufacturer']) || 'N/A',
      this.getValueByKeys(row, ['managementIp', 'managementIP', 'management_ip']) || 'N/A');
  }

  private getName(row: any): string {
    return this.getValueByKeys(row, ['name', 'server.name']) || 'N/A';
  }

  private getDeviceId(row: any, deviceType?: string): string {
    if (deviceType === 'bmservers') {
      return this.getValueByKeys(row, ['bmServerId', 'uuid', 'server.uuid']);
    }
    return this.getValueByKeys(row, ['deviceId', 'uuid', 'id']);
  }

  private getValueByKeys(row: any, keys: string[]): any {
    for (let i = 0; i < keys.length; i++) {
      const value = this.getValueByPath(row, keys[i]);
      if (value !== null && value !== undefined && value !== '') {
        return value;
      }
    }
    return null;
  }

  private getValueByPath(row: any, path: string): any {
    return path.split('.').reduce((value: any, key: string) => value ? value[key] : null, row);
  }
}
