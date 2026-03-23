import { Component, OnInit } from '@angular/core';
import { SearchCriteria, PAGE_SIZES } from 'src/app/shared/table-functionality/search-criteria';
import { MS_DYNAMICS_TICKET_TYPE } from 'src/app/shared/app-utility/app-utility.service';

@Component({
  selector: 'ms-dynamics-incident',
  templateUrl: './ms-dynamics-incident.component.html',
  styleUrls: ['./ms-dynamics-incident.component.scss']
})
export class MsDynamicsIncidentComponent implements OnInit {
  currentCriteria: SearchCriteria;
  spinner: string = 'main';
  constructor() { }

  ngOnInit() {
    this.currentCriteria = {
      sortColumn: '', sortDirection: '', searchValue: '', pageNo: 1, pageSize: PAGE_SIZES.DEFAULT_PAGE_SIZE, params: [{ 'ticket_type': MS_DYNAMICS_TICKET_TYPE.INCIDENT }]
    };
  }

}
