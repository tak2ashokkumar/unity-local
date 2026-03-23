import { Injectable } from '@angular/core';
import { DeviceMapping, ServerSidePlatFormMapping, AppUtilityService, PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { HttpClient } from '@angular/common/http';
import { DEVICE_LIST_BY_DEVICE_TYPE } from 'src/app/shared/api-endpoint.const';
import { Observable } from 'rxjs';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';
import { SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { TableApiServiceService } from 'src/app/shared/table-functionality/table-api-service.service';
import { UserInfoService } from 'src/app/shared/user-info.service';
import { MANAGEMENT_NOT_ENABLED_MESSAGE } from 'src/app/app-constants';

@Injectable()
export class CloudControllersService {
  constructor(private tableService: TableApiServiceService,
    private user: UserInfoService,
    private utilService: AppUtilityService) { }

  getCloudControllers(criteria: SearchCriteria): Observable<PaginatedResult<CloudController>> {
    return this.tableService.getData<PaginatedResult<CloudController>>(DEVICE_LIST_BY_DEVICE_TYPE(DeviceMapping.CLOUD_CONTROLLER), criteria);
  }

  convertToViewData(data: CloudController[]): CloudControllerViewData[] {
    let viewData: CloudControllerViewData[] = [];
    data.map(s => {
      let a: CloudControllerViewData = new CloudControllerViewData();
      a.name = s.name;
      a.platformType = this.utilService.getCloudTypeByPlatformType(s.platform_type);
      a.hypervisors = s.hypervisors.length;
      a.uuid = s.uuid;
      if (this.user.isManagementEnabled || a.platformType != PlatFormMapping.CUSTOM) {
        if (s.proxy.proxy_fqdn) {
          a.isSameTabEnabled = (s.proxy.same_tab && s.proxy.proxy_fqdn) ? true : false;
          a.sameTabWebAccessUrl = s.proxy.proxy_fqdn;
          a.sameTabTootipMessage = s.proxy.same_tab ? 'Manage in Same Tab' : 'Non Managable In Same Tab';

          a.isNewTabEnabled = true;
          a.newTabWebAccessUrl = s.proxy.proxy_fqdn;
          a.newTabTootipMessage = 'Manage in New Tab';
        } else {
          a.isSameTabEnabled = false;
          a.isNewTabEnabled = false;
          a.sameTabTootipMessage = 'Non Manageable Controller';
          a.newTabTootipMessage = 'Non Manageable Controller';
        }
      } else {
        a.isSameTabEnabled = false;
        a.isNewTabEnabled = false;
        a.sameTabTootipMessage = MANAGEMENT_NOT_ENABLED_MESSAGE();
        a.newTabTootipMessage = MANAGEMENT_NOT_ENABLED_MESSAGE();
      }
      viewData.push(a);
    });
    return viewData;
  }
}

export class CloudControllerViewData {
  name: string;
  platformType: PlatFormMapping;
  hypervisors: number;
  uuid: string;

  isSameTabEnabled: boolean;
  sameTabWebAccessUrl: string;
  sameTabTootipMessage: string;
  isNewTabEnabled: boolean;
  newTabWebAccessUrl: string;
  newTabTootipMessage: string;

  constructor() { }
}