interface PortsObj {
    ports: Ports;
}
interface Ports {
    [key: string]: PortDetails;
}
interface PortDetails {
    ifErrors_rate: string;
    encrypted: string;
    disabled: string;
    ifMtu: string;
    ifInDiscards: string;
    entity_name: string;
    ifVlan: null;
    in_rate: number;
    ifPromiscuousMode: string;
    pps_in_style: string;
    ifInOctets: string;
    humanized: boolean;
    bps_in_style: string;
    ifLastChange: string;
    ifPhysAddress: string;
    admin_status: string;
    port_descr_speed: null;
    ifOutErrors: string;
    out_rate: number;
    port_label: string;
    ifInErrors_rate: string;
    ifInUcastPkts_rate: string;
    bps_out_style: string;
    ignore: string;
    port_label_num: string;
    ifOutOctets: string;
    human_type: string;
    ifType: string;
    device_uuid: null;
    entity_descr: string;
    ifConnectorPresent: string;
    entity_shortname: string;
    ifInNUcastPkts_rate: string;
    port_label_base: string;
    poll_time: string;
    ifInErrors_delta: string;
    ifUcastPkts_rate: string;
    row_class: string;
    port_descr_notes: null;
    ifOutUcastPkts_rate: string;
    ifDiscards_rate: string;
    poll_period: string;
    deleted: string;
    port_64bit: string;
    ifOutNUcastPkts: string;
    ifInBroadcastPkts: string;
    ifOutErrors_delta: string;
    ifVrf: null;
    attribs: any[];
    ifInMulticastPkts: string;
    addresses: AddressesItem[];
    ifOutBroadcastPkts: string;
    table_tab_colour: string;
    ifOutErrors_rate: string;
    ifName: string;
    ifOutOctets_rate: string;
    port_label_short: string;
    human_mac: string;
    ifInErrors: string;
    ifOutOctets_perc: string;
    port_descr_descr: null;
    device_id: string;
    ifInDiscards_rate: string;
    port_descr_circuit: null;
    ifOutUcastPkts: string;
    ifOutDiscards_rate: string;
    ifIndex: string;
    ifInOctets_perc: string;
    ifInMulticastPkts_rate: string;
    ifAdminStatus: string;
    detailed: string;
    icon: string;
    ifOutMulticastPkts: string;
    ifTrunk: null;
    ifHardType: null;
    ifDuplex: string;
    ifOutDiscards: string;
    port_id: string;
    ifOutBroadcastPkts_rate: string;
    port_mcbc: string;
    ifAlias: string;
    ifDescr: string;
    pps_out_style: string;
    ifOperStatus: string;
    html_class: string;
    ifInUcastPkts: string;
    ifInOctets_rate: string;
    ifOutNUcastPkts_rate: string;
    human_speed: string;
    ifOutMulticastPkts_rate: string;
    ifSpeed: string;
    ifInBroadcastPkts_rate: string;
    port_descr_type: null;
    ifOctets_rate: string;
    ifHighSpeed: string;
    ifInNUcastPkts: string;
}
interface AddressesItem {
    ipv4_prefixlen: string;
    ipv4_address: string;
    ipv4_network: string;
    ipv4_address_id: string;
    ifIndex: string;
    ipv4_network_id: string;
    port_id: string;
    device_id: string;
}


interface PortGraphs {
    port_errors_graph: string;
    port_upkts_graph: string;
    port_bits_graph: string;
}

