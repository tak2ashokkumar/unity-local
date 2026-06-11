import { Component, OnInit, Input, ElementRef, Renderer2 } from '@angular/core';

import { Replace } from 'src/app/shared/replace';

@Component({
  selector: 'app-sidebar-nav-title',
  templateUrl: './app-sidebar-nav-title.component.html',
  styleUrls: ['./app-sidebar-nav-title.component.scss']
})
export class AppSidebarNavTitleComponent implements OnInit {

  @Input() title: any;

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  ngOnInit() {
    const nativeElement: HTMLElement = this.el.nativeElement;
    const li = this.renderer.createElement('li');
    const name = this.renderer.createText(this.title.name);

    this.renderer.addClass(li, 'nav-title');

    if (this.title.class) {
      const classes = this.title.class;
      this.renderer.addClass(li, classes);
    }

    if (this.title.wrapper) {
      const wrapper = this.renderer.createElement(this.title.wrapper.element);

      this.renderer.appendChild(wrapper, name);
      this.renderer.appendChild(li, wrapper);
    } else {
      this.renderer.appendChild(li, name);
    }
    this.renderer.appendChild(nativeElement, li);
    Replace(this.el);
  }

}
