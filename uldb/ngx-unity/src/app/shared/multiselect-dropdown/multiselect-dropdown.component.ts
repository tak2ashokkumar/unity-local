import {
  Component,
  DoCheck,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostListener,
  Input,
  IterableDiffers,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  Pipe,
  PipeTransform,
  QueryList,
  Renderer2,
  SimpleChanges,
  ViewChildren
} from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALUE_ACCESSOR, Validator } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, finalize, takeUntil } from 'rxjs/operators';
import { IMultiSelectSettings, IMultiSelectTexts } from './types';
import { cloneDeep as _clone } from 'lodash-es';

const MULTISELECT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MultiselectDropdownComponent),
  multi: true
};

@Pipe({
  name: 'searchFilter'
})
export class MultiSelectSearchFilter implements PipeTransform {
  transform(options: Array<any>, text: string, lableToDisplay: string): Array<any> {
    if (lableToDisplay) {
      const matchPredicate = (option: any) => option.isOptionGroupName || option[lableToDisplay].toLowerCase().indexOf((text).toLowerCase()) > -1;
      return options.filter((option: any) => {
        return matchPredicate(option);
      });
    } else {
      const matchPredicate = (option: any) => option.isOptionGroupName || option.toLowerCase().indexOf((text).toLowerCase()) > -1;
      return options.filter((option: any) => {
        return matchPredicate(option);
      });
    }
  }
}


@Component({
  selector: 'multiselect-dropdown',
  templateUrl: './multiselect-dropdown.component.html',
  styleUrls: ['./multiselect-dropdown.component.scss'],
  providers: [MULTISELECT_VALUE_ACCESSOR]
})
export class MultiselectDropdownComponent implements OnInit, OnChanges, DoCheck, ControlValueAccessor, Validator, OnDestroy {
  @Input() options: Array<any>;
  @Input() settings: IMultiSelectSettings;
  @Input() texts: IMultiSelectTexts;
  @Input() isDisabled: boolean = false;
  @Input() optionDisabledMap?: Record<string, string> = {};
  @Output() selectionLimitReached = new EventEmitter();
  @Output() dropdownClosed = new EventEmitter();
  @Output() dropdownOpened = new EventEmitter();
  @Output() onAdded = new EventEmitter();
  @Output() onRemoved = new EventEmitter();
  private ngUnsubscribe = new Subject();
  private optionsList: Array<any>;

  @HostListener('document: click', ['$event.target'])
  onClick(target: HTMLElement) {
    if (!this.isVisible) return;
    let parentFound = false;
    while (target != null && !parentFound) {
      if (target === this.element.nativeElement || target === this.dropdownMenu) {
        parentFound = true;
      }
      target = target.parentElement;
    }
    if (!parentFound) {
      this.toggleDropdown();
    }
  }

  model: any[];
  // parents: any[];
  title: string;
  differ: any;
  numSelected: number = 0;
  isVisible: boolean = false;
  searchFilterText: string = '';
  isLoading: boolean = false;

  defaultSettings: IMultiSelectSettings = {
    pullRight: false,
    enableSearch: false,
    checkedStyle: 'checkboxes',
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
    mandatoryLimit: 0,
    enableTooltip: false,
    disableOptionsOfSameType: false,
    disableOptionsOfDifferentTypes: false
  };
  defaultTexts: IMultiSelectTexts = {
    checkAll: 'Check all',
    uncheckAll: 'Uncheck all',
    checked: 'checked',
    checkedPlural: 'checked',
    searchPlaceholder: 'Search...',
    defaultTitle: 'Select',
    allSelected: 'All Selected',
  };

  private searchTextChanged = new Subject<string>();
  private dropdownMenu: HTMLElement | null = null;

  constructor(private element: ElementRef,
    differs: IterableDiffers,
    private renderer: Renderer2) {
    this.differ = differs.find([]).create(null);
  }

  getItemStyle(option: any): any {
    if ((this.settings.disableOptionsOfSameType || this.settings.disableOptionsOfDifferentTypes) && option?.isDisabled) {
      return;
    }
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

  collapsedGroup = {};

  ngOnInit() {
    this.settings = Object.assign(this.defaultSettings, this.settings);
    this.texts = Object.assign(this.defaultTexts, this.texts);
    this.title = this.texts.defaultTitle || '';
    if (this.settings.isSimpleArray && (this.settings.keyToSelect !== '' || this.settings.lableToDisplay !== '')) {
      throw new Error('Do no pass keyToSelect or lableToDisplay if it is simple array');
    } else if (!this.settings.isSimpleArray && !this.settings.selectAsObject && (this.settings.keyToSelect === '' || this.settings.lableToDisplay === '')) {
      throw new Error('Pass keyToSelect or lableToDisplay if it is not simple array');
    } else if (this.settings.selectAsObject && !this.settings.isSimpleArray) {
      if (this.settings.keyToSelect !== '') {
        throw new Error('Do no pass keyToSelect if it selectAsObject is true');
      } else if (this.settings.lableToDisplay === '') {
        throw new Error('Pass lableToDisplay if it selectAsObject is true');
      }
    }
    // Validate settings for server-side filtering
    if (this.settings.enableServerFiltering) {
      if (typeof this.settings.enableServerFiltering !== 'boolean') {
        throw new Error('enableServerFiltering must be a boolean value');
      }

      if (!this.settings.serverFilterFn) {
        throw new Error('serverFilterEndpoint must be provided for server-side filtering');
      }

      if (this.settings.serverFilterFn && typeof this.settings.serverFilterFn !== 'function') {
        throw new Error('mapFn must be a function for server-side filtering');
      }
      this.serverSideFilter();
    } else {
      // If server-side filtering is disabled, mapFn and serverFilterEndpoint should not be provided
      if (this.settings.serverFilterFn) {
        throw new Error('mapFn and serverFilterEndpoint should not be provided when enableServerFiltering is false');
      }
    }
    if (this.settings.groupBy) {
      for (let i = 0; i < this.options.length; i++) {
        const element = this.options[i];
        if (!element.hasOwnProperty('isOptionGroupName') || !element.hasOwnProperty('optionGroupName')) {
          throw new Error('When group by enabled then each option should have isGroupName and groupName');
        } else {
          element['isOptionCollapsed'] = true;
        }
      }
      this.options.filter(o => o.isOptionGroupName).forEach(o => {
        this.collapsedGroup[o.optionGroupName] = true;
      });
    }

    this.searchTextChanged
      .pipe(debounceTime(500), takeUntil(this.ngUnsubscribe))
      .subscribe((searchText) => {
        this.performSearch(searchText);
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    if (this.isVisible && this.settings.appendToBody) {
      this.detachFromBody();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['options']) {
      this.options = this.options || [];
      this.optionsList = [].concat(this.options);
      this.updateTitle();
    }

    if (changes['texts'] && !changes['texts'].isFirstChange()) {
      this.updateTitle();
    }
  }

  onModelChange: Function = (_: any) => { };
  onModelTouched: Function = () => { };

  writeValue(value: any): void {
    if (value !== undefined && value !== null) {
      this.model = value;
    } else {
      this.model = [];
    }
  }

  registerOnChange(fn: Function): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: Function): void {
    this.onModelTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.isDisabled = isDisabled;
  }

  ngDoCheck() {
    const changes = this.differ.diff(this.model);
    if (changes) {
      this.updateNumSelected();
      this.updateTitle();
    }
  }

  validate(_c: AbstractControl): { [key: string]: any; } {
    return (this.model && this.model.length) ? null : {
      required: {
        valid: false,
      },
    };
  }

  registerOnValidatorChange(_fn: () => void): void {
    throw new Error('Method not implemented.');
  }

  clearSearch(event: Event) {
    event.stopPropagation();
    this.searchFilterText = '';
  }

  toggleGroupCollapse(option: any) {
    this.collapsedGroup[option.optionGroupName] = !this.collapsedGroup[option.optionGroupName];
  }

  isGroupCollapsed(option: any) {
    return this.collapsedGroup[option.optionGroupName];
  }

  getGroupArrowIcon(option: any) {
    return this.collapsedGroup[option.optionGroupName] ? 'fa-chevron-down' : 'fa-chevron-up';
  }

  private appendToBody() {
    setTimeout(() => {
      this.dropdownMenu = this.element.nativeElement.querySelector('.dropdown-menu');
      if (this.dropdownMenu) {
        const parent = this.renderer.parentNode(this.dropdownMenu);
        if (parent) {
          this.renderer.removeChild(parent, this.dropdownMenu);
          this.renderer.appendChild(document.body, this.dropdownMenu);
          const eTarget = parent as HTMLElement;
          const eOffset = eTarget.getBoundingClientRect();
          const dropdownTop = eOffset.bottom + window.scrollY;
          this.renderer.setStyle(this.dropdownMenu, 'width', eOffset.width + 'px');
          this.renderer.setStyle(this.dropdownMenu, 'display', 'block');
          this.renderer.setStyle(this.dropdownMenu, 'top', dropdownTop + 'px');
          this.renderer.setStyle(this.dropdownMenu, 'left', eOffset.left + window.scrollX + 'px');
          const footer = document.getElementsByTagName('footer')[0];
          const dropdownBottom = this.dropdownMenu.getBoundingClientRect().bottom;
          if (footer && footer.getBoundingClientRect().top < dropdownBottom) {
            const appRoot = document.getElementsByTagName('app-root')[0];
            const buffer = dropdownBottom - footer.getBoundingClientRect().top + 10 + document.body.getBoundingClientRect().height;
            this.renderer.setStyle(appRoot, 'min-height', `${buffer}px`);
          }
        }
      }
    }, 50);
  }

  private detachFromBody() {
    if (this.dropdownMenu) {
      this.renderer.removeChild(document.body, this.dropdownMenu);
      this.dropdownMenu = null;
      const appRoot = document.getElementsByTagName('app-root')[0];
      this.renderer.removeStyle(appRoot, 'min-height');
    }
  }

  toggleDropdown() {
    this.isVisible = !this.isVisible;
    if (this.settings.appendToBody) {
      if (this.isVisible) {
        setTimeout(() => {
          this.customTooltipHide();
        }, 0);
        this.appendToBody();
      } else {
        this.detachFromBody();
      }
    }
    this.isVisible ? this.dropdownOpened.emit() : this.dropdownClosed.emit();
  }

  tooltipContainer: string[] = [];
  @ViewChildren('hideTooltip') optionList: QueryList<ElementRef>;
  customTooltipHide() {
    if (this.options.length) {
      this.tooltipContainer = new Array(this.options.length).fill(null);
      this.optionList.forEach((el: ElementRef, index: number) => {
        const nativeElement = el.nativeElement;
        if (nativeElement.scrollWidth > nativeElement.clientWidth) {
          this.renderer.removeClass(nativeElement.parentNode, 'custom-tooltip-hide');
          this.tooltipContainer[index] = 'body';
        } else {
          this.renderer.addClass(nativeElement.parentNode, 'custom-tooltip-hide');
          this.tooltipContainer[index] = null;
        }
      });
    }
  }

  isSelected(option: any): boolean {
    return this.model && this.model.indexOf(this.getKeyValue(option)) > -1;
  }

  setSelected(_event: Event, option: any) {
    _event.stopPropagation();
    if (!this.model) {
      this.model = [];
    }
    if ((this.settings.disableOptionsOfSameType || this.settings.disableOptionsOfDifferentTypes) && option?.isDisabled) {
      return;
    }
    this.settings.disableOptionsOfSameType && this.disableOptions(option);
    this.settings.disableOptionsOfDifferentTypes && this.disableOptionsOfDifferentType(option);

    const index = this.model.indexOf(this.getKeyValue(option));
    if (index > -1) {
      if (this.settings.mandatoryLimit === 0 || (this.settings.mandatoryLimit && this.model.length > this.settings.mandatoryLimit)) {
        this.model.splice(index, 1);
        this.onRemoved.emit(this.getKeyValue(option));
      }
    } else {
      if (this.settings.selectionLimit === 0 || (this.settings.selectionLimit && this.model.length < this.settings.selectionLimit)) {
        this.model.push(this.getKeyValue(option));
        this.onAdded.emit(this.getKeyValue(option));
      } else {
        if (this.settings.autoUnselect) {
          this.model.push(this.getKeyValue(option));
          this.onAdded.emit(this.getKeyValue(option));
          const removedOption = this.model.shift();
          this.onRemoved.emit(removedOption);
        } else {
          this.selectionLimitReached.emit(this.model.length);
          return;
        }
      }
    }
    if (this.settings.closeOnSelect) {
      this.toggleDropdown();
    }
    this.model = this.model.slice();
    this.onModelChange(this.model);
    this.onModelTouched();
  }

  //This is made for credentials dropdown alone for now later a setting will be added for common approach
  private disableOptions(option: any) {
    if (this.settings.disableOptionsOfSameType && !option?.isDisabled && !this.isSelected(option)) {
      if (option?.connection_type == 'DATABASE') {
        this.options.filter(o => o?.database_type == option?.database_type && o != option).forEach(o => {
          o.isDisabled = true;
        })
      } else {
        const normalize = (str: string) => this.optionDisabledMap[str.toLowerCase()] || str.toLowerCase();
        this.options.filter(o => normalize(o?.connection_type) == normalize(option.connection_type) && o != option).forEach(o => {
          o.isDisabled = true;
        })
      }
    }
    if (this.settings.disableOptionsOfSameType && !option?.isDisabled && this.isSelected(option)) {
      if (option?.connection_type == 'DATABASE') {
        this.options.filter(o => o?.database_type == option?.database_type && o != option).forEach(o => {
          o.isDisabled = false;
        })
      } else {
        const normalize = (str: string) => this.optionDisabledMap[str.toLowerCase()] || str.toLowerCase();
        this.options.filter(o => normalize(o?.connection_type) == normalize(option.connection_type)).forEach(o => {
          o.isDisabled = false;
        })
      }
    }
  }

  private disableOptionsOfDifferentType(option: any) {
    const normalize = (str: string) => str.toLowerCase();
    if (this.settings.disableOptionsOfDifferentTypes && !option?.isDisabled && !this.isSelected(option)) {
      this.options.filter(o => normalize(o?.type) != normalize(option.type)).forEach(o => {
        o.isDisabled = true;
      })
    }
    if (this.settings.disableOptionsOfDifferentTypes && !option?.isDisabled && this.isSelected(option)) {
      const hasSameTypeOptionSelected = this.options.some(o => normalize(o?.type) == normalize(option.type) && o != option && this.isSelected(o));
      if (hasSameTypeOptionSelected) {
        return;
      }
      this.options.filter(o => normalize(o?.type) != normalize(option.type)).forEach(o => {
        o.isDisabled = false;
      })
    }
  }

  updateNumSelected() {
    this.numSelected = this.model && this.model.length || 0;
  }

  updateTitle() {
    if (this.numSelected === 0 || this.settings.fixedTitle) {
      this.title = this.texts?.defaultTitle || '';
    } else if (this.settings.displayAllSelectedText && this.model.length === this.options.length) {
      this.title = this.texts?.allSelected || '';
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
        + (this.numSelected === 1 ? this.texts?.checked : this.texts?.checkedPlural);
    }
  }

  searchFilterApplied() {
    return this.settings.enableSearch && this.searchFilterText && this.searchFilterText.length > 0;
  }

  private updateModel() {
    let newModel = [];
    for (let index = 0; index < this.model.length; index++) {
      const element = this.model[index];
      const newOption = this.options.find(option => option[this.settings.lableToDisplay] == element[this.settings.lableToDisplay]);
      if (newOption) {
        this.model.splice(index, 1, newOption);
      }
    }
  }

  serverSideFilter(): void {
    if (this.settings.enableServerFiltering) {
      this.isLoading = true;
      this.settings.serverFilterFn(this.searchFilterText).pipe(finalize(() => {
        this.isLoading = false;
      })).subscribe((filteredOptions) => {
        this.options = filteredOptions;
        this.optionsList = [].concat(this.options);
        this.updateModel();
      });
    }
  }

  onSearchTextChangeDebounced(searchText: string) {
    this.searchTextChanged.next(searchText);
  }

  // This method will be called when the search text changes
  performSearch(searchText: string): void {
    if (this.settings.enableSearch) {
      if (this.settings.enableServerFiltering) {
        this.serverSideFilter();
      } else {
        // For client-side filtering, use the custom pipe MultiSelectSearchFilter
        this.options = new MultiSelectSearchFilter().transform(
          this.optionsList,
          this.searchFilterText,
          this.settings.lableToDisplay
        );
      }
    }
  }

  checkAll() {
    this.model = [];
    //TODO: select only filtered options if searchFilterApplied
    let checkedOptions = (!this.searchFilterApplied() ? this.options : this.options);
    for (let option of this.options) {
      this.model.push(this.getKeyValue(option));
    }
    this.onModelChange(this.model);
    this.onModelTouched();
  }

  uncheckAll() {
    this.model = [];
    this.onModelChange(this.model);
    this.onModelTouched();
  }

  preventCheckboxCheck(event: Event, option: any) {
    if (this.settings.selectionLimit && !this.settings.autoUnselect &&
      this.model.length >= this.settings.selectionLimit &&
      this.model.indexOf(this.getKeyValue(option)) === -1
    ) {
      event.preventDefault();
    }
  }

  preventCheckboxUncheck(event: Event, option: any) {
    if (this.model.indexOf(this.getKeyValue(option)) > -1 &&
      (this.settings.mandatoryLimit === 0 || (this.settings.mandatoryLimit && this.model.length > this.settings.mandatoryLimit))
    ) {
      event.preventDefault();
    }
  }
}

const credentialMap = {
  'ssh': 'ssh',
  'ssh key': 'ssh',
  'snmpv1': 'snmp',
  'snmpv2': 'snmp',
  'snmpv3': 'snmp',
}