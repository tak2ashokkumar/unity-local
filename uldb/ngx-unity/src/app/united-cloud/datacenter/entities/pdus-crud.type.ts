import { DataCenterCustomersItem, DataCenterCabinetType, DataCenterColocloudSetItem } from '../../shared/entities/datacenter-cabinet.type';

/**
 * DropDowns for PDU Model and Cabinets
 */

export interface PDUCRUDModel {
    url:string;
    id: number;
    model_number: string;
    max_amps: number;
    num_outlets: number;
    outlet_type: string;
    input_voltage: number;
    output_voltage: number
}

export interface PDUCRUDCabinet {
    url: string;
    id: number;
    uuid: string;
    name: string;
    type: string;
    available_size: string;
    customers: DataCenterCustomersItem[];
    cabinet_type: DataCenterCabinetType;
    cage: any;
    model: string;
    colocloud_set: DataCenterColocloudSetItem[];
    size: number;
    capacity: number;
}

export interface PDUCRUDPowerCircuit {
    url:string;
    id: number;
    name: string;
    full_name: string;
    assettag:string;
    datacenter: string;
    customer:string;
    panel:string;
    circuit:string;
    ampstype:string;
    outlettype:string
    voltagetype:string;
    salesforce_id:string;
}