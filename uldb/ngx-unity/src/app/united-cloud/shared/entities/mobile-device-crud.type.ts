import { TagDevice } from '../../assets/assets-mobile-device/assets-mobile-device-crud/assets-mobile-device-crud.service';
import { DatacenterInDevice } from 'src/app/shared/SharedEntityTypes/datacenter.type';

export interface MobileDevice {
    url: string;
    id: number;
    uuid: string;
    name: string;
    serial_number: string;
    device_type: string;
    platform: string;
    model: string;
    ip_address: string;
    device_tagged: TagDevice;
    tags: string[];
    datacenter: DatacenterInDevice;
    collector: CollectorType;
    custom_attribute_data?: { [key: string]: any }
}

export interface CollectorType {
    name: string;
    uuid: string;
}