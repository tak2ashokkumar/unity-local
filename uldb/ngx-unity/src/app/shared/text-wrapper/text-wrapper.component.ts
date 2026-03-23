import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'text-wrapper',
  templateUrl: './text-wrapper.component.html',
  styleUrls: ['./text-wrapper.component.scss']
})
export class TextWrapperComponent implements OnInit {

  @Input() textToWrap: string;
  @Input() maxChar: number;
  constructor() { }

  ngOnInit() {
  }
}
