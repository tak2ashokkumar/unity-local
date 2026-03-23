import { ChangeDetectorRef, Component, ElementRef, EventEmitter, forwardRef, HostBinding, HostListener, Input, OnDestroy, OnInit, Optional, Output, Renderer2, Self, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { Subject } from 'rxjs';

@Component({
  selector: 'search-dropdown',
  templateUrl: './search-dropdown.component.html',
  styleUrls: ['./search-dropdown.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SearchDropdownComponent),
    multi: true
  }]
})
export class SearchDropdownComponent implements OnInit {

  private static openDropdown: SearchDropdownComponent | null = null;
  private ngUnsubscribe = new Subject();

  @Input() values: any[];
  @Input() defaultLabel: string;
  @Input() displayField: string;
  // @Input() textField: boolean;
  @Input() editCaseValue: any;
  @Output() selectedDropdownValue = new EventEmitter<any>();
  selectedValue: any;
  clickFlag: boolean = false;
  searchText: string = '';
  filteredValues: any[] = [];

  @Input() hasError: boolean = false;

  private dropdownMenu: HTMLElement | null = null;
  // @HostBinding('class') hostClass = 'form-control';

  // private onChange = (_: any) => { };
  // private onTouched = () => { };
  // isDisabled = false;

  constructor(
    private renderer: Renderer2,
    private element: ElementRef,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    if (this.values) {
      this.filteredValues = [...this.values];
    }
    if (this.editCaseValue) {
      this.selectedValue = this.editCaseValue;
    }
  }

  ngOnDestroy() {
    this.clickFlag = false;
    if (this.dropdownMenu) {
      this.renderer.removeChild(document.body, this.dropdownMenu);
      this.dropdownMenu = null;
    }
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['values'] && this.values) {
      this.filteredValues = [...this.values];
    }
    if (changes['editCaseValue']) {
      this.selectedValue = changes['editCaseValue'].currentValue;
    }
    console.log('<<<<<<<<<', this.filteredValues)
  }

  // @HostListener('document:click', ['$event'])
  // onDocumentClick(event: MouseEvent): void {
  //   const dropdownElement = document.querySelector('.dropdown');
  //   if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
  //     this.clickFlag = false;
  //   }
  // }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.element.nativeElement.contains(event.target)) {
      this.clickFlag = false;
    }
  }

  selectedDropValue(selectedVal: any) {
    this.selectedValue = selectedVal;
    this.selectedDropdownValue.emit(this.selectedValue);
    // this.onChange(this.selectedValue);
    // this.onTouched();
    this.clickFlag = false;
    SearchDropdownComponent.openDropdown = null;
    this.cdr.detectChanges();  
  }

  toggleDrop(event: Event): void {
    event.stopPropagation();
    console.log('Before:', this.clickFlag);

    // close previously open dropdown
    if (SearchDropdownComponent.openDropdown && SearchDropdownComponent.openDropdown !== this) {
      SearchDropdownComponent.openDropdown.clickFlag = false;
    }

    this.clickFlag = !this.clickFlag;

    console.log('After toggle:', this.clickFlag);

    SearchDropdownComponent.openDropdown = this.clickFlag ? this : null;
    this.cdr.detectChanges();
  }

  filterValues(searchTerm: string) {
    if (!searchTerm) {
      this.filteredValues = [...this.values];
      return;
    }
    const lowerTerm = searchTerm.toLowerCase();
    this.filteredValues = this.values.filter(item => {
      if (typeof item === 'string') {
        return item.toLowerCase().includes(lowerTerm);
      } else if (this.displayField && item[this.displayField]) {
        return item[this.displayField].toLowerCase().includes(lowerTerm);
      }
      return false;
    });
  }

  // writeValue(value: any): void {
  //   this.selectedValue = value;
  // }

  // registerOnChange(fn: any): void {
  //   this.onChange = fn;
  // }

  // registerOnTouched(fn: any): void {
  //   this.onTouched = fn;
  // }

  // setDisabledState?(isDisabled: boolean): void {
  //   this.isDisabled = isDisabled;
  // }

}
