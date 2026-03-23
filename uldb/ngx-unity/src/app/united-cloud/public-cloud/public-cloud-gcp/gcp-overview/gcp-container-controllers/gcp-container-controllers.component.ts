import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
  selector: 'gcp-container-controllers',
  templateUrl: './gcp-container-controllers.component.html',
  styleUrls: ['./gcp-container-controllers.component.scss']
})
export class GcpContainerControllerComponent implements OnInit {
  accountId: string;
  constructor(private route: ActivatedRoute) {
    this.route.parent.paramMap.subscribe((params: ParamMap) => {
      this.accountId = params.get('accountId');
    });
  }

  ngOnInit() {

  }
}
