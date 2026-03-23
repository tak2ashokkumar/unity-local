import { Component, OnInit } from '@angular/core';
import { SearchCriteria, PAGE_SIZES } from 'src/app/shared/table-functionality/search-criteria';
import { MS_DYNAMICS_TICKET_TYPE } from 'src/app/shared/app-utility/app-utility.service';

@Component({
  selector: 'ms-dynamics-request',
  templateUrl: './ms-dynamics-request.component.html',
  styleUrls: ['./ms-dynamics-request.component.scss']
})
export class MsDynamicsRequestComponent implements OnInit {
  currentCriteria: SearchCriteria;
  spinner: string = 'main';
  constructor() { }

  ngOnInit(): void {
    this.currentCriteria = {
      sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'ticket_type': MS_DYNAMICS_TICKET_TYPE.REQUEST }]
    };
  }

}
