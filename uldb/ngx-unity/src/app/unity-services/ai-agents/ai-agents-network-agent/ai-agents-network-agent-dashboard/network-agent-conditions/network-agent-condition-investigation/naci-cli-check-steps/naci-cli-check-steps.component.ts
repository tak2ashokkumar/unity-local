import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { NaciCliCheckStepsService } from './naci-cli-check-steps.service';
import { NetworkAgentsChatResponseType } from '../naci-chatbot/naci-chatbot.type';

@Component({
  selector: 'naci-cli-check-steps',
  templateUrl: './naci-cli-check-steps.component.html',
  styleUrls: ['./naci-cli-check-steps.component.scss'],
})
export class NaciCliCheckStepsComponent implements OnInit, OnChanges {

  @Input() chatResponse: NetworkAgentsChatResponseType;
  currentStep: number;

  executedSteps: Set<number> = new Set();
  verifyAndAuditRelatedStageTitle: string;

  constructor(private cliSvc: NaciCliCheckStepsService) { }

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
    this.executedSteps.add(this.currentStep);
    const stageTitle = ["Monitoring", "Resource Utilization", "Check Device Health", "Centralized Logs", "Network Topology"];
    if (stageTitle.includes(this.chatResponse?.answer?.stage_title)) {
      this.executedSteps.delete(1);
      this.verifyAndAuditRelatedStageTitle = this.chatResponse?.answer?.stage_title;
      this.cliSvc.toggle('');
    }
  }

  isStepExecuted(step: number): boolean {
    return this.executedSteps.has(step);
  }

  // getIcon(step: number): string {
  //   const icons: Record<number, string> = {
  //     1: 'fas fa-shield-alt',
  //     2: 'fas fa-sync-alt',
  //     3: 'fas fa-wrench',
  //     4: 'far fa-check-circle',
  //     5: 'far fa-file-alt'
  //   };

  //   return icons[step];
  // }


}