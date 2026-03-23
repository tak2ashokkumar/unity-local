import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable } from 'rxjs';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { OrganizationType } from './network-controllers-cisco-meraki-organizations.type';
import { Monitoring } from 'src/app/unity-setup/unity-setup-monitoring/auto-remediation/auto-remediation.service';
import { DeviceMonitoringType } from 'src/app/shared/SharedEntityTypes/devices-monitoring.type';

@Injectable()
export class NetworkControllersCiscoMerakiOrganizationsService {

  constructor(private http: HttpClient,
    private tableService: TableApiServiceService,
    private utilService: AppUtilityService,
    private user: UserInfoService) { }

  getMerakiOrganizations(criteria: SearchCriteria, organizationId: string): Observable<OrganizationType[]> {
    return this.tableService.getData<OrganizationType[]>(` /customer/meraki/organizations/?account=${organizationId}`, criteria);
  }

  getRegions() {
    return this.http.get<any>(`/customer/meraki/organizations/regions/`);
  }

  getLisenceModels() {
    return this.http.get<any>(`/customer/meraki/organizations/licence_models/`);
  }

  syncDevices() {
    return this.http.get(`/customer/meraki/accounts/discover_meraki_resources/`);
  }


  convertToViewData(data: OrganizationType[]): OrganizationViewData[] {
    let viewData: OrganizationViewData[] = [];
    data.map(s => {
      let a: OrganizationViewData = new OrganizationViewData();
      a.uuid = s.uuid;
      a.merakiOrganizationId = s.meraki_organization_id;
      a.name = s.name;
      a.clientsCount = s.clients_count;
      a.licensingModel = s.licensing_model;
      a.regionHost = s.region_host;
      a.regionName = s.region_name;
      a.tags = s.tags;
      a.licenseCount = s.license_count;
      a.networksCount = s.networks_count;
      a.devicesCount = s.devices_count;
      a.monitoring = s.monitoring;
      // if (!a.monitoring.configured) {
      //   a.statsTooltipMessage = 'Configure Monitoring';
      // }
      // if (a.monitoring.configured && !a.monitoring.enabled) {
      //   a.statsTooltipMessage = 'Enable monitoring';
      // } else if (a.monitoring.enabled) {
      //   a.statsTooltipMessage = 'Meraki Organization Statistics';
      // }
      if (a.monitoring?.configured) {
        a.statsTooltipMessage = 'Meraki Organization Statistics';
      } else {
        a.statsTooltipMessage = '';
      }

      // a.licenseStates.active = s.license_states.active;
      // a.licenseStates.expired = s.license_states.expired;
      // a.licenseStates.expiring = s.license_states.expiring;
      // a.licenseStates.recentlyQueued = s.license_states.recently_queued;
      // a.licenseStates.unused = s.license_states.unused;
      // a.licenseStates.unusedActive = s.license_states.unused_active;

      // a.systemManagerData.activeSeats = s.system_manager_data.active_seats;
      // a.systemManagerData.orgwideEnrolledDevices = s.system_manager_data.orgwide_enrolled_devices;
      // a.systemManagerData.totalSeats = s.system_manager_data.total_seats;
      // a.systemManagerData.unassignedSeats = s.system_manager_data.unassigned_seats;

      viewData.push(a);
    });
    return viewData;
  }

  getDeviceData(device: OrganizationViewData) {
  }
}

export class LicenseStates {
  constructor() { };
  expiring: number;
  unused: number;
  recentlyQueued: number;
  active: number;
  expired: number;
  unusedActive: number;
}

export class SystemManagerData {
  constructor() { }
  activeSeats: number;
  unassignedSeats: number;
  totalSeats: number;
  orgwideEnrolledDevices: number;
}

export class OrganizationViewData {
  constructor() { };
  uuid: string;
  merakiOrganizationId: string;
  name: string;
  clientsCount: number;
  licensingModel: string;
  regionHost: string;
  regionName: string;
  tags: string[];
  licenseCount: number;
  licenseStates: LicenseStates;
  licenseStatus: string;
  expiryDate: string;
  systemManagerData: SystemManagerData;
  account: string;
  devicesCount: number;
  networksCount: number;
  monitoring: DeviceMonitoringType;
  statsTooltipMessage: string;
}