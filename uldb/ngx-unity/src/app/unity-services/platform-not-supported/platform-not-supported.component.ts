import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'platform-not-supported',
  templateUrl: './platform-not-supported.component.html',
  styleUrls: ['./platform-not-supported.component.scss']
})
export class PlatformNotSupportedComponent implements OnInit {
  @Input() platform_type: string;
  constructor() { }

  ngOnInit() {
  }

}
