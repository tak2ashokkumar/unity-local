import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Subject, forkJoin, from, of } from 'rxjs';
import { concatMap, map, mergeMap, switchMap, toArray } from 'rxjs/operators';
import { Handle404Header } from '../app-http-interceptor';
import { AddGroupDataType, TenantByGroupType, TenatGroupType } from '../shared/SharedEntityTypes/tenant-mgmt.type';
import { GET_TENANT_BY_GROUP_UUID, GET_TENANT_GROUP } from '../shared/api-endpoint.const';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Injectable()
export class MtpTenantsMgmtService {
  private deleteAnnouncedSource = new Subject<string>();
  deleteAnnounced$ = this.deleteAnnouncedSource.asObservable();

  private tenantToggleSource = new Subject<string>();
  tenantToggleAnnounced$ = this.tenantToggleSource.asObservable();


  private tenantDetailsLoadedSource = new Subject<string>();
  tenantDetailsLoadedSourceAnnounced$ = this.tenantDetailsLoadedSource.asObservable();

  constructor(private http: HttpClient,
    private builder: FormBuilder,
    private sanitizer: DomSanitizer) { }

  deleteAnnounce() {
    this.deleteAnnouncedSource.next();
  }

  tenantDetailsLoadedAnnounce() {
    this.tenantDetailsLoadedSource.next();
  }

  tenantToggleAnnounce(uuid: string) {
    this.tenantToggleSource.next(uuid);
  }

  buildForm(group?: string) {
    return this.builder.group({
      'name': [group ? group : '', [Validators.required]],
    });
  }

  resetFormErrors() {
    return {
      'name': '',
    };
  }

  formValidationMessages = {
    'name': {
      'required': 'Name is Mandatory'
    }
  }

  saveGroup(data: AddGroupDataType, groupId?: string) {
    if (groupId) {
      return this.http.put(`/customer/mtp/mtpgroup/${groupId}/`, data);
    } else {
      return this.http.post(GET_TENANT_GROUP(), data);
    }
  }

  deleteGroup(groupId: string) {
    return this.http.delete(`/customer/mtp/mtpgroup/${groupId}/`)
  }

  private convertToGroupViewdata(d: TenatGroupType): TenantGroupViewData {
    let a = new TenantGroupViewData();
    a.id = d.id;
    a.uuid = d.uuid;
    a.name = d.name;
    a.isOpen = false;
    return a;
  }

  private getTenants(group: TenantGroupViewData) {
    return this.http.get<TenantByGroupType[]>(GET_TENANT_BY_GROUP_UUID(group.uuid), { headers: Handle404Header });
  }

  private buildTenantLogo(logo: string): SafeUrl | null {
    const trimmedLogo = logo ? logo.trim() : '';

    if (!trimmedLogo) {
      return null;
    }

    const logoSource = trimmedLogo.includes('data:image') ? trimmedLogo : `data:image/png;base64,${trimmedLogo}`;
    return this.sanitizer.bypassSecurityTrustUrl(logoSource);
  }

  getFirstTenantGroups(uuid?: string) {
    const params = new HttpParams().set('page_size', '0');

    return this.http.get<TenatGroupType[]>(GET_TENANT_GROUP(), { params }).pipe(
      switchMap((groups = []) => {
        if (!groups.length) return of([]);

        const viewDataList = groups.map(g => this.convertToGroupViewdata(g));
        const targetGroup = viewDataList.find(g => g.uuid === uuid) || viewDataList[0];
        targetGroup.isTenantsLoading = true;

        return this.getTenants(targetGroup).pipe(
          map(res => {
            (res || []).forEach(t => {
              t.logo = this.buildTenantLogo(t._logo);
            });
            targetGroup.tenants = res;
            targetGroup.isTenantsLoading = false;

            return viewDataList;
          })
        );
      })
    );
  }



  populateRemainingTenants(viewDataList: TenantGroupViewData[], skipUuid?: string) {
    if (!viewDataList || viewDataList.length <= 1) {
      return of(viewDataList);
    }

    let groupsToPopulate: TenantGroupViewData[] = [];
    let skippedGroups: TenantGroupViewData[] = [];

    if (skipUuid) {
      // Skip the group with matching UUID
      groupsToPopulate = viewDataList.filter(group => group.uuid !== skipUuid);
      skippedGroups = viewDataList.filter(group => group.uuid === skipUuid);
    } else {
      // Skip the first group
      groupsToPopulate = viewDataList.slice(1);
      skippedGroups = [viewDataList[0]];
    }

    return from(groupsToPopulate).pipe(
      concatMap(viewData =>
        this.getTenants(viewData).pipe(
          map((res: TenantByGroupType[]) => {
            if (res) {
              res.forEach(t => {
                t.logo = this.buildTenantLogo(t._logo);
              });
              viewData.tenants = res;
            }
            viewData.isTenantsLoading = false;
            return viewData;
          })
        )
      ),
      toArray(),
      map(updatedGroups => {
        // Preserve original order
        const combined = [...skippedGroups, ...updatedGroups].sort(
          (a, b) => viewDataList.findIndex(g => g.id === a.id) - viewDataList.findIndex(g => g.id === b.id)
        );
        return combined;
      })
    );
  }


  populateSingleTenantGroup(groups: TenantGroupViewData[], uuid: string) {
    const targetIndex = groups.findIndex(g => g.uuid === uuid);
    if (targetIndex === -1) {
      return of(groups);
    }

    // Clone the groups to avoid mutating original
    const updatedGroups = [...groups];
    const targetGroup = { ...updatedGroups[targetIndex] };
    updatedGroups[targetIndex] = targetGroup;

    return this.getTenants(targetGroup).pipe(
      map((res: TenantByGroupType[]) => {
        if (res) {
          res.forEach(t => {
            t.logo = this.buildTenantLogo(t._logo);
          });
          targetGroup.tenants = res;
        }
        targetGroup.isTenantsLoading = false;
        updatedGroups[targetIndex] = targetGroup;
        return updatedGroups;
      })
    );
  }
}


export class TenantGroupViewData {
  id: number;
  uuid: string;
  name: string;
  icon: string;
  isOpen: boolean;
  deleteButtonEnabled: boolean;
  deleteButtonTooltipMessage: string;
  isTenantsLoading: boolean = true;
  tenants: TenantByGroupType[] = [];
}
