import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'nutanix-details',
  templateUrl: './nutanix-details.component.html',
  styleUrls: ['./nutanix-details.component.scss']
})
export class NutanixDetailsComponent implements OnInit, OnDestroy  {
  private ngUnsubscribe = new Subject();
  constructor() { }

  ngOnInit(): void {
  }
  
  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
