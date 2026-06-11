import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Tenant } from '../shared/SharedEntityTypes/tenants.type';
import { DeviceMapping, UnityDeviceType, UnityTimeDuration } from '../shared/app-utility/app-utility.service';

@Injectable()
export class MtpAimlMgmtService {

  constructor(private http: HttpClient,
    private builder: FormBuilder,) { }

  getTenants() {
    return this.http.get<Tenant[]>(`/customer/mtp/tenant/`);
  }

  getDropdownData(): Observable<{ tenants: Tenant[] }> {
    return forkJoin({
      tenants: this.getTenants().pipe(catchError(error => of(undefined))),
    })
  }

  buildFilterForm(tenants: Tenant[]): FormGroup {
    let tns: any[] = [];
    tns.map((tn: Tenant) => tns.push(tn.uuid));
    return this.builder.group({
      'tenants': [[], [Validators.required]],
      'timeline': [UnityTimeDuration.ACTIVE, [Validators.required]]
    })
  }

  resetFilterFormErrors() {
    return {
      'tenants': '',
      'timeline': '',
    }
  }

  filterFormValidationMessages = {
    'tenants': {
      'required': 'Tenant is required'
    },
    'timeline': {
      'required': 'Timeline is required',
    },
  }

  getAIMLSummary() {
    let params: HttpParams = new HttpParams();
    params = params.append('last_n_days', 1);
    params = params.append('last_n_days', 2);
    return this.http.get<any>(`customer/mtp/conditions/summary/`, { params: params });
  }

  getPercentage(recent: number, previousToRecent: number): { percentage: number, isIncreased: boolean } {
    let k: { percentage: number, isIncreased: boolean } = { percentage: 0, isIncreased: false };

    let diff = previousToRecent - recent;
    if (diff) {
      let difference = recent - diff;
      if (difference < 0) {
        k.isIncreased = false;
        k.percentage = Math.round((difference / diff) * 100);
      } else {
        k.isIncreased = true;
        k.percentage = Math.round((difference / diff) * 100);
      }
    } else {
      k.isIncreased = true;
      k.percentage = 0;
    }
    return k;
  }

  convertToViewData(data: any): AIMLHeaderViewData {
    let a: AIMLHeaderViewData = new AIMLHeaderViewData();
    a.events = data.total.event_count;
    let eventsIncrease = this.getPercentage(data.last_1_days.event_count, data.last_2_days.event_count);
    a.isEventsIncreased = eventsIncrease.isIncreased;
    a.eventsIncreasePercentage = eventsIncrease.percentage;
    a.alerts = data.total.alert_count;
    a.conditions = data.total.condition_count;
    a.noiseReductionPercentage = data.total.noise_reduction;
    a.correlationPercentage = data.total.correlation_reduction;
    a.eventReductionPercentage = data.total.event_count ? Math.round(((data.total.event_count - data.total.condition_count) / data.total.event_count) * 100) : 0;
    return a;
  }

  private filterChangeAnnouncedSource = new Subject<AIMLFilterFormData>();
  filterChangeAnnounced$ = this.filterChangeAnnouncedSource.asObservable();
  filterChanged(filters: AIMLFilterFormData) {
    console.log('invoking event with filters : ', filters);
    this.filterChangeAnnouncedSource.next(filters);
  }
}

export class AIMLFilterFormData {
  tenants: string[];
  datacenters: string[];
  private_clouds: string[];
  device_types: string[];
  timeline: string;
  type?: string;
  count?: number;
  search?: string;
}

export class AIMLHeaderViewData {
  constructor() { }
  events: number = 0;
  isEventsIncreased: boolean = true;
  eventsIncreasePercentage: number = 0;
  alerts: number = 0;
  conditions: number = 0;
  noiseReductionPercentage: number = 0;
  correlationPercentage: number = 0;
  eventReductionPercentage: number = 0;
}

export const AIOPS_DEVICE_TYPES: UnityDeviceType[] = [
  { type: 'Switch', mapping: DeviceMapping.SWITCHES, key: 'switch' },
  { type: 'Firewall', mapping: DeviceMapping.FIREWALL, key: 'firewall' },
  { type: 'Load Balancer', mapping: DeviceMapping.LOAD_BALANCER, key: 'load_balancer' },
  { type: 'Hypervisor', mapping: DeviceMapping.HYPERVISOR, key: 'hypervisor' },
  { type: 'Bare Metal Server', mapping: DeviceMapping.BARE_METAL_SERVER, key: 'bms' },
  { type: 'Storage Device', mapping: DeviceMapping.STORAGE_DEVICES, key: 'storage' },
  { type: 'MAC Device', mapping: DeviceMapping.MAC_MINI, key: 'mac_device' },
  { type: 'Database Server', mapping: DeviceMapping.DB_SERVER, key: 'database' },
  { type: 'PDU', mapping: DeviceMapping.PDU, key: 'pdu' },
  { type: 'Virtual Machine', mapping: DeviceMapping.VIRTUAL_MACHINE, key: 'vm' },
];
