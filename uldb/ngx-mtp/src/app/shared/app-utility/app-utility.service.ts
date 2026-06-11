import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { AbstractControl, FormArray, FormGroup, ValidatorFn } from '@angular/forms';
import * as moment from 'moment';
import * as momentTz from 'moment-timezone';
import { environment } from 'src/environments/environment';
import { DateRangeInUnix } from '../SharedEntityTypes/DateRangeInUnix.type';
import { GraphRange } from '../SharedEntityTypes/graph-range.type';
import { UserInfoService } from '../user-info.service';

@Injectable({
  providedIn: 'root'
})
export class AppUtilityService {

  constructor(private userInfo: UserInfoService) { }

  toUpperCase(input: string) {
    const arr = input.split(/[_-]/g);
    for (var i = 0; i < arr.length; i++) {
      arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
    }
    return arr.join(" ");
  }

  getDeviceDisplayName(input: string) {
    switch (input) {
      case 'vm': return 'Virtual Machine';
      case 'bms': return 'Bare Metal';
      default: return this.toUpperCase(input);
    }
  }

  getUnityDeviceTypes(): UnityDeviceType[] {
    return UNITY_DEVICE_TYPES;
  }

  getCloudTypeByPlatformType(platformType: string): PlatFormMapping {
    switch (platformType) {
      case 'VMware': return PlatFormMapping.VMWARE;
      case 'vCloud Director': return PlatFormMapping.VCLOUD;
      case 'OpenStack': return PlatFormMapping.OPENSTACK;
      case 'ESXi': return PlatFormMapping.ESXI;
      case 'Hyperv': return PlatFormMapping.HYPER_V;
      case 'Custom': return PlatFormMapping.CUSTOM;
      case 'Proxmox': return PlatFormMapping.PROXMOX;
      case 'G3 KVM': return PlatFormMapping.G3_KVM;
      case 'AWS': return PlatFormMapping.AWS;
      case 'Azure': return PlatFormMapping.AZURE;
      case 'GCP': return PlatFormMapping.GCP;
      case 'United Private Cloud vCenter': return PlatFormMapping.UNITED_PRIVATE_CLOUD_VCENTER;
      default: return null;
    }
  }

  getDeviceMappingByDeviceType(deviceType: string,): DeviceMapping {
    switch (deviceType) {
      case 'switch': return DeviceMapping.SWITCHES;
      case 'firewall': return DeviceMapping.FIREWALL;
      case 'load_balancer': return DeviceMapping.LOAD_BALANCER;
      case 'hypervisor': return DeviceMapping.HYPERVISOR;
      case 'bms': return DeviceMapping.BARE_METAL_SERVER;
      case 'baremetal': return DeviceMapping.BARE_METAL_SERVER;
      case 'mac_device': return DeviceMapping.MAC_MINI;
      case 'storage': return DeviceMapping.STORAGE_DEVICES;
      case 'pdu': return DeviceMapping.PDU;
      case 'database': return DeviceMapping.DB_SERVER;
      case 'mobile': return DeviceMapping.MOBILE_DEVICE;
      case 'vmware': return DeviceMapping.VMWARE_VIRTUAL_MACHINE;
      case 'vcloud': return DeviceMapping.VCLOUD;
      case 'open_stack': return DeviceMapping.OPENSTACK_VIRTUAL_MACHINE;
      case 'hyperv': return DeviceMapping.HYPER_V;
      case 'g3_kvm': return DeviceMapping.G3_KVM;
      case 'proxmox': return DeviceMapping.PROXMOX;
      case 'esxi': return DeviceMapping.ESXI;
      case 'virtual_machine': return DeviceMapping.CUSTOM_VIRTUAL_MACHINE;
      case 'vm': return DeviceMapping.CUSTOM_VIRTUAL_MACHINE;
      case 'instance': return DeviceMapping.AWS_VIRTUAL_MACHINE;
      case 'azurevirtualmachine': return DeviceMapping.AZURE_VIRTUAL_MACHINE;
      case 'gcpvirtualmachines': return DeviceMapping.GCP_VIRTUAL_MACHINE;
      case 'oraclevirtualmachine': return DeviceMapping.ORACLE_VIRTUAL_MACHINE;
      case 'ocivirtualmachines': return DeviceMapping.ORACLE_VIRTUAL_MACHINE;
      case 'cabinet': return DeviceMapping.CABINET_VIZ;
      case 'datacenter':
      case 'colocloud': return DeviceMapping.DC_VIZ;
      case 'private_cloud': return DeviceMapping.PC_VIZ;
      case 'organization': return DeviceMapping.ORG_VIZ;
      case 'United_private_cloud_vcenter': return DeviceMapping.UNITED_PRIVATE_CLOUD_VCENTER;
      default: null;
    }
  }

  validateForm(form: FormGroup, validationMessages: any, formErrors: any) {
    if (!form) { return; }
    for (const field in formErrors) {
      if (form.get(field) instanceof FormGroup) {
        this.validateForm(<FormGroup>form.get(field), validationMessages[field], formErrors[field]);
      } else if (form.get(field) instanceof FormArray) {
        let fa = form.get(field) as FormArray;
        for (let index = 0; index < fa.length; index++) {
          if (validationMessages[field]) {
            formErrors[field][index] = this.validateForm(<FormGroup>fa.at(index), validationMessages[field], formErrors[field][index]);
          } else {
            formErrors[field][index] = this.validateForm(<FormGroup>fa.at(index), validationMessages, formErrors[field][index]);
          }
        }
      } else {
        formErrors[field] = '';
        const control = form.get(field);
        if (control && !control.valid) {
          const messages = validationMessages[field];
          for (const key in control.errors) {
            if (key === 'whitespace') {
              formErrors[field] += 'Enter valid Input'
            } else {
              formErrors[field] += messages ? messages[key] : '' + ' ';
            }
            break;
          }
        }
      }
    }
    return formErrors;
  }

  getDeviceUptime(details: { status: string, uptime: string, last_rebooted: string }) {
    if (details.status == '1') {
      return details.uptime;
    } else {
      const currenttime = new Date().valueOf();
      const lastrebootedtime = new Date(Number(details.last_rebooted) * 1000).valueOf();
      let totaltime = (currenttime - lastrebootedtime) / 1000;
      return (totaltime - Number(details.uptime)).toString();
    }
  }

  getDeviceStatus(data: string | number) {
    if (data) {
      switch (data) {
        case `1`:
        case 1:
          return `Up`;
        case `0`:
        case 0:
          return `Down`;
        case `-1`: // device is configured but couldn't get state
        case -1:
          return `Unknown`;
        case `-2`: // device is configured but disabled
        case -2:
          return `Monitoring Disabled`;
        default: // status == null for not not reacheable device
          return `Not Configured`;
      }
    }
  }

  getDeviceAvailabilityStatus(data: string | number) {
    return data == '1' || data == 1 ? 'Up' : 'Down';
  }

  getDateRangeByGraphRange(graphRange: GraphRange): DateRangeInUnix {
    switch (graphRange) {
      case GraphRange.DAY:
        return { from: moment().subtract(1, 'd').unix(), to: moment().unix() };
      case GraphRange.WEEK:
        return { from: moment().subtract(1, 'w').unix(), to: moment().unix() };
      case GraphRange.MONTH:
        return { from: moment().subtract(1, 'M').unix(), to: moment().unix() };
      case GraphRange.YEAR:
        return { from: moment().subtract(1, 'y').unix(), to: moment().unix() };
    }
  }

  dateRangeValidator(fromKey: string, toKey: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      if (!control.get(fromKey) || !control.get(toKey)) { return null }
      if (!control.get(fromKey).value || !control.get(toKey).value) { return null }
      const from = control.get(fromKey).value;
      const to = control.get(toKey).value;
      if (moment(from).isAfter(to)) {
        return { 'fromAfterTo': true };
      }
      return null;
    }
  }

  getTimezones(): string[] {
    return ['Africa/Abidjan', 'Africa/Accra', 'Africa/Addis_Ababa', 'Africa/Algiers', 'Africa/Asmara', 'Africa/Bamako', 'Africa/Bangui', 'Africa/Banjul', 'Africa/Bissau', 'Africa/Blantyre', 'Africa/Brazzaville', 'Africa/Bujumbura', 'Africa/Cairo', 'Africa/Casablanca', 'Africa/Ceuta', 'Africa/Conakry', 'Africa/Dakar', 'Africa/Dar_es_Salaam', 'Africa/Djibouti', 'Africa/Douala', 'Africa/El_Aaiun', 'Africa/Freetown', 'Africa/Gaborone', 'Africa/Harare', 'Africa/Johannesburg', 'Africa/Juba', 'Africa/Kampala', 'Africa/Khartoum', 'Africa/Kigali', 'Africa/Kinshasa', 'Africa/Lagos', 'Africa/Libreville', 'Africa/Lome', 'Africa/Luanda', 'Africa/Lubumbashi', 'Africa/Lusaka', 'Africa/Malabo', 'Africa/Maputo', 'Africa/Maseru', 'Africa/Mbabane', 'Africa/Mogadishu', 'Africa/Monrovia', 'Africa/Nairobi', 'Africa/Ndjamena', 'Africa/Niamey', 'Africa/Nouakchott', 'Africa/Ouagadougou', 'Africa/Porto-Novo', 'Africa/Sao_Tome', 'Africa/Tripoli', 'Africa/Tunis', 'Africa/Windhoek', 'America/Adak', 'America/Anchorage', 'America/Anguilla', 'America/Antigua', 'America/Araguaina', 'America/Argentina/Buenos_Aires', 'America/Argentina/Catamarca', 'America/Argentina/Cordoba', 'America/Argentina/Jujuy', 'America/Argentina/La_Rioja', 'America/Argentina/Mendoza', 'America/Argentina/Rio_Gallegos', 'America/Argentina/Salta', 'America/Argentina/San_Juan', 'America/Argentina/San_Luis', 'America/Argentina/Tucuman', 'America/Argentina/Ushuaia', 'America/Aruba', 'America/Asuncion', 'America/Atikokan', 'America/Bahia', 'America/Bahia_Banderas', 'America/Barbados', 'America/Belem', 'America/Belize', 'America/Blanc-Sablon', 'America/Boa_Vista', 'America/Bogota', 'America/Boise', 'America/Cambridge_Bay', 'America/Campo_Grande', 'America/Cancun', 'America/Caracas', 'America/Cayenne', 'America/Cayman', 'America/Chicago', 'America/Chihuahua', 'America/Costa_Rica', 'America/Creston', 'America/Cuiaba', 'America/Curacao', 'America/Danmarkshavn', 'America/Dawson', 'America/Dawson_Creek', 'America/Denver', 'America/Detroit', 'America/Dominica', 'America/Edmonton', 'America/Eirunepe', 'America/El_Salvador', 'America/Fort_Nelson', 'America/Fortaleza', 'America/Glace_Bay', 'America/Godthab', 'America/Goose_Bay', 'America/Grand_Turk', 'America/Grenada', 'America/Guadeloupe', 'America/Guatemala', 'America/Guayaquil', 'America/Guyana', 'America/Halifax', 'America/Havana', 'America/Hermosillo', 'America/Indiana/Indianapolis', 'America/Indiana/Knox', 'America/Indiana/Marengo', 'America/Indiana/Petersburg', 'America/Indiana/Tell_City', 'America/Indiana/Vevay', 'America/Indiana/Vincennes', 'America/Indiana/Winamac', 'America/Inuvik', 'America/Iqaluit', 'America/Jamaica', 'America/Juneau', 'America/Kentucky/Louisville', 'America/Kentucky/Monticello', 'America/Kralendijk', 'America/La_Paz', 'America/Lima', 'America/Los_Angeles', 'America/Lower_Princes', 'America/Maceio', 'America/Managua', 'America/Manaus', 'America/Marigot', 'America/Martinique', 'America/Matamoros', 'America/Mazatlan', 'America/Menominee', 'America/Merida', 'America/Metlakatla', 'America/Mexico_City', 'America/Miquelon', 'America/Moncton', 'America/Monterrey', 'America/Montevideo', 'America/Montserrat', 'America/Nassau', 'America/New_York', 'America/Nipigon', 'America/Nome', 'America/Noronha', 'America/North_Dakota/Beulah', 'America/North_Dakota/Center', 'America/North_Dakota/New_Salem', 'America/Ojinaga', 'America/Panama', 'America/Pangnirtung', 'America/Paramaribo', 'America/Phoenix', 'America/Port-au-Prince', 'America/Port_of_Spain', 'America/Porto_Velho', 'America/Puerto_Rico', 'America/Punta_Arenas', 'America/Rainy_River', 'America/Rankin_Inlet', 'America/Recife', 'America/Regina', 'America/Resolute', 'America/Rio_Branco', 'America/Santarem', 'America/Santiago', 'America/Santo_Domingo', 'America/Sao_Paulo', 'America/Scoresbysund', 'America/Sitka', 'America/St_Barthelemy', 'America/St_Johns', 'America/St_Kitts', 'America/St_Lucia', 'America/St_Thomas', 'America/St_Vincent', 'America/Swift_Current', 'America/Tegucigalpa', 'America/Thule', 'America/Thunder_Bay', 'America/Tijuana', 'America/Toronto', 'America/Tortola', 'America/Vancouver', 'America/Whitehorse', 'America/Winnipeg', 'America/Yakutat', 'America/Yellowknife', 'Antarctica/Casey', 'Antarctica/Davis', 'Antarctica/DumontDUrville', 'Antarctica/Macquarie', 'Antarctica/Mawson', 'Antarctica/McMurdo', 'Antarctica/Palmer', 'Antarctica/Rothera', 'Antarctica/Syowa', 'Antarctica/Troll', 'Antarctica/Vostok', 'Arctic/Longyearbyen', 'Asia/Aden', 'Asia/Almaty', 'Asia/Amman', 'Asia/Anadyr', 'Asia/Aqtau', 'Asia/Aqtobe', 'Asia/Ashgabat', 'Asia/Atyrau', 'Asia/Baghdad', 'Asia/Bahrain', 'Asia/Baku', 'Asia/Bangkok', 'Asia/Barnaul', 'Asia/Beirut', 'Asia/Bishkek', 'Asia/Brunei', 'Asia/Chita', 'Asia/Choibalsan', 'Asia/Colombo', 'Asia/Damascus', 'Asia/Dhaka', 'Asia/Dili', 'Asia/Dubai', 'Asia/Dushanbe', 'Asia/Famagusta', 'Asia/Gaza', 'Asia/Hebron', 'Asia/Ho_Chi_Minh', 'Asia/Hong_Kong', 'Asia/Hovd', 'Asia/Irkutsk', 'Asia/Jakarta', 'Asia/Jayapura', 'Asia/Jerusalem', 'Asia/Kabul', 'Asia/Kamchatka', 'Asia/Karachi', 'Asia/Kathmandu', 'Asia/Khandyga', 'Asia/Kolkata', 'Asia/Krasnoyarsk', 'Asia/Kuala_Lumpur', 'Asia/Kuching', 'Asia/Kuwait', 'Asia/Macau', 'Asia/Magadan', 'Asia/Makassar', 'Asia/Manila', 'Asia/Muscat', 'Asia/Nicosia', 'Asia/Novokuznetsk', 'Asia/Novosibirsk', 'Asia/Omsk', 'Asia/Oral', 'Asia/Phnom_Penh', 'Asia/Pontianak', 'Asia/Pyongyang', 'Asia/Qatar', 'Asia/Qyzylorda', 'Asia/Riyadh', 'Asia/Sakhalin', 'Asia/Samarkand', 'Asia/Seoul', 'Asia/Shanghai', 'Asia/Singapore', 'Asia/Srednekolymsk', 'Asia/Taipei', 'Asia/Tashkent', 'Asia/Tbilisi', 'Asia/Tehran', 'Asia/Thimphu', 'Asia/Tokyo', 'Asia/Tomsk', 'Asia/Ulaanbaatar', 'Asia/Urumqi', 'Asia/Ust-Nera', 'Asia/Vientiane', 'Asia/Vladivostok', 'Asia/Yakutsk', 'Asia/Yangon', 'Asia/Yekaterinburg', 'Asia/Yerevan', 'Atlantic/Azores', 'Atlantic/Bermuda', 'Atlantic/Canary', 'Atlantic/Cape_Verde', 'Atlantic/Faroe', 'Atlantic/Madeira', 'Atlantic/Reykjavik', 'Atlantic/South_Georgia', 'Atlantic/St_Helena', 'Atlantic/Stanley', 'Australia/Adelaide', 'Australia/Brisbane', 'Australia/Broken_Hill', 'Australia/Currie', 'Australia/Darwin', 'Australia/Eucla', 'Australia/Hobart', 'Australia/Lindeman', 'Australia/Lord_Howe', 'Australia/Melbourne', 'Australia/Perth', 'Australia/Sydney', 'Canada/Atlantic', 'Canada/Central', 'Canada/Eastern', 'Canada/Mountain', 'Canada/Newfoundland', 'Canada/Pacific', 'Europe/Amsterdam', 'Europe/Andorra', 'Europe/Astrakhan', 'Europe/Athens', 'Europe/Belgrade', 'Europe/Berlin', 'Europe/Bratislava', 'Europe/Brussels', 'Europe/Bucharest', 'Europe/Budapest', 'Europe/Busingen', 'Europe/Chisinau', 'Europe/Copenhagen', 'Europe/Dublin', 'Europe/Gibraltar', 'Europe/Guernsey', 'Europe/Helsinki', 'Europe/Isle_of_Man', 'Europe/Istanbul', 'Europe/Jersey', 'Europe/Kaliningrad', 'Europe/Kiev', 'Europe/Kirov', 'Europe/Lisbon', 'Europe/Ljubljana', 'Europe/London', 'Europe/Luxembourg', 'Europe/Madrid', 'Europe/Malta', 'Europe/Mariehamn', 'Europe/Minsk', 'Europe/Monaco', 'Europe/Moscow', 'Europe/Oslo', 'Europe/Paris', 'Europe/Podgorica', 'Europe/Prague', 'Europe/Riga', 'Europe/Rome', 'Europe/Samara', 'Europe/San_Marino', 'Europe/Sarajevo', 'Europe/Saratov', 'Europe/Simferopol', 'Europe/Skopje', 'Europe/Sofia', 'Europe/Stockholm', 'Europe/Tallinn', 'Europe/Tirane', 'Europe/Ulyanovsk', 'Europe/Uzhgorod', 'Europe/Vaduz', 'Europe/Vatican', 'Europe/Vienna', 'Europe/Vilnius', 'Europe/Volgograd', 'Europe/Warsaw', 'Europe/Zagreb', 'Europe/Zaporozhye', 'Europe/Zurich', 'GMT', 'Indian/Antananarivo', 'Indian/Chagos', 'Indian/Christmas', 'Indian/Cocos', 'Indian/Comoro', 'Indian/Kerguelen', 'Indian/Mahe', 'Indian/Maldives', 'Indian/Mauritius', 'Indian/Mayotte', 'Indian/Reunion', 'Pacific/Apia', 'Pacific/Auckland', 'Pacific/Bougainville', 'Pacific/Chatham', 'Pacific/Chuuk', 'Pacific/Easter', 'Pacific/Efate', 'Pacific/Enderbury', 'Pacific/Fakaofo', 'Pacific/Fiji', 'Pacific/Funafuti', 'Pacific/Galapagos', 'Pacific/Gambier', 'Pacific/Guadalcanal', 'Pacific/Guam', 'Pacific/Honolulu', 'Pacific/Kiritimati', 'Pacific/Kosrae', 'Pacific/Kwajalein', 'Pacific/Majuro', 'Pacific/Marquesas', 'Pacific/Midway', 'Pacific/Nauru', 'Pacific/Niue', 'Pacific/Norfolk', 'Pacific/Noumea', 'Pacific/Pago_Pago', 'Pacific/Palau', 'Pacific/Pitcairn', 'Pacific/Pohnpei', 'Pacific/Port_Moresby', 'Pacific/Rarotonga', 'Pacific/Saipan', 'Pacific/Tahiti', 'Pacific/Tarawa', 'Pacific/Tongatapu', 'Pacific/Wake', 'Pacific/Wallis', 'US/Alaska', 'US/Arizona', 'US/Central', 'US/Eastern', 'US/Hawaii', 'US/Mountain', 'US/Pacific', 'UTC'];
  }

  /**
   * * This function is used to get date in user set time zone,
   * it accepts selected moment date in local time zone and returns
   * same date and time in UTC equivalant of user set time zone
   * 
   * DO NOT REMOVE COMMENTS IN FUNCTION
   * 
   * @param date moment.Moment user selected date in localtime zone
   */
  getUTCDateInUserSetTimeZone(date: moment.Moment): moment.Moment {
    // console.log(momentTz.tz('us/pacific').format("Z"));
    // console.log('Now ' + moment().format('MM-DD-YYYY HH:mm'))
    // console.log('Now in PDT ' + moment().format('MM-DD-YYYY HH:mm') + momentTz.tz('us/mountain').format("Z"))
    // console.log('PDT to IST ' + moment(moment().format('MM-DD-YYYY HH:mm') + momentTz.tz('us/mountain').format("Z"), 'MM-DD-YYYY HH:mm Z').format())
    // console.log(moment().utcOffset(momentTz.tz('utc').format("Z")).format('MM-DD-YYYY HH:mm'))
    // console.log(moment().format('MM-DD-YYYY HH:mm:ss'), moment(moment().format('MM-DD-YYYY HH:mm:ss')).tz('US/Mountain'));
    if (date.isValid()) {
      let nowInUserTimeZone = date.format('MM-DD-YYYY HH:mm') + momentTz.tz(this.userInfo.userTimeZoneAbbr).format("Z");
      return moment.utc(nowInUserTimeZone, 'MM-DD-YYYY HH:mm Z').second(0);
    }
    throw Error('Invalid moment date!!');
  }

  convertSizeToBytes(size: string | number, unit: string) {
    if (Number.isNaN(size)) {
      console.log('Not a valid number string');
      return;
    }
    unit = unit.toUpperCase();
    if (['KB', 'MB', 'GB', 'TB'].indexOf(unit) == -1) {
      console.log('Unsupported valid unit');
      return;
    }
    if (unit == 'KB') {
      return Number(size) * Math.pow(1024, 1);
    } else if (unit == 'MB') {
      return Number(size) * Math.pow(1024, 2);
    } else if (unit == 'GB') {
      return Number(size) * Math.pow(1024, 3);
    } else if (unit == 'TB') {
      return Number(size) * Math.pow(1024, 4);
    }
  }

  toUnityOneDateFormat(input: string | number | moment.Moment, format?: string) {
    if (format) {
      return moment(input).format(format);
    }
    return moment(input).format('MMM DD, y, H:mm:ss');
  }
}

export class UnityDeviceType {
  constructor() { }
  type: string;
  mapping: string;
  modelMapping?: string;
  key?: string;
}

export enum DeviceMapping {
  SWITCHES = 'Switch',
  FIREWALL = 'Firewall',
  LOAD_BALANCER = 'Load Balancer',
  LB = 'LoadBalancer',
  HYPERVISOR = 'Hypervisor',
  BARE_METAL_SERVER = 'BM Server',

  VIRTUAL_MACHINE = 'Virtual Machine',
  VMWARE_VIRTUAL_MACHINE = 'VMware vCenter',
  OPENSTACK_VIRTUAL_MACHINE = 'OpenStack VM',
  VCLOUD = 'vCloud Director VM',
  G3_KVM = 'UnitedPrivateCloud - KVM',
  PROXMOX = 'Proxmox VM',
  HYPER_V = 'Hyper-V',
  CUSTOM_VIRTUAL_MACHINE = 'Custom VM',
  AWS_VIRTUAL_MACHINE = 'AWS VM',
  GCP_VIRTUAL_MACHINE = 'GCP VM',
  AZURE_VIRTUAL_MACHINE = 'Azure VM',
  ORACLE_VIRTUAL_MACHINE = 'OCI VM',
  ESXI = 'ESXi',
  COLLECTOR = 'Collector',

  CONTAINER_CONTROLLER = 'Container Controller',
  DOCKER_CONTROLLER = 'Docker Controller',
  STORAGE_DEVICES = 'Storage',
  PDU = 'PDU',
  CLOUD_CONTROLLER = 'Cloud Controller',
  DEVOPS_CONTROLLER = 'DevOps Controller',
  OTHER_DEVICES = 'Other Devices',
  CABINET_VIZ = 'Cabinet',
  BLANK_PANEL = 'Blank Panel',
  CABLE_ORGANISER = 'Cable Organizer',
  PATCH_PANEL = 'Patch Panel',
  MAC_MINI = 'Mac Device',
  MOBILE_DEVICE = 'Mobile Device',
  KUBERNETES_NODE = 'Kubernetes Node',
  DOCKER_NODE = 'Docker Node',
  S3_BUCKET = 'S3',
  DB_SERVER = 'Database Server',
  PC_VIZ = 'Private Cloud',
  DC_VIZ = 'Datacenter',
  ORG_VIZ = 'Organisation',

  AZURE_ACCOUNTS = 'Accounts',
  UNITED_PRIVATE_CLOUD_VCENTER = 'United Private Cloud vCenter',
  POD = 'POD'
}

export enum DeviceModelMapping {
  SWITCHES = 'Switch',
  FIREWALL = 'Firewall',
  LOAD_BALANCER = 'LoadBalancer',
  HYPERVISOR = 'Server',
  BARE_METAL_SERVER = 'BMServer',
  STORAGE_DEVICES = 'StorageDevice',
  MAC_MINI = 'MacDevice',
  DB_SERVER = 'DatabaseServer',
  PDU = 'PDU',
  VMWARE_VIRTUAL_MACHINE = 'VmwareVmMigration',
  VCLOUD = 'VCloudVirtualMachines',
  HYPER_V = 'HypervVM',
  ESXI = 'ESXiVM',
  OPENSTACK_VIRTUAL_MACHINE = 'OpenStackVM',
  CUSTOM_VIRTUAL_MACHINE = 'CustomVM',
  G3_KVM = 'G3 VM',
  PROXMOX = 'Proxmox VM',
  UNITED_PRIVATE_CLOUD_VCENTER = 'United Private Cloud vCenter',
}

export const UNITY_DEVICE_TYPES: UnityDeviceType[] = [
  { type: 'Switch', mapping: DeviceMapping.SWITCHES, modelMapping: DeviceModelMapping.SWITCHES },
  { type: 'Firewall', mapping: DeviceMapping.FIREWALL, modelMapping: DeviceModelMapping.FIREWALL },
  { type: 'Load Balancer', mapping: DeviceMapping.LOAD_BALANCER, modelMapping: DeviceModelMapping.LOAD_BALANCER },
  { type: 'Hypervisor', mapping: DeviceMapping.HYPERVISOR, modelMapping: DeviceModelMapping.HYPERVISOR },
  { type: 'Bare Metal Server', mapping: DeviceMapping.BARE_METAL_SERVER, modelMapping: DeviceModelMapping.BARE_METAL_SERVER },
  { type: 'Storage Device', mapping: DeviceMapping.STORAGE_DEVICES, modelMapping: DeviceModelMapping.STORAGE_DEVICES },
  { type: 'MAC Device', mapping: DeviceMapping.MAC_MINI, modelMapping: DeviceModelMapping.MAC_MINI },
  { type: 'Database Server', mapping: DeviceMapping.DB_SERVER, modelMapping: DeviceModelMapping.DB_SERVER },
  { type: 'PDU', mapping: DeviceMapping.PDU, modelMapping: DeviceModelMapping.PDU },
  { type: 'Vcenter Virtual Machines', mapping: DeviceMapping.VMWARE_VIRTUAL_MACHINE, modelMapping: DeviceModelMapping.VMWARE_VIRTUAL_MACHINE },
  { type: 'Vcloud Virtual Machines', mapping: DeviceMapping.VCLOUD, modelMapping: DeviceModelMapping.VCLOUD },
  { type: 'Hyper-V Virtual Machines', mapping: DeviceMapping.HYPER_V, modelMapping: DeviceModelMapping.HYPER_V },
  { type: 'ESXI Virtual Machines', mapping: DeviceMapping.ESXI, modelMapping: DeviceModelMapping.ESXI },
  { type: 'OpenStack Virtual Machines', mapping: DeviceMapping.OPENSTACK_VIRTUAL_MACHINE, modelMapping: DeviceModelMapping.OPENSTACK_VIRTUAL_MACHINE },
  { type: 'Custom Virtual Machines', mapping: DeviceMapping.CUSTOM_VIRTUAL_MACHINE, modelMapping: DeviceModelMapping.CUSTOM_VIRTUAL_MACHINE },
];

export enum PlatFormMapping {
  CUSTOM = 'Custom',
  VMWARE = 'VMware vCenter',
  OPENSTACK = 'Openstack',
  VCLOUD = 'vCloud Director',
  AWS = 'AWS',
  AZURE = 'Azure',
  GCP = 'GCP',
  OPENSTACKClOUD = 'OpenStack',
  PROXMOX = 'Proxmox',
  G3_KVM = 'UnitedPrivateCloud - KVM',
  HYPER_V = 'Hyper-V',
  ESXI = 'ESXi',
  UNITED_PRIVATE_CLOUD_VCENTER = 'United Private Cloud vCenter'
}

export enum ServerSidePlatFormMapping {
  CUSTOM = 'Custom',
  VMWARE = 'VMware',
  OPENSTACK = 'OpenStack',
  VCLOUD = 'vCloud Director',
  PROXMOX = 'Proxmox',
  G3_KVM = 'G3 KVM',
  HYPER_V = 'Hyperv',
  ESXI = 'ESXi',
  UNITED_PRIVATE_CLOUD_VCENTER = 'United Private Cloud vCenter',
}

export enum BMServerPlatFormMapping {
  IPMI = 'IPMI',
  DRAC = 'DRAC',
  None = 'None'
}

export enum BMServerSidePlatformMapping {
  IPMI = 'IPMI',
  DRAC = 'DRAC',
  None = 'None'
}

export enum SNMPVersionMapping {
  V1 = 'v1',
  V2C = 'v2c',
  V3 = 'v3'
}

export enum AuthLevelMapping {
  NoAuthNoPriv = 'noAuthNoPriv',
  AuthNoPriv = 'authNoPriv',
  AuthPriv = 'authPriv'
}

export enum DeviceGraphTypeMapping {
  MEMORY = 'device_ucd_memory',
  PORTS = 'device_bits',
  PROCESSOR = 'device_processor'
}

export enum FaIconMapping {
  HYPERVISOR = 'fa-server',
  VIRTUAL_MACHINE = 'fa-object-group',
  BARE_METAL_SERVER = 'fa-laptop',
  FIREWALL = 'fa-fire',
  SWITCH = 'fa-sitemap',
  LOAD_BALANCER = 'fa-balance-scale',
  KUBERNETES = 'cfa-kubernetes',
  OTHER_DEVICES = 'fa-sliders-h',
  PDU = 'fa-plug',
  SAN = 'fas fa-hdd',
  CABINET = 'fa-cube',
  ALL_DEVICES = 'fa-tasks',
  CLOUD_CONTROLLER = 'fa-gamepad',
  STORAGE_DEVICE = 'fas fa-hdd',
  MAC_MINI = 'fab fa-apple',
  MOBILE_DEVICE = 'fa-mobile-alt',
  S3_BUCKET = 'fas fa-glass-whiskey',
  DATABASE = 'fas fa-database',
  DATACENTER = 'fas fa-database',
  PRIVATE_CLOUD = 'fas fa-cloud',
  DEFAULT = 'fas fa-exclamation-triangle',
}

export function NoWhitespaceValidator(control: AbstractControl): { [key: string]: any } | null {
  if (control.value && control.value.length) {
    const isValid = !(control.value.trim().length === 0);
    return isValid ? null : { 'whitespace': true };
  }
  return null;
}

export function EmailValidator(control: AbstractControl): { [key: string]: any } | null {
  if (control.value && control.value.length) {
    const re: RegExp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const isValid = re.test(control.value);
    return isValid ? null : { 'invalidEmail': true };
  }
  return null;
}

export function MobileNumberValidator(control: AbstractControl): { [key: string]: any } | null {
  if (control.value && control.value.length) {
    const re: RegExp = /^\d+$/;
    const isValid = re.test(control.value);
    return isValid ? null : { 'invalidMobile': true };
  }
  return null;
}

export function IPAddressValidator(control: AbstractControl): { [key: string]: any } | null {
  if (control.value && control.value.length) {
    const re: RegExp = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/;
    const isValid = re.test(control.value);
    return isValid ? null : { 'invalidIPAddress': true };
  }
  return null;
}

export function MustMatch(controlName: string, matchingControlName: string) {
  return (formGroup: FormGroup) => {
    const control = formGroup.controls[controlName];
    const matchingControl = formGroup.controls[matchingControlName];
    if (matchingControl.errors && !matchingControl.errors.mustMatch) {
      // return if another validator has already found an error on the matchingControl
      return;
    }
    // set error on matchingControl if validation fails
    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ mustMatch: true });
    } else {
      matchingControl.setErrors(null);
    }
  }
}

export const AtLeastOneInputHasValue = (fields: Array<string>) => {
  return (group: FormGroup) => {
    for (const fieldName of fields) {
      if (group.get(fieldName).value) {
        return null;
      }
    }
    return { atLeastOneRequired: true };
  };
};

export enum TICKET_MGMT_TYPE {
  CRM = 'DynamicsCrm',
  JIRA = 'Jira',
  SERVICENOW = 'ServiceNow',
  ZENDESK = 'Zendesk'
}

export enum TICKET_TYPE {
  ALL = '',
  TASK = 'task',
  PROBLEM = 'problem',
  INCIDENT = 'incident',
  QUESTION = 'question'
}

export enum ZENDESK_TICKET_TYPE {
  ALL = '',
  TASK = 'task',
  PROBLEM = 'problem',
  INCIDENT = 'incident',
  QUESTION = 'question'
}

export enum SERVICE_NOW_TICKET_TYPE {
  PROBLEM = 'problem',
  INCIDENT = 'incident',
  CHANGE_REQUEST = 'change_request'
}

export enum MS_DYNAMICS_TICKET_TYPE {
  CHANGE = 'Change',
  INCIDENT = 'Incident',
  PROBLEM = 'Problem',
  QUESTION = 'Question',
  REQUEST = 'Request'
}

export enum JIRA_TICKET_TYPE {
  CHANGE = 'Change',
  INCIDENT = 'Incident',
  PROBLEM = 'Problem',
  QUESTION = 'Question',
  REQUEST = 'Request'
}

export enum DeviceStatusMapping {
  ACTIVE = 'ACTIVE',
  RUNNING = 'Running',
  PARTIALLY_RUNNING = 'Partially Running',
  PENDING = 'Pending',
  FAILED = 'Failed',
  TERMINATED = 'Terminated',
  UP = 'Up',
  up = 'up',
  DOWN = 'Down',
  down = 'down',
  UNKNOWN = 'Unknown',
  unKnown = 'unknown',
  NOT_PRESENT = 'notPresent',
  MONITORING_DISABLED = 'Monitoring Disabled'
}

export enum CRUDActionTypes {
  ADD,
  UPDATE,
  DELETE
}

export enum PDUTypes {
  HORIZONTAL = 'HORIZONTAL',
  VERTICAL = 'VERTICAL'
}

export const deviceEnvironmentOptions: string[] = [
  'Production', 'Dev', 'Test'
];

export const deviceStatusOptions: string[] = [
  'Production', 'Available'
];

export const deviceDiscoveryMethodOptions: string[] = [
  'SNMP', 'SSH'
];

export enum UnityTimeDuration {
  LAST_24_HOURS = 'last_24_hours',
  YESTERDAY = 'yesterday',
  LAST_WEEK = 'last_week',
  LAST_MONTH = 'last_month',
  LAST_YEAR = 'last_year',
  CUSTOM = 'custom',
  ACTIVE = 'active'
}

export class DateRange {
  from: string;
  to: string;
  format?: string = "YYYY-MM-DD HH:mm:ss";
}

export class MTPObjectType {
  name: string;
  key: string;
  displayName?: string;
  deviceMapping?: string;
}

export const changeTicketStatusTypes: MTPObjectType[] = [
  {
    'name': 'Open',
    'key': 'Open'
  },
  {
    'name': 'Planning',
    'key': 'Planning'
  },
  {
    'name': 'Awaiting Approval',
    'key': 'Awaiting Approval'
  },
  {
    'name': 'Approved',
    'key': 'Approved'
  },
  {
    'name': 'Scheduling',
    'key': 'Scheduling'
  },
  {
    'name': 'Implementation',
    'key': 'Implementation'
  },
  {
    'name': 'Closed',
    'key': 'Closed'
  }
]

export const incidantTicketStatusTypes = [
  {
    'name': 'New',
    'key': 'New'
  },
  {
    'name': 'Assigned',
    'key': 'Assigned'
  },
  {
    'name': 'In Progress',
    'key': 'In Progress'
  },
  {
    'name': 'Pending',
    'key': 'Pending'
  },
  // {
  //   'name': 'On Hold',
  //   'key': 'On Hold(vendor Action Required)'
  // },
  {
    'name': 'Problem Solved',
    'key': 'Problem Solved'
  },
  {
    'name': 'Close',
    'key': 'Close'
  }
]