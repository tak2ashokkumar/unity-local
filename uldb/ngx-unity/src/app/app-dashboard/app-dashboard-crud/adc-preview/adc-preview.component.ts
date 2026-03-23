import { Component, OnInit } from '@angular/core';
import { AdcPreviewService } from './adc-preview.service';

@Component({
  selector: 'adc-preview',
  templateUrl: './adc-preview.component.html',
  styleUrls: ['./adc-preview.component.scss'],
  providers: [AdcPreviewService]
})
export class AdcPreviewComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
