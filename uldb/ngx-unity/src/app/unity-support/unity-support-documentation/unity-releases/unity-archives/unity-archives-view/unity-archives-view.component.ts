import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'unity-archives-view',
  templateUrl: './unity-archives-view.component.html',
  styleUrls: ['./unity-archives-view.component.scss']
})
export class UnityArchivesViewComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject();
  url: string;
  constructor(private storage: StorageService,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.url = <string>this.storage.getByKey('releaseUrl', StorageType.SESSIONSTORAGE);
  }

  ngOnDestroy() {
    this.storage.removeByKey('releaseUrl', StorageType.SESSIONSTORAGE);
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  goBack() {
    this.router.navigate(['../', 'list'], { relativeTo: this.route });
  }
}