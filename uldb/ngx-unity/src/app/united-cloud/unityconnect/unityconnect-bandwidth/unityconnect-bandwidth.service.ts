import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { GET_SWITCH_PORTS_FAST, GET_SWITCH_PORT_DETAILS } from 'src/app/shared/api-endpoint.const';
import { SwitchPort } from './switch-ports.type';

@Injectable()
export class UnityconnectBandwidthService {

  constructor(private http: HttpClient) { }

  getSwitchPorts(): Observable<SwitchPort[]> {
    return this.http.get<SwitchPort[]>(GET_SWITCH_PORTS_FAST());
  }

  getPortDetails(switchPort: SwitchPort): Observable<Map<string, PortsObj>> {
    return this.http.get<PortsObj>(GET_SWITCH_PORT_DETAILS(switchPort.device_uuid))
      .pipe(
        map((res: PortsObj) => {
          return new Map<string, PortsObj>().set(switchPort.device_uuid, res)
        }),
        catchError((error: HttpErrorResponse) => {
          return of(new Map<string, PortsObj>().set(switchPort.device_uuid, null));
        })
      );
  }

  convertToPortsViewData(switchId: string, switchPortName: string, res: PortsObj): PortsViewData[] {
    const ports = Object.values(res.ports);
    let viewData: PortsViewData[] = [];
    ports.map(p => {
      let a: PortsViewData = new PortsViewData;
      a.portId = p.port_id;
      a.switchId = switchId;
      a.name = switchPortName;
      a.entityName = p.entity_name;
      a.entityDescription = p.entity_descr;
      let portAddresses: string[] = [];
      p.addresses.map((portAddress: AddressesItem) => {
        portAddresses.push(portAddress.ipv4_network);
      });
      a.portAddresses = portAddresses;

      a.inRate = p.in_rate;
      a.bpsInStyle = p.bps_in_style;
      a.outRate = p.out_rate;
      a.bpsOutStyle = p.bps_out_style;
      a.ifInUcastPktsRate = p.ifInUcastPkts_rate;
      a.ppsInStyle = p.pps_in_style;
      a.ifOutUcastPktsRate = p.ifOutUcastPkts_rate;
      a.ppsOutStyle = p.pps_out_style;

      a.humanType = p.human_type;
      a.humanSpeed = p.human_speed;
      a.ifMtu = p.ifMtu;
      a.humanMACAddress = p.human_mac;
      a.ifLastChange = p.ifLastChange;
      viewData.push(a);
    })
    return viewData;
  }

}

export class PortsViewData {
  portId: string;
  switchId: string;
  name?: string;
  entityName?: string;
  entityDescription?: string;
  portAddresses?: string[];

  inRate?: number;
  bpsInStyle?: string;
  outRate?: number;
  bpsOutStyle?: string;
  ifInUcastPktsRate?: string;
  ppsInStyle?: string;
  ifOutUcastPktsRate?: string;
  ppsOutStyle?: string;

  humanType?: string;
  humanSpeed?: string;
  ifMtu?: string;
  humanMACAddress?: string;
  ifLastChange?: string;
  constructor() { }
} 
