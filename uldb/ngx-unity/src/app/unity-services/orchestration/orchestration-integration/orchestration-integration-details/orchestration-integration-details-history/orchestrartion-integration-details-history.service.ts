import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TaskViewData } from '../../../orchestration-tasks/orchestration-tasks.service';

@Injectable()
export class OrchestrartionIntegrationDetailsHistoryService {

  constructor(private http: HttpClient) { }

  getPlaybooks(uuid: string) {
    return this.http.get<any[]>(`orchestration/execute/${uuid}/get_repo_playbook/`);
  }

  convertToViewData(data: PlaybookHistoryDataType[]): PlaybookHistoryViewData[] {
    let viewData: PlaybookHistoryViewData[] = [];
    data.map(a => {
      let pd: PlaybookHistoryViewData = new PlaybookHistoryViewData();
      pd.uuid = a.uuid;
      pd.playbookName = a.playbook_name;
      pd.taskName = a.task_name;
      pd.type = a.type;
      pd.playbookType = a.playbook_type;
      pd.datetime = a.datetime;
      pd.playbookDescription = a.description;
      pd.playbookContent = a.playbook_content;
      pd.taskFk = a.task_fk;
      pd.playbookId = a.playbook_uuid;
      // pd.playbookFile = a.playbook;
      // pd.playbookFileName = a.playbook ? a.playbook.split('/').pop() : null;
      pd.isPlaybookDefault = a.type == 'Default' ? true : false;
      viewData.push(pd);
    });
    return viewData;
  }

  convertToExecutionViewData(data: PlaybookHistoryViewData): TaskViewData {
    let td: TaskViewData = new TaskViewData();
    td.uuid = data.taskFk;
    td.playbookType = data.playbookType;
    return td;
  }
}

export interface PlaybookHistoryDataType {
  uuid: string;
  task_fk: string;
  credentials: string;
  user: string;
  parameters: Parameters;
  task_name: string;
  type: string;
  datetime: string;
  description: string;
  playbook_name: string;
  playbook_uuid: string;
  playbook_content: string | null;
  source: string;
  playbook_type: string;
}

export interface Parameters {
  username: string;
  password: string;
}



export class PlaybookHistoryViewData {

  constructor() { }

  uuid: string;
  playbookName: string;
  taskName: string;
  type: string;
  datetime: string;
  playbookDescription: string;
  playbookContent: string;
  editOrCloneIcon: string;
  editOrCloneText: string;
  // playbookFileName: string;
  isPlaybookDefault: boolean;
  // editPlaybooktoolTipMessage: string;
  deletePlaybooktoolTipMessage: string;
  taskFk: string;
  playbookType: string;
  playbookId: string;
}

