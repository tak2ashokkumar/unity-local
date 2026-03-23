import { Component, OnInit } from '@angular/core';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { TabData } from 'src/app/shared/tabdata';
import { Categories } from './unity-setup-integration.service';
import { PrivateCloudsWidgetMetadata } from './usi-pc-crud/usi-pc-crud.const';

@Component({
  selector: 'unity-setup-integration',
  templateUrl: './unity-setup-integration.component.html',
  styleUrls: ['./unity-setup-integration.component.scss']
})
export class UnitySetupIntegrationComponent implements OnInit {

  public tabItems: TabData[] = tabData;
  privateClouds = PrivateCloudsWidgetMetadata;
  selectedCategories: string[] = [];
  categories = Categories;

  categorySettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: "name",
    keyToSelect: "name",
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block btn-sm',
    dynamicTitleMaxItems: 2,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: false,
    mandatoryLimit: 1,
    autoUnselect: true
  };

  categoryTexts: IMultiSelectTexts = {
    allSelected: 'All Categories Selected',
  };

  constructor() { }

  ngOnInit() {
    this.selectedCategories = this.categories.map(c => c.name);
  }
}

const tabData: TabData[] = [
  // {
  //   name: 'Subscribed Services',
  //   url: '/services/catalogue/subscribed'
  // },
  {
    name: 'Integrations',
    url: '/setup/integration'
  }
];
