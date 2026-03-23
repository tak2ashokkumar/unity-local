import { Component, OnInit } from '@angular/core';
import { SearchCriteria, PAGE_SIZES } from 'src/app/shared/table-functionality/search-criteria';

@Component({
  selector: 'ms-dynamics-all',
  templateUrl: './ms-dynamics-all.component.html',
  styleUrls: ['./ms-dynamics-all.component.scss']
})
export class MsDynamicsAllComponent implements OnInit {
  currentCriteria: SearchCriteria;
  spinner: string = 'main';
  constructor() { }

  ngOnInit(): void {
    this.currentCriteria = {
      sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'ticket_type': null }]
    };
  }

}
