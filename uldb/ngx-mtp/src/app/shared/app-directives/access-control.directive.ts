import { AfterViewInit, Directive, ElementRef, Input, OnInit, Renderer2, RendererStyleFlags2 } from '@angular/core';
import { AppLevelService } from 'src/app/app-level.service';

@Directive({
  selector: '[accessControl]'
})
export class AccessControlDirective implements AfterViewInit {
  @Input("moduleName") moduleName: string;
  @Input("elementType") elementType: string;
  @Input("accessType") accessType: string;
  constructor(private el: ElementRef,
    private renderer: Renderer2,
    private appLevelSvc: AppLevelService) { }

  ngAfterViewInit(): void {
    this.checkAccess();
  }

  checkAccess() {
    const module: any = this.appLevelSvc.getAccess(this.moduleName);
    if (!module) {
      this.disableElement();
    }else if(module && !module[this.accessType]){
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
    }else if (this.elementType == 'btn-hide') {
      this.renderer.setStyle(this.el.nativeElement, 'visibility', 'hidden');
    }
  }
}
