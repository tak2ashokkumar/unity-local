import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NoWhitespaceValidator } from 'src/app/shared/app-utility/app-utility.service';
import { CollectionDetailResponse, CollectionFormPayload, DashboardItem, GroupOption, RoleOption } from './app-dashboard-collections-crud.type';

@Injectable()
export class AppDashboardCollectionsCrudService {
  private readonly collectionEndpoint = '/customer/collections/';

  constructor(private http: HttpClient,
    private builder: FormBuilder) { }

  buildForm(data?: CollectionDetailResponse, groups: GroupOption[] = [], roles: RoleOption[] = []): FormGroup {
    let form: FormGroup;
    if (data) {
      form = this.builder.group({
        name: [data && data.name ? data.name : '', [Validators.required, NoWhitespaceValidator]],
        description: [data && data.description ? data.description : ''],
        groups: [this.getSelectedOptions(groups, data, 'groups', 'user_groups')],
        roles: [this.getSelectedOptions(roles, data, 'roles', 'user_roles')],
        status: [data && data.status ? data.status : 'draft', [Validators.required, NoWhitespaceValidator]]
      });
    } else {
      form = this.builder.group({
        name: ['', [Validators.required, NoWhitespaceValidator]],
        description: [''],
        groups: [[]],
        roles: [[]],
        status: ['draft', [Validators.required, NoWhitespaceValidator]]
      });
    }
    form.setValidators(accessScopeValidator());
    form.updateValueAndValidity();
    return form;
  }

  resetFormErrors() {
    return {
      name: '',
      status: '',
      access_scope: '',
      dashboards: ''
    };
  }

  formValidationMessages = {
    name: {
      required: 'Name is required'
    },
    status: {
      required: 'Status is required'
    }
  };

  getGroups(): Observable<GroupOption[]> {
    return this.http.get<any[]>(`/customer/rbac/user_groups/?page_size=0`).pipe(
      map(res => (res || []).map(g => ({ id: g.id, uuid: g.uuid, name: g.name })))
    );
  }

  getRoles(): Observable<RoleOption[]> {
    return this.http.get<any[]>(`/customer/rbac/roles/?page_size=0`).pipe(
      map(res => (res || []).map(r => ({ id: r.id, uuid: r.uuid, name: r.name })))
    );
  }

  getDefaultDashboards(): Observable<DashboardItem[]> {
    return this.http.get<any[]>(`/customer/dashboards/?type=preset&page_size=0`).pipe(
      map(res => (res || []).map((d: any) => ({
        id: d.id, uuid: d.uuid, name: d.name, source: 'default' as const, checked: false
      })))
    );
  }

  getMyDashboards(): Observable<DashboardItem[]> {
    return this.http.get<any[]>(`/customer/persona/dashboards/?page_size=0`).pipe(
      map(res => (res || [])
        .filter((d: any) => d.status === 'published')
        .map((d: any) => ({
          id: d.id, uuid: d.uuid, name: d.name, source: 'personal' as const, checked: false
        }))
      )
    );
  }

  getCollection(uuid: string): Observable<CollectionDetailResponse | null> {
    return this.http.get<CollectionDetailResponse>(`${this.collectionEndpoint}${uuid}/`);
  }

  createCollection(payload: CollectionFormPayload): Observable<any> {
    return this.http.post(this.collectionEndpoint, payload);
  }

  updateCollection(uuid: string, payload: CollectionFormPayload): Observable<any> {
    return this.http.put(`${this.collectionEndpoint}${uuid}/`, payload);
  }

  convertToPayload(data: any, selectedDashboards: DashboardItem[]): CollectionFormPayload {
    return {
      name: data.name,
      description: data.description || '',
      status: data.status,
      dashboards: (selectedDashboards || []).map((dashboard, index) => ({
        id: dashboard.id,
        order: index
      })),
      roles: (data.roles || []).map((role: RoleOption) => role.id),
      groups: (data.groups || []).map((group: GroupOption) => group.id)
    };
  }

  getSelectedDashboards(collection: CollectionDetailResponse, dashboards: DashboardItem[]): DashboardItem[] {
    const selectedItems = this.getSelectedCollectionItems(collection, 'dashboards', 'dashboard_ids');
    return this.getSelectedOptions(dashboards || [], collection, 'dashboards', 'dashboard_ids')
      .map((dashboard, index) => ({
        dashboard,
        order: this.getSelectedItemOrder(dashboard, selectedItems, index)
      }))
      .sort((a, b) => a.order - b.order)
      .map(item => ({ ...item.dashboard, checked: false }));
  }

  private getSelectedOptions<T extends GroupOption | RoleOption | DashboardItem>(
    options: T[], collection: CollectionDetailResponse, apiKey: string, legacyKey: string
  ): T[] {
    const selectedItems = this.getSelectedCollectionItems(collection, apiKey, legacyKey);
    return (options || []).filter(option => this.isOptionSelected(option, selectedItems));
  }

  private getSelectedCollectionItems(collection: CollectionDetailResponse, apiKey: string, legacyKey: string): any[] {
    const source = collection as any;
    return source?.[apiKey] || source?.[legacyKey] || [];
  }

  private isOptionSelected(option: GroupOption | RoleOption | DashboardItem, selectedItems: any[]): boolean {
    const optionValues = this.getOptionCompareValues(option);
    return (selectedItems || []).some(item => {
      return this.getSelectedItemCompareValues(item).some(value => optionValues.indexOf(value) !== -1);
    });
  }

  private getSelectedItemOrder(option: DashboardItem, selectedItems: any[], fallbackOrder: number): number {
    const selectedItem = (selectedItems || []).find(item => this.isOptionSelected(option, [item]));
    const order = Number(selectedItem?.order);
    return isNaN(order) ? 999999 + fallbackOrder : order;
  }

  private getOptionCompareValues(option: GroupOption | RoleOption | DashboardItem): string[] {
    return [option.uuid, (option as any).id, option.name]
      .filter(value => value !== undefined && value !== null)
      .map(value => value.toString());
  }

  private getSelectedItemCompareValues(item: any): string[] {
    if (typeof item === 'string' || typeof item === 'number') {
      return [item.toString()];
    }

    const values = [
      item?.uuid,
      item?.id,
      item?.name,
      item?.dashboard_id,
      item?.dashboard_uuid,
      item?.dashboard?.uuid,
      item?.dashboard?.id,
      item?.dashboard?.name
    ];

    return values
      .filter(value => value !== undefined && value !== null)
      .map(value => value.toString());
  }
}

function accessScopeValidator(): ValidatorFn {
  return (control: AbstractControl) => {
    const groups = control.get('groups')?.value || [];
    const roles = control.get('roles')?.value || [];
    const hasGroups = groups.length > 0;
    const hasRoles = roles.length > 0;

    if (!hasGroups && !hasRoles) {
      return { accessScopeRequired: true };
    }
    if (hasGroups && hasRoles) {
      return { accessScopeExclusive: true };
    }
    return null;
  };
}
