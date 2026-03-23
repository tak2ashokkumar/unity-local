import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'ai-agents-finops-agent',
  templateUrl: './ai-agents-finops-agent.component.html',
  styleUrls: ['./ai-agents-finops-agent.component.scss']
})
export class AiAgentsFinopsAgentComponent implements OnInit {
  unityOneLogo: string = `${environment.assetsUrl}brand/unity-logo-old.png`;
  constructor() { }

  ngOnInit(): void {
  }

}