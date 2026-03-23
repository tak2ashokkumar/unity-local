import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { NetworkInterfaceDetails } from './network-interface.type';

@Injectable({
  providedIn: 'root'
})
export class NetworkInterfaceService {

  constructor(private http: HttpClient,) { }

  getNetworkInterfaceDetails(): Observable<NetworkInterfaceDetails> {
    return this.http.get<NetworkInterfaceDetails>('customer/interface_details/?page=1&page_size=10&datacenter=af8345e6-6569-4fb6-8a1b-732e777fe7d2&datacenter=93586508-77e5-4452-abbe-cc0314459269&datacenter=a10e2b2c-f3bc-46c8-a325-6046da8f45c7&datacenter=22da9b3a-e95f-46fd-8d62-d19dfd9e1c9d&datacenter=a009e1a6-e021-4092-9cc3-0ad2e5b01bd4&datacenter=a09e0a23-db30-4a77-9d53-4f126c2b8772&item_id=1504237')
  }

  convertToNetworkInterfaceData(data:NetworkInterfaceDetails): NetworkInterfaceDetailsViewData{
    let view:NetworkInterfaceDetailsViewData = new NetworkInterfaceDetailsViewData();
    view.host = new Host();
    view.interfaceName =  data.interface_name;
    view.receive.value = data.receive.value;
    view.transmit.value = data.transmit.value;
    view.bandwidth.value = data.bandwidth.value;
    view.speed.value = data.speed.value;
    view.inboundDiscarded.value = data.inbound_discarded.value;
    view.inboundWithError.value = data.inbound_with_error.value;
    view.outboundDiscarded.value = data.outbound_discarded.value;
    view.outboundWithError.value = data.outbound_with_error.value;
    view.receive.graphId = data.receive.value;
    view.transmit.graphId = data.transmit.value;
    view.bandwidth.graphId = data.bandwidth.value;
    view.speed.graphId = data.speed.value;
    view.inboundDiscarded.graphId = data.inbound_discarded.value;
    view.inboundWithError.graphId = data.inbound_with_error.value;
    view.outboundDiscarded.graphId = data.outbound_discarded.value;
    view.outboundWithError.graphId = data.outbound_with_error.value;
    return view;
  }
}

export class NetworkInterfaceDetailsViewData {
  constructor() {}
  NetworkInterfaceDetailsLoader: string = 'NetworkInterfaceDetailsLoader'
  host: Host;
  interfaceName: string;
  interfaceItemid: string;
  receive: Receive = new Receive();
  transmit: Transmit = new Transmit();
  bandwidth: Bandwidth = new Bandwidth();
  speed: Speed = new Speed();
  inboundDiscarded: InboundDiscarded = new InboundDiscarded();
  inboundWithError: InboundWithError= new InboundWithError();
  outboundDiscarded: OutboundDiscarded = new OutboundDiscarded();
  outboundWithError: OutboundWithError = new OutboundWithError();
}
export class Host {
  constructor() {}
  name: string;
  hostId: number;
  deviceUuid: string;
  deviceType: string;
}
export class Receive {
  constructor() {}
  name: string;
  value: string;
  itemId: string;
  graphId: string;
}
export class Transmit {
  constructor() {}
  name: string;
  value: string;
  itemId: string;
  graphId: string;
}
export class Bandwidth {
  constructor() {}
  name: string;
  value: string;
  itemId: string;
  convertedValue: string;
  graphId: string;
}
export class Speed {
  constructor() {}
  name: string;
  value: string;
  itemId: string;
  converted_value: string;
  graphId: string;
}
export class InboundDiscarded {
  constructor() {}
  name: string;
  value: string;
  item_id: string;
  graphId: string;
}
export class InboundWithError {
  constructor() {}
  name: string;
  value: string;
  item_id: string;
  graphId: string;
}
export class OutboundDiscarded {
  constructor() {}
  name: string;
  value: string;
  item_id: string;
  graphId: string;
}
export class OutboundWithError {
  constructor() {}
  name: string;
  value: string;
  item_id: string;
  graphId: string;
}

