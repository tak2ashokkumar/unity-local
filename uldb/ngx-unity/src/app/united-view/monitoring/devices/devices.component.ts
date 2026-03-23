import { Component, OnInit, OnDestroy } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { DeviceService } from './device.service';
import { Subject, interval } from 'rxjs';
import { takeUntil, filter, tap, switchMap, takeWhile } from 'rxjs/operators';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppMainTabService } from 'src/app/shared/app-main-tab/app-main-tab.service';
import { DevicesIconComponent } from './devices-icon.component';
import { DevicesCrudService } from './devices-crud/devices-crud.service';
import { FloatingTerminalService } from 'src/app/shared/floating-terminal/floating-terminal.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'devices',
  templateUrl: './devices.component.html',
  styleUrls: ['./devices.component.scss']
})
export class DevicesComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  groups: DeviceGroup[] = [];
  editModeOn: boolean = false;
  poll: boolean = false;

  constructor(private deviceService: DeviceService,
    private spinner: AppSpinnerService,
    private appMainTabService: AppMainTabService,
    private crudService: DevicesCrudService,
    private termService: FloatingTerminalService) {
      this.termService.isOpenAnnounced$.pipe(tap(res => this.poll = res),
      switchMap(res => interval(environment.pollingInterval).pipe(takeWhile(() => this.poll), takeUntil(this.ngUnsubscribe))),
      takeUntil(this.ngUnsubscribe)).subscribe(x => this.getGroups());
  }

  ngOnInit() {
    this.appMainTabService.addIconItem(DevicesIconComponent);
    this.editModeToggled();
    this.spinner.start('main');
    this.getGroups();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.appMainTabService.removeIconItem();
  }

  refreshData(pageNo: number) {
    this.spinner.start('main');
    this.getGroups();
  }

  editModeToggled() {
    this.deviceService.editModeToggled$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.editModeOn = res;
    });
  }

  groupAdded(group: DeviceGroup) {
    this.groups.push(group);
  }

  groupDeleted(groupId: string) {
    const index = this.groups.map(data => data.uuid).indexOf(groupId);
    this.groups.splice(index, 1);
  }

  getGroups() {
    this.deviceService.getDeviceGroups().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.groups = res;
    }, err => {
      this.spinner.stop('main');
    });
  }

  get trackIds() {
    return this.groups.map(group => group.id + '');
  }

  dropGroup(event: CdkDragDrop<DeviceGroup[]>) {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    let ids: string[] = [];
    this.groups.map(group => ids.push(group.uuid));
    this.deviceService.updateGroup(ids);
  }

  addGroup() {
    this.crudService.addOrEdit(null);
  }
}