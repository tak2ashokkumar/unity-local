import { Directive, ElementRef, OnInit, Renderer2, Input } from '@angular/core';
import { UserInfoService } from './user-info.service';

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
