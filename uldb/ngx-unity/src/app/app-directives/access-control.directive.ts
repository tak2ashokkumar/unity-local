import { AfterViewInit, Directive, ElementRef, Input, Renderer2, RendererStyleFlags2 } from '@angular/core';
import { UnityUserApplicableModulePermission } from '../shared/SharedEntityTypes/loggedin-user.type';
import { PermissionService } from '../shared/unity-rbac-permissions/unity-rbac-permission.service';

@Directive({
  selector: '[accessControl]'
})
export class AccessControlDirective implements AfterViewInit {
  @Input("moduleName") moduleName: string;
  @Input("elementType") elementType: string;
  @Input("accessType") accessType: string;
  @Input("modulePermissions") modulePermissions: UnityUserApplicableModulePermission[];

  constructor(private el: ElementRef,
    private renderer: Renderer2,
    private permissionService: PermissionService) { }

  ngAfterViewInit(): void {
    let moduleOrArr = this.moduleName.split('|');
    let modulePerms: string[] = [];
    // for user level access control
    if (!this.modulePermissions?.length) {
      for (let i = 0; i < moduleOrArr.length; i++) {
        modulePerms = this.permissionService.getAccess(moduleOrArr[i].trim()) || [];
        if (modulePerms && modulePerms.length) {
          break;
        }
      }
    }
    //for device level access control
    if (this.modulePermissions?.length) {
      this.modulePermissions?.forEach((i) => {
        if (moduleOrArr.includes(i.module_name)) {
          // modulePerms.concat(i.permission_names);
          modulePerms = i.permission_names;
        }
      });
    }
    // const modulePerms: string[] = this.appLevelSvc.getAccess(this.moduleName);
    if (!modulePerms) {
      this.disableElement();
    } else if (modulePerms && !modulePerms.includes(this.accessType)) {
      this.disableElement();
    }
  }

  disableElement() {
    if (this.elementType == 'btn') {
      this.renderer.setStyle(this.el.nativeElement, 'display', 'none', RendererStyleFlags2.Important);
    } else if (this.elementType == 'actionbtn') {
      this.renderer.addClass(this.el.nativeElement, 'action-icons-disabled');
      this.renderer.setProperty(this.el.nativeElement, 'disabled', true);
      this.renderer.setStyle(this.el.nativeElement, 'pointer-events', 'none');
    } else if (this.elementType == 'formelem') {
      this.renderer.setProperty(this.el.nativeElement, 'disabled', true);
      this.renderer.setProperty(this.el.nativeElement, 'readonly', true);
    } else if (this.elementType == 'div') {
      this.renderer.setStyle(this.el.nativeElement, 'pointer-events', 'none');
    } else if (this.elementType == 'div-hide') {
      this.renderer.setStyle(this.el.nativeElement, 'display', 'none', RendererStyleFlags2.Important);
    } else if (this.elementType == 'btn-hide') {
      this.renderer.setStyle(this.el.nativeElement, 'visibility', 'hidden');
    }
  }

}
