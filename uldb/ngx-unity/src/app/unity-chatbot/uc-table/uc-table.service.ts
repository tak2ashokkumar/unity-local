import { Injectable } from '@angular/core';
import { UnityChatBotResponseTableData } from '../unity-chatbot.type';

@Injectable()
export class UcTableService {

  constructor() { }

  convertToTableViewData(data: UnityChatBotResponseTableData): ChatbotTableViewData {
    let table: ChatbotTableViewData = new ChatbotTableViewData();
    table.columns = data.columns;
    let viewData: string[][] = [];
    if (data.columns) {
      if (data.values.length) {
        data.values.forEach(val => {
          if (Object.keys(val)) {
            viewData.push(Object.values(val));
          }
        })
      }
    }
    table.values = data.values;
    return table;
  }
}

export class ChatbotTableViewData {
  constructor() { }
  columns: string[];
  values: string[][];
}
