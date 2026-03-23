import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'unityconnect-bandwidth-graph',
  templateUrl: './unityconnect-bandwidth-graph.component.html',
  styleUrls: ['./unityconnect-bandwidth-graph.component.scss']
})
export class UnityconnectBandwidthGraphComponent implements OnInit {

  constructor(private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit() {
  }

  goBack() {
    this.router.navigate(['/unitycloud/connect/bandwidth'], { relativeTo: this.route });
  }

}
