import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'naci-network-topology-steps',
  templateUrl: './naci-network-topology-steps.component.html',
  styleUrls: ['./naci-network-topology-steps.component.scss'],
})
export class NaciNetworkTopologyStepsComponent implements OnInit {
  @Input() chatResponse: any;
  currentStep: number;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    // this.updateStep();
  }

  private updateStep(): void {
    if (!this.chatResponse?.answer?.stage) {
      // this.currentStep = 1;
      return;
    }

    // Extract number from "Stage 3"
    const match = this.chatResponse.answer?.stage?.match(/\d+/);
    this.currentStep = match ? +match[0] : 1;
  }

  getIcon(step: number): string {
    const icons: Record<number, string> = {
      1: 'fas fa-shield-alt',
      2: 'fas fa-sync-alt',
      3: 'fas fa-wrench',
      4: 'far fa-check-circle',
      5: 'far fa-file-alt'
    };

    return icons[step];
  }

}
