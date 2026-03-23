import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UserInfoService } from 'src/app/shared/user-info.service';

@Component({
  selector: 'unity-setup-integration-widget',
  templateUrl: './unity-setup-integration-widget.component.html',
  styleUrls: ['./unity-setup-integration-widget.component.scss']
})
export class UnitySetupIntegrationWidgetComponent implements OnInit, OnChanges {
  @Input() imageUrl: string;
  @Input() altText: string;
  @Input() addtooltipMsg: string;
  @Input() viewtooltipMsg: string;
  @Input() addEnabled?: boolean;
  @Input() viewEnabled?: boolean;
  @Input() moduleName: string;
  @Input() addAccessType: string;
  @Input() viewAccessType: string;
  @Input() elementType: string;
  @Output() addButtonClick: EventEmitter<void> = new EventEmitter<void>();
  @Output() viewButtonClick: EventEmitter<void> = new EventEmitter<void>();
  constructor() { }

  ngOnInit(): void {
    this.addtooltipMsg = this.addtooltipMsg ? this.addtooltipMsg : 'Integrate';
    this.addEnabled = this.addEnabled ? false : true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.viewEnabled = this.viewEnabled ? false : true;
  }

  handleAddButtonClick(): void {
    if (!this.addEnabled) {
      return;
    }
    this.addButtonClick.emit();
  }

  handleViewButtonClick(): void {
    if (!this.viewEnabled) {
      return;
    }
    this.viewButtonClick.emit();
  }
}
