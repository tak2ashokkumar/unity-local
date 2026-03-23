export interface UnitedConnectNetworkBill {
    uuid: string;
    bill_name: string;
    bill_type: string;
    allowed: string;
    cost_per_mb: number;
    description: string;
    mapped_ports: UnitedConnectNetworkBillMappedPorts[];
    details: UnitedConnectNetworkBillData;
}

export interface UnitedConnectNetworkBillMappedPorts {
    uuid: string;
    mapped_name: string;
}

// export interface UnitedConnectNetworkBillData {
//     fee_amount: number;
//     last_calculated: string;
//     period: string;
//     '95th': UnitedConnectNetworkBillDataPercentile;
//     average: UnitedConnectNetworkBillDataAverage;
// }

// export interface UnitedConnectNetworkBillDataAverage {
//     inbound: number;
//     used: number;
//     outbound: number;
// }

// export interface UnitedConnectNetworkBillDataPercentile {
//     used: number;
//     outbound: number;
//     inbound: number;
//     used_percentage: number;
//     allowed: number;
//     overusage: number;
// }

export interface UnitedConnectNetworkBillData {
    id: number;
    start_date: string;
    end_date: string;
    last_calculated: string;
    fee: number;
    inbound_95th: number;
    outbound_95th: number;
    allowed_95th: number;
    user_95th: number;
    overusage_95th: number;
    used_percentage_95th: number;
    inbound_average: number;
    outbound_average: number;
    used_average: number;
    billing: number;
}
