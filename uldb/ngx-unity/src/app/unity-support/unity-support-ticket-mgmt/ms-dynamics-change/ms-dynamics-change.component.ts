import { Component, OnInit } from '@angular/core';
import { SearchCriteria, PAGE_SIZES } from 'src/app/shared/table-functionality/search-criteria';
import { MS_DYNAMICS_TICKET_TYPE } from 'src/app/shared/app-utility/app-utility.service';

@Component({
  selector: 'ms-dynamics-change',
  templateUrl: './ms-dynamics-change.component.html',
  styleUrls: ['./ms-dynamics-change.component.scss']
})
export class MsDynamicsChangeComponent implements OnInit {
  currentCriteria: SearchCriteria;
  spinner: string = 'main';
  constructor() { }

  ngOnInit() {
    this.currentCriteria = {
      sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'ticket_type': MS_DYNAMICS_TICKET_TYPE.CHANGE }]
    };
  }

}
