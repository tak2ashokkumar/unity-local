import { Component, OnInit, OnDestroy } from '@angular/core';
import { UnityReleasesService } from '../../unity-releases.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UnityRelease } from '../../unity-release.type';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'unity-archives-list',
  templateUrl: './unity-archives-list.component.html',
  styleUrls: ['./unity-archives-list.component.scss'],
  providers: [UnityReleasesService]
})
export class UnityArchivesListComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  releases: UnityRelease[] = [];
  constructor(private release: UnityReleasesService,
    private notification: AppNotificationService,
    private storage: StorageService,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.getReleases();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getReleases() {
    this.release.getPreviousReleases().pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.releases = res;
    }, err => {
      this.notification.error(new Notification('Something went wrong.... Please try again later'));
    });
  }

  goToView(release: UnityRelease) {
    this.storage.put('releaseUrl', release.file_url, StorageType.SESSIONSTORAGE);
    this.router.navigate(['../', 'view'], { relativeTo: this.route });
  }
}
