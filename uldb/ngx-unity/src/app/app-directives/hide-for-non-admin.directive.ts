import { Directive, ElementRef, OnInit, Renderer2, Input } from '@angular/core';
import { UserInfoService } from '../shared/user-info.service';

@Directive({
  selector: '[hideForNonAdmin]'
})
export class HideForNonAdminDirective implements OnInit {

  constructor(private eleRef: ElementRef,
    private renderer: Renderer2,
    private userService: UserInfoService) {
  }

  ngOnInit() {
    if (!this.userService.isUserAdmin) {
      this.renderer.setStyle(this.eleRef.nativeElement, 'display', 'none');
    }
  }

}

@Directive({
  selector: '[hideForReadonly]'
})
export class HideForReadOnlyDirective implements OnInit {

  constructor(private eleRef: ElementRef,
    private renderer: Renderer2,
    private userService: UserInfoService) {
  }

  ngOnInit() {
    if (this.userService.isReadonlyUser) {
      this.renderer.setStyle(this.eleRef.nativeElement, 'display', 'none');
    }
  }
}

@Directive({
  selector: '[disableForReadonly]'
})
export class DisableForReadOnlyDirective implements OnInit {

  constructor(private eleRef: ElementRef,
    private renderer: Renderer2,
    private userService: UserInfoService) {
  }

  ngOnInit() {
    if (this.userService.isReadonlyUser) {
      this.renderer.setAttribute(this.eleRef.nativeElement, 'disable', 'true');
      this.renderer.setStyle(this.eleRef.nativeElement, 'pointer-events', 'none');
    }
  }

}
