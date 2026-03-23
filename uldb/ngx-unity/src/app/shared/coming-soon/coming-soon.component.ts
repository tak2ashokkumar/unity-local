import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'coming-soon',
  templateUrl: './coming-soon.component.html',
  styleUrls: ['./coming-soon.component.scss']
})
export class ComingSoonComponent implements OnInit {
  @Input() message: string;
  constructor() { }

  ngOnInit() {
  }

}
