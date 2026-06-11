import { Component, OnInit, ElementRef } from '@angular/core';

import { Replace } from 'src/app/shared/replace';

@Component({
  selector: 'app-sidebar-minimizer',
  templateUrl: './app-sidebar-minimizer.component.html',
  styleUrls: ['./app-sidebar-minimizer.component.scss']
})
export class AppSidebarMinimizerComponent implements OnInit {

  constructor(private el: ElementRef) { }

  ngOnInit() {
    Replace(this.el);
  }

}
