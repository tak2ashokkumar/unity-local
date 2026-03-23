import { Component, OnInit, OnDestroy } from '@angular/core';
import { UnityReleasesService } from '../unity-releases.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'current-releases',
  templateUrl: './current-releases.component.html',
  styleUrls: ['./current-releases.component.scss'],
  providers: [UnityReleasesService]
})
export class CurrentReleasesComponent implements OnInit, OnDestroy {
  url: string;
  private ngUnsubscribe = new Subject();
  constructor(private releaseService: UnityReleasesService,
    private notification: AppNotificationService) { }

  ngOnInit() {
    this.getUrl();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getUrl() {
    this.releaseService.getCurrentRelease().pipe(takeUntil(this.ngUnsubscribe)).subscribe(release => {
      this.url = release.file_url;
    }, err => {
      this.notification.error(new Notification('Something went wrong.... Please try again later'));
    });
  }

}
