import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { StorageService, StorageType } from 'src/app/shared/app-storage/storage.service';

@Component({
  selector: 'web-access',
  templateUrl: './web-access.component.html',
  styleUrls: ['./web-access.component.scss']
})
export class WebAccessComponent implements OnInit, OnDestroy {
  url: string;
  constructor(private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private storageService: StorageService) {
  }

  ngOnInit() {
    this.url = this.storageService.getByKey('url', StorageType.SESSIONSTORAGE);
  }

  ngOnDestroy() {
    this.storageService.removeByKey('url', StorageType.SESSIONSTORAGE)
  }

  getUrl() {
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
  }

  goBack() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

}