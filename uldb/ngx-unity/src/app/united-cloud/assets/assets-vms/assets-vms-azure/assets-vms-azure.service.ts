import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { GET_AZURE_VMS, POWER_TOGGLE_AZURE_VMS, DELETE_AZURE_VMS } from 'src/app/shared/api-endpoint.const';
import { PowerToggleInput } from 'src/app/united-cloud/shared/server-power-toggle/server-power-toggle.service';
import { DeviceMapping } from 'src/app/shared/app-utility/app-utility.service';
import { CeleryTask } from 'src/app/shared/SharedEntityTypes/celery-task.type';
import { take, switchMap } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { TaskStatus } from 'src/app/shared/SharedEntityTypes/task-status.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Injectable()
export class AssetsVmsAzureService {

  constructor(private http: HttpClient,
    private appService: AppLevelService,
    private notification: AppNotificationService) { }

  getVms(): Observable<AzureVm[]> {
    return this.http.get<AzureVm[]>(GET_AZURE_VMS());
    // return of(MockAzure);
  }

  convertToViewData(vms: AzureVm[]): AzureVMViewData[] {
    let viewData: AzureVMViewData[] = [];
    vms.map(vm => {
      let data = new AzureVMViewData();
      data.name = vm.name;
      data.type = vm.type;
      data.id = vm.account_id;
      data.accountName = vm.account_name;
      data.location = vm.location;
      data.resource = vm.resource_group;
      data.availabilitySet = vm.availability_set ? vm.availability_set : 'N/A';
      data.powerStatus = vm.power_state === 'VM stopped' ? 'Down' : 'Up';
      data.powerStatusOn = vm.power_state === 'VM stopped' ? false : true;
      data.powerTooltipMessage = vm.power_state === 'VM stopped' ? 'Power On' : 'Power Off';
      viewData.push(data);
    });
    return viewData;
  }

  getToggleInput(view: AzureVMViewData): AzurePowerToggleInput {
    return {
      confirmTitle: 'Azure Virtual Machine', confirmMessage: 'Are you sure you want to continue with this action?',
      deviceName: view.name, deviceId: view.id + '',
      currentPowerStatus: view.powerStatusOn, deviceType: DeviceMapping.AZURE_VIRTUAL_MACHINE, userName: '',
      power_state: view.powerStatusOn ? 'powerOff' : 'start', resource_group: view.resource, vm_name: view.name
    };
  }

  togglePower(input: AzurePowerToggleInput): Observable<TaskStatus> {
    return this.http.post<CeleryTask>(POWER_TOGGLE_AZURE_VMS(), { power_state: input.power_state, resource_group: input.resource_group, vm_name: input.vm_name })
      .pipe(switchMap(res => {
        if (res.task_id) {
          const msg = input.currentPowerStatus ? 'power off ' : 'power on ';
          this.notification.success(new Notification('Request to ' + msg + ' submitted'));
          return this.appService.pollForTask(res.task_id, 2, 20).pipe(take(1))
        } else {
          throw new Error('Something went wrong');
        }
      }), take(1));
  }

  getDeleteInput(view: AzureVMViewData): AzurePowerToggleInput {
    let inp = this.getToggleInput(view);
    inp.confirmMessage = 'Are you sure to delete this VM?'
    return inp;
  }

  deleteVM(input: AzurePowerToggleInput): Observable<TaskStatus> {
    return this.http.post<CeleryTask>(DELETE_AZURE_VMS(), { power_state: input.power_state, resource_group: input.resource_group, vm_name: input.vm_name })
      .pipe(switchMap(res => {
        if (res.task_id) {
          this.notification.success(new Notification('Delete request for Virtual machine submitted'));
          return this.appService.pollForTask(res.task_id, 2, 20).pipe(take(1))
        } else {
          throw new Error('Something went wrong');
        }
      }), take(1));
  }
}

export class AzureVMViewData {
  name: string;
  type: string;
  id: number;
  location: string;
  resource: string;
  accountName: string;
  availabilitySet: string;
  powerStatus: string;
  powerStatusOn: boolean;
  powerTooltipMessage: string;
  powerStatusIcon: 'fa-power-off' | 'fa-spinner fa-spin' = 'fa-power-off';

  constructor() { }
}
export interface AzurePowerToggleInput extends PowerToggleInput {
  power_state: string;
  resource_group: string;
  vm_name: string;
  account_uuid?: string;
}

export interface AzurePowerToggleInputVM extends PowerToggleInput {
  power_state: string;
  resource_group: string;
  vm_name: string;
  account_uuid: string;
  username: string;
  password: string
}
export const MockAzure: AzureVm[] = [{ "account_id": 10, "resource_group": "second_account", "provisioning_state": "Succeeded", "plan": null, "account_name": "testing", "availability_set": null, "name": "testvm007", "network_profile": [{ "id": "testvm007441", "primary": null }], "location": "centralus", "power_state": "VM stopped", "license_type": null, "type": "Microsoft.Compute/virtualMachines" }, { "account_id": 10, "resource_group": "second_account", "provisioning_state": "Succeeded", "plan": null, "account_name": "testing", "availability_set": "UNITY-AVAILIBILITY-SET", "name": "unity-monitoring-server", "network_profile": [{ "id": "unity-monitoring-ser539", "primary": null }], "location": "centralus", "power_state": "VM running", "license_type": null, "type": "Microsoft.Compute/virtualMachines" }];