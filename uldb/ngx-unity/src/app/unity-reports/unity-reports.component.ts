import { Component, ElementRef, HostListener, OnInit, Renderer2, ViewChild } from '@angular/core';
import { RoundedTabDataType } from '../shared/unity-rounded-tab/unity-rounded-tab.component';
import { TabData } from '../shared/tabdata';
import { StorageService, StorageType } from '../shared/app-storage/storage.service';

@Component({
  selector: 'unity-reports',
  templateUrl: './unity-reports.component.html',
  styleUrls: ['./unity-reports.component.scss']
})
export class UnityReportsComponent implements OnInit {
  tabItems: TabData[] = tabData;

  constructor(
    private storageService: StorageService
  ) { }


  ngOnInit(): void {
  }

  ngOnDestroy() {
    if (this.storageService.getByKey('feature', StorageType.SESSIONSTORAGE)) {
      this.storageService.removeByKey('feature', StorageType.SESSIONSTORAGE);
    }
  } 

}

const tabData: TabData[] = [
  {
    name: 'Reports',
    url: '/reports/manage'
  }
];