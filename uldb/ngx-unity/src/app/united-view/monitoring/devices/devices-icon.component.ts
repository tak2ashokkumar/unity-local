import { Component, OnInit } from '@angular/core';
import { BaseIconComponent } from 'src/app/shared/app-main-tab/base-icon.component';
import { DeviceService } from './device.service';

@Component({
  selector: 'devices-icon',
  template: `
  <li class="nav-item tabs-level1-menu" (click)="toggleEditMode()" accessControl
  moduleName="Monitoring" accessType="Manage Monitoring" elementType="btn">
    <a class="nav-link tabs-level1-link border-0"><span class="fa fa-lg text-success" [ngClass]="icon"></span></a>
  </li>
  `,
  styles: []
})
export class DevicesIconComponent implements OnInit, BaseIconComponent {

  data: any;
  editModeOn: boolean = false;
  constructor(private deviceService: DeviceService) { }

  toggleEditMode() {
    this.editModeOn = !this.editModeOn;
    this.deviceService.toggleEditMode(this.editModeOn);
  }

  get icon() {
    return this.editModeOn ? 'fa-eye' : 'fa-edit';
  }

  ngOnInit() {
    this.deviceService.toggleEditMode(this.editModeOn);
  }

}
