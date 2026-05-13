export type CollectionResourceId = string | number;

export interface GroupOption {
  id: CollectionResourceId;
  uuid: string;
  name: string;
}

export interface RoleOption {
  id: CollectionResourceId;
  uuid: string;
  name: string;
}

export interface DashboardItem {
  id: CollectionResourceId;
  uuid: string;
  name: string;
  source: 'default' | 'personal';
  checked: boolean;
  image_url?: string;
  description?: string;
  type?: string;
  status?: string;
  refresh_interval_in_sec?: number;
  refresh?: boolean;
  timeframe?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  is_default?: boolean;
  defaultDashboardRoute?: string;
}

export interface CollectionDashboardPayload {
  id: CollectionResourceId;
  order: number;
}

export interface CollectionFormPayload {
  name: string;
  description: string;
  status: 'draft' | 'published';
  dashboards: CollectionDashboardPayload[];
  roles: CollectionResourceId[];
  groups: CollectionResourceId[];
}

export interface CollectionDetailResponse {
  uuid?: string;
  name: string;
  description?: string;
  status: 'draft' | 'published';
  dashboards?: any[];
  roles?: any[];
  groups?: any[];
  dashboard_ids?: any[];
  user_roles?: any[];
  user_groups?: any[];
  image_url?: string;
}
