import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { NetworkAgentsChatResponseType } from '../naci-chatbot/naci-chatbot.type';

@Component({
  selector: 'naci-centralized-logs-steps',
  templateUrl: './naci-centralized-logs-steps.component.html',
  styleUrls: ['./naci-centralized-logs-steps.component.scss'],
})
export class NaciCentralizedLogsStepsComponent implements OnInit, OnChanges {
  @Input() chatResponse: NetworkAgentsChatResponseType;
  currentStep: number;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    this.updateStep();
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
