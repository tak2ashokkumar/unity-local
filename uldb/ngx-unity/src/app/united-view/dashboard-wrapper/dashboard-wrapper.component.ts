import { Component, OnInit } from '@angular/core';
import { TabData } from 'src/app/shared/tabdata';
import { tabItems } from './tabs';

@Component({
  selector: 'dashboard-wrapper',
  templateUrl: './dashboard-wrapper.component.html',
  styleUrls: ['./dashboard-wrapper.component.scss']
})
export class DashboardWrapperComponent implements OnInit {
  public tabItems: TabData[] = tabItems;

  constructor() { }

  ngOnInit(): void {
  }

}
