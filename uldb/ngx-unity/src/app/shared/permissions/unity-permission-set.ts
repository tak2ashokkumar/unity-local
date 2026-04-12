import { UnityModules } from './unity-modules';

export { UnityModules } from './unity-modules';

export const getUnityViewPermissionName = (module: UnityModules | string): string => {
  return module == UnityModules.TICKET_MANAGEMENT ? `View Tickets` :
    module == UnityModules.USER_MANAGEMENT ? `View Users` : `View ${module}`;
};

export const getUnityManagePermissionName = (module: UnityModules | string): string => {
  return module == UnityModules.TICKET_MANAGEMENT ? `Manage Tickets` :
    module == UnityModules.USER_MANAGEMENT ? `Manage Users` : `Manage ${module}`;
};

export class UnityPermissionSet {
  private module: UnityModules;
  private permissions: string[];
  subTaskView?: boolean;
  subTaskManage?: boolean;

  constructor(module: UnityModules, permissions: string[] = []) {
    this.module = module;
    this.permissions = permissions || [];
  }

  get modulePermissionSet() {
    return this.module ? this.permissions : [];
  }

  get moduleViewPermission() {
    return getUnityViewPermissionName(this.module);
  }

  get moduleManagePermission() {
    return getUnityManagePermissionName(this.module);
  }

  get view() {
    if (this.module && this.modulePermissionSet) {
      return this.modulePermissionSet.includes(this.moduleViewPermission);
    } else {
      return false;
    }
  }

  get manage() {
    if (this.module && this.modulePermissionSet) {
      return this.modulePermissionSet.includes(this.moduleManagePermission);
    } else {
      return false;
    }
  }

  set subTaskViewPermission(task: string) {
    if (this.module && this.modulePermissionSet) {
      if (task == 'Order Catalog') {
        this.subTaskView = this.modulePermissionSet.includes(`${task}`);
      } else {
        let exists = this.modulePermissionSet.find(mp => mp.trim() == `View ${task}`.trim());
        this.subTaskView = exists ? true : false;
      }
    } else {
      this.subTaskView = false;
    }
  }

  set subTaskManagePermission(task: string) {
    if (this.module && this.modulePermissionSet) {
      if (task == 'Order Catalog') {
        this.subTaskManage = this.modulePermissionSet.includes(`${task}`);
      } else {
        let exists = this.modulePermissionSet.find(mp => mp.trim() == `Manage ${task}`.trim());
        this.subTaskManage = exists ? true : false;
      }
    } else {
      this.subTaskManage = false;
    }
  }
}
