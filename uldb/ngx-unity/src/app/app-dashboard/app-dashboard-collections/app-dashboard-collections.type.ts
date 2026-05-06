export interface CuratedCollection {
  id?: string | number;
  uuid: string;
  name: string;
  description?: string;
  roles?: any[];
  groups?: any[];
  user_roles?: any[];
  user_groups?: any[];
  dashboards?: any[];
  dashboard_ids?: any[];
  created_by?: any;
  updated_at?: string;
  modified_at?: string;
  applicable_module_permissions?: any[];
  status: 'draft' | 'published';
}

export class CuratedCollectionViewData {
  collectionId: string;
  name: string;
  primaryRole: string;
  extraRolesCount: number;
  primaryGroup: string;
  extraGroupsCount: number;
  userRoles: string[];
  userGroups: string[];
  createdBy: string;
  lastModified: string;
  status: string;
  applicableModulePermissions: any[];
}
