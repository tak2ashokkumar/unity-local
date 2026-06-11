import { Component, OnInit } from '@angular/core';
import { TabData } from 'src/app/shared/tabdata';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'two-factor-auth',
  templateUrl: './two-factor-auth.component.html',
  styleUrls: ['./two-factor-auth.component.scss']
})
export class TwoFactorAuthComponent implements OnInit {
  public tabItems: TabData[] = tabData;

  url: SafeResourceUrl;
  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.sanitizeUrl();
  }

  sanitizeUrl() {
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl('account/two_factor');
  }

}
const tabData: TabData[] = [
  {
    name: 'Account Security',
    url: '/twofactor'
  }
];