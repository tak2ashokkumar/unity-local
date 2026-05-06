import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'itsm-ai-agent',
  templateUrl: './itsm-ai-agent.component.html',
  styleUrls: ['./itsm-ai-agent.component.scss']
})
export class ItsmAiAgentComponent implements OnInit {
  unityOneLogo: string = `${environment.assetsUrl}brand/unity-logo-old.png`;

  constructor() { }

  ngOnInit(): void {
  }

}
