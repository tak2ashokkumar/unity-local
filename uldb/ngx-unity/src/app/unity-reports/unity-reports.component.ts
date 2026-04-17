import { Component, OnDestroy } from '@angular/core';
import {
  StorageService,
  StorageType,
} from '../shared/app-storage/storage.service';

/**
 * Coordinates the Unity Reports screen state, template bindings, and user actions.
 */
@Component({
  selector: 'unity-reports',
  templateUrl: './unity-reports.component.html',
  styleUrls: ['./unity-reports.component.scss'],
})
export class UnityReportsComponent implements OnDestroy {
  constructor(private storageService: StorageService) {}

  /**
   * Releases Unity Reports Component subscriptions and pending UI work.
   *
   * @returns Nothing.
   */
  ngOnDestroy(): void {
    // Feature selection is shared only while the user is inside Unity Reports.
    if (this.storageService.getByKey('feature', StorageType.SESSIONSTORAGE)) {
      this.storageService.removeByKey('feature', StorageType.SESSIONSTORAGE);
    }
  }
}
