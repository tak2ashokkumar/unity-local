import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';

@Component({
  selector: 'unity-archives',
  templateUrl: './unity-archives.component.html',
  styleUrls: ['./unity-archives.component.scss']
})
export class UnityArchivesComponent implements OnInit {

  constructor(private router: Router, private route: ActivatedRoute) {
    /**
     * This is to load private cloud when clicked on left panel
     * as there is no reload:true option in angular
     */
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/support/documentation/releases/archives') {
          this.router.navigate(['/support/documentation/releases/archives/list']);
        }
      }
    });
  }

  ngOnInit() {
  }
}