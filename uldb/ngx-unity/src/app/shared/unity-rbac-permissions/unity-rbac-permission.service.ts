import { Injectable } from '@angular/core';
import {
    getUnityManagePermissionName,
    getUnityViewPermissionName,
    UnityModules,
    UnityPermissionSet
} from './unity-permission-set';
import { UserInfoService } from '../user-info.service';

@Injectable({
    providedIn: 'root'
})
export class PermissionService {
    constructor(private userService: UserInfoService) { }

    getModulePermissions(module: UnityModules | string): string[] {
        return this.userService.userPermissions ? this.userService.userPermissions[module] || [] : [];
    }

    getAccess(module: UnityModules | string): string[] | null {
        const permissions = this.getModulePermissions(module);
        return permissions.length ? permissions : null;
    }

    getPermissionSet(module: UnityModules): UnityPermissionSet {
        return new UnityPermissionSet(module, this.getModulePermissions(module));
    }

    getViewPermissionName(module: UnityModules | string): string {
        return getUnityViewPermissionName(module);
    }

    getManagePermissionName(module: UnityModules | string): string {
        return getUnityManagePermissionName(module);
    }

    hasTaskAccess(module: UnityModules, task: string): boolean {
        return this.getModulePermissions(module).includes(task);
    }

    hasViewAccess(module: UnityModules): boolean {
        return this.getModulePermissions(module).includes(this.getViewPermissionName(module));
    }

    hasManageAccess(module: UnityModules): boolean {
        return this.getModulePermissions(module).includes(this.getManagePermissionName(module));
    }

    hasCompleteAccess(module: UnityModules): boolean {
        return module == UnityModules.SUSTAINABILITY
            ? this.hasViewAccess(module)
            : this.hasViewAccess(module) && this.hasManageAccess(module);
    }
}
