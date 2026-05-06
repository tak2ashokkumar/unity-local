import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'finops-ai-agent',
  templateUrl: './finops-ai-agent.component.html',
  styleUrls: ['./finops-ai-agent.component.scss']
})
export class FinopsAiAgentComponent implements OnInit {
  unityOneLogo: string = `${environment.assetsUrl}brand/unity-logo-old.png`;

  constructor() { }

  ngOnInit(): void {
  }

}
