import { Component, OnInit } from '@angular/core';
import { TabData } from 'src/app/shared/tabdata';

@Component({
  selector: 'service-catalogue',
  templateUrl: './service-catalogue.component.html',
  styleUrls: ['./service-catalogue.component.scss']
})
export class ServiceCatalogueComponent implements OnInit {
  public tabItems: TabData[] = tabData;
  constructor() { }

  ngOnInit() { }

}

const tabData: TabData[] = [
  // {
  //   name: 'Subscribed Services',
  //   url: '/services/catalogue/subscribed'
  // },
  {
    name: 'All Services',
    url: '/services/catalog/all'
  }
];
