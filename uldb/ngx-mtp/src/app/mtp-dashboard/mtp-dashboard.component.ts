import { Component, OnInit } from '@angular/core';
import { MapService } from '../map.service';

@Component({
  selector: 'dashboard',
  templateUrl: './mtp-dashboard.component.html',
  styleUrls: ['./mtp-dashboard.component.scss']
})
export class MtpDashboardComponent implements OnInit {

  constructor(public mapService: MapService) { }

  ngOnInit(): void {
  }

}
