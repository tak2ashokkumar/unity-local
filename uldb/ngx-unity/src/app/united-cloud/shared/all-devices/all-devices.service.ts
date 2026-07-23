import { Observable } from 'rxjs';
import { PRIVATE_CLOUD_BY_ID, PRIVATE_CLOUD_CONTAINERS_PODS, PRIVATE_CLOUD_STORAGE, DEVICE_LIST_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { KubernetesPodType } from 'src/app/shared/SharedEntityTypes/kubernetes-pod.type';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { StorageDevice } from '../entities/storage-device.type';
import { MacMini } from '../entities/mac-mini.type';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';

@Injectable()
export class AllDevicesService {

    constructor(private http: HttpClient) { }

    getPrivateCloud(pcId: string): Observable<PrivateCloud> {
        return this.http.get<PrivateCloud>(PRIVATE_CLOUD_BY_ID(pcId));
    }

    getPods(pcId: string) {
        const params = new HttpParams().set('page_size', '1').set('page', '1');
        return this.http.get<PaginatedResult<KubernetesPodType>>(PRIVATE_CLOUD_CONTAINERS_PODS(pcId), { params: params });
    }

    getStorageDevices(pcId: string) {
        const params = new HttpParams().set('page_size', '1').set('page', '1');
        return this.http.get<PaginatedResult<StorageDevice>>(PRIVATE_CLOUD_STORAGE(pcId), { params: params });
    }

    getMacMinis(pcId: string): Observable<PaginatedResult<MacMini>> {
        const params = new HttpParams().set('page_size', '1').set('page', '1').set('uuid', pcId);
        return this.http.get<PaginatedResult<MacMini>>(DEVICE_LIST_BY_DEVICE_TYPE(DeviceMapping.MAC_MINI), { params: params });
    }

    totalDevicesCount(cloud: PrivateCloud) {
        let count = 0;
        count = cloud.load_balancer.length +
            cloud.firewall.length +
            cloud.switch.length +
            cloud.bm_server.length +
            cloud.hypervisors.length +
            cloud.vms_count +
            cloud.customdevice.length;
        return count;
    }

}