import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'unity-select-dropdown',
  templateUrl: './unity-select-dropdown.component.html',
  styleUrls: ['./unity-select-dropdown.component.scss']
})
export class UnitySelectDropdownComponent implements OnInit, OnChanges {
  @Input() count: number;
  @Input() options: Array<any>;
  @Input() texts: UnitySelectTexts;
  @Input() settings: UnitySelectSettings;
  @Input() isDisabled: boolean = false;
  @Output() selectionLimitReached = new EventEmitter();
  @Output() dropdownClosed = new EventEmitter();
  @Output() dropdownOpened = new EventEmitter();
  @Output() onAdded = new EventEmitter();
  @Output() onRemoved = new EventEmitter();

  private ngUnsubscribe = new Subject();
  title: string;
  numSelected: number = 0;
  isVisible: boolean = false;
  isLoading: boolean = false;
  private optionsList: Array<any>;
  model: any[];

  searchFilterText: string = '';
  private searchTextChanged = new Subject<string>();

  defaultSettings: UnitySelectSettings = {
    pullRight: false,
    enableSearch: false,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-secondary',
    containerClasses: 'dropdown-inline',
    selectionLimit: 0,
    closeOnSelect: false,
    autoUnselect: false,
    showCheckAll: false,
    showUncheckAll: false,
    fixedTitle: false,
    dynamicTitleMaxItems: 3,
    maxHeight: '300px',
    width: '100% !important',
    keyToSelect: '',
    lableToDisplay: '',
    isSimpleArray: false,
    selectAsObject: false,
    groupBy: false,
    appendToBody: false,
    mandatoryLimit: 0
  };
  defaultTexts: UnitySelectTexts = {
    selectAll: 'Select all',
    unselectAll: 'Unselect all',
    selected: 'selected',
    selectedPlural: 'selected',
    searchPlaceholder: 'Search...',
    defaultTitle: 'Select',
    allSelected: 'All Selected',
  };
  constructor() { }

  getItemStyle(option: any): any {
    if (!option.isLabel) {
      return { 'cursor': 'pointer' };
    }
  }

  getKeyValue(option: any) {
    if (this.settings.isSimpleArray) {
      return option;
    } else if (this.settings.selectAsObject) {
      return option;
    } else {
      return option[this.settings.keyToSelect];
    }
  }

  getLabelValue(option: any) {
    if (this.settings.isSimpleArray) {
      return option;
    } else {
      return option[this.settings.lableToDisplay];
    }
  }

  ngOnInit(): void {
    this.settings = Object.assign(this.defaultSettings, this.settings);
    this.texts = Object.assign(this.defaultTexts, this.texts);
    this.title = this.texts.defaultTitle || '';
  }

  ngOnChanges(changes: SimpleChanges): void {

  }

  updateTitle() {
    if (this.numSelected === 0 || this.settings.fixedTitle) {
      this.title = this.texts.defaultTitle || '';
    } else if (this.settings.displayAllSelectedText && this.model.length === this.options.length) {
      this.title = this.texts.allSelected || '';
    } else if (this.settings.dynamicTitleMaxItems && this.settings.dynamicTitleMaxItems >= this.numSelected) {
      this.title = this.optionsList
        .filter((option: any) =>
          this.model && this.model.indexOf(this.getKeyValue(option)) > -1
        )
        .map((option: any) => this.getLabelValue(option))
        .join(', ');
    } else {
      this.title = this.numSelected
        + ' '
        + (this.numSelected === 1 ? this.texts.selected : this.texts.selectedPlural);
    }
  }

  onSearched() {

  }

  selectOption() {

  }

  fetchMore() {

  }

}

export interface UnitySelectSettings {
  pullRight?: boolean;
  enableSearch?: boolean;
  checkedStyle?: 'checkboxes' | 'glyphicon' | 'fontawesome';
  buttonClasses?: string;
  itemClasses?: string;
  containerClasses?: string;
  selectionLimit?: number;
  closeOnSelect?: boolean;
  autoUnselect?: boolean;
  showCheckAll?: boolean;
  showUncheckAll?: boolean;
  fixedTitle?: boolean;
  dynamicTitleMaxItems?: number;
  maxHeight?: string;
  width?: string;
  displayAllSelectedText?: boolean;
  keyToSelect?: string;
  lableToDisplay?: string;
  isSimpleArray?: boolean;
  selectAsObject?: boolean;
  groupBy?: boolean;
  appendToBody?: boolean;
  mandatoryLimit?: number; // showUncheckAll has to be set to false for this property

  enableServerFiltering?: boolean; // Property to enable/disable server-side filtering
  serverFilterFn?: (searchText: string) => Observable<Array<any>>;
}

export interface UnitySelectTexts {
  selectAll?: string;
  unselectAll?: string;
  selected?: string;
  selectedPlural?: string;
  searchPlaceholder?: string;
  defaultTitle?: string;
  allSelected?: string;
}
