import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BuildingBlockDataType, DropdownViewType, NgSelectDropdownData, NgSelectDropdownType } from '../unity-setup-finops.type';

@Injectable()
export class UsfCrudService {

    constructor(private http: HttpClient) { }

    getDropdownData(): Observable<DropdownViewType> {
        return this.http.get<any>(`/customer/finops/dropdown_values/`);
    }

    getBuildingBlockDetails(uuid : string): Observable<BuildingBlockDataType> {
        return this.http.get<BuildingBlockDataType>(`/customer/finops/building_blocks/${uuid}/`);
    }

    convertDropdownData(data: DropdownViewType): NgSelectDropdownType {
        const obj = new NgSelectDropdownData();
        Object.keys(data).forEach((key: string) => {
            obj[key] = data[key].dropdown_values;
        });
        return obj;
    }

    updateFields(fields: any) {
        return this.http.patch(`/customer/finops/dropdown_values/update_values/`, fields);
    }

    create(data: any): Observable<BuildingBlockDataType> {
        return this.http.post<BuildingBlockDataType>(`/customer/finops/building_blocks/`, data);
    }

    update(data: any, uuid: string): Observable<BuildingBlockDataType> {
        return this.http.patch<BuildingBlockDataType>(`/customer/finops/building_blocks/${uuid}/`, data);
    }

}

export const stepsConst = [
    { label: 'Basic Details', icon: 'fas fa-cog', active: true, disabled: false, valid: false, form: 'basic' },
    { label: 'FINOPs Components', icon: 'fas fa-rocket', active: false, disabled: true, valid: false, form: 'components' },
    // { label: 'Functional Components', icon: 'fas fa-rocket', active: false, disabled: true, valid: false , form: 'functional'},
    // { label: 'Dynamic Components', icon: 'fas fa-globe' ,active: false, disabled: true, valid: false},
    // { label: 'Operational Components', icon: 'fas fa-code', active: false, disabled: true, valid: false , form: 'operational'},
    // { label: 'Fixed Components', icon: 'fas fa-wrench' ,active: false, disabled: true, valid: false},
    // { label: 'Service Availability', icon: 'fas fa-users' ,active: false, disabled: true, valid: false}
];