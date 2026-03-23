import { Component, Input, OnInit } from '@angular/core';
import { ChatbotTableViewData, UcTableService } from './uc-table.service';

@Component({
  selector: 'uc-table',
  templateUrl: './uc-table.component.html',
  styleUrls: ['./uc-table.component.scss'],
  providers: [UcTableService]
})
export class UcTableComponent implements OnInit {

  searchValue: string = '';
  filteredTableResponse: string[][] = [];

  @Input() tableResponse: ChatbotTableViewData;

  constructor() { }

  ngOnInit(): void {
    this.filteredTableResponse = [...this.tableResponse.values];
  }

  onSearched(event: string) {
    this.searchValue = event;
    if(!event){
      this.filteredTableResponse = [...this.tableResponse.values];
      return ;
    }
    const searchValue = event.toLocaleLowerCase();
    this.filteredTableResponse = this.tableResponse.values.filter(row =>
      row.some(value =>
        String(value).toLocaleLowerCase().includes(searchValue)
      )
    );
  }

}
