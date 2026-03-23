import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'ai-agents-itsm-agent',
  templateUrl: './ai-agents-itsm-agent.component.html',
  styleUrls: ['./ai-agents-itsm-agent.component.scss']
})
export class AiAgentsItsmAgentComponent implements OnInit {
  unityOneLogo: string = `${environment.assetsUrl}brand/unity-logo-old.png`;

  constructor() { }

  ngOnInit(): void {
  }

}
