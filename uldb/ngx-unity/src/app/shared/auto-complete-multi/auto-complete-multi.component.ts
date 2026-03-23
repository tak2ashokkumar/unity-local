import { Component, ElementRef, forwardRef, HostListener, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { catchError, debounceTime, switchMap } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-auto-complete-multi',
  templateUrl: './auto-complete-multi.component.html',
  styleUrls: ['./auto-complete-multi.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AutoCompleteMultiComponent),
    multi: true
  }]
})
export class AutoCompleteMultiComponent implements OnInit, ControlValueAccessor {
  @Input() placeholder: string = '';
  @Input() apiFn: (query: string) => Observable<any[]> = () => of([]);

  inputControl = new FormControl('');
  options: any[] = [];
  selectedOptions: any[] = [];
  showDropdown = false;
  noResults = false;
  loading = false;

  private onChange = (_: any) => { };
  public onTouched = () => { };

  constructor(private eRef: ElementRef) { }

  ngOnInit() {
    this.inputControl.valueChanges.pipe(debounceTime(1000), switchMap(query => {
      const trimmed = query?.trim() || '';
      if (trimmed === '') {
        this.noResults = false;
        this.options = [];
        this.loading = false;
        return of([]);
      }

      this.loading = true;

      return this.apiFn(trimmed).pipe(
        catchError(err => {
          this.loading = false;
          return of([]);
        })
      );
    })
    ).subscribe(results => {
      this.options = results;
      this.noResults = this.inputControl.value?.trim() && results.length === 0;
      this.showDropdown = true;
      this.loading = false;
    });
  }

  @HostListener('document:click', ['$event.target'])
  onClickOutside(targetElement: HTMLElement) {
    const clickedInside = this.eRef.nativeElement.contains(targetElement);
    if (!clickedInside) {
      this.showDropdown = false;
      // Clear the typed input when dropdown is closed
      this.inputControl.setValue('', { emitEvent: false });
    }
  }

  isSelected(option: any): boolean {
    return this.selectedOptions.some(o => o.ip_address === option.ip_address);
  }

  toggleOption(option: any) {
    const index = this.selectedOptions.findIndex(o =>
      o.ip_address === option.ip_address ||
      o.name.toLowerCase() === option.name.toLowerCase()
    );

    if (index >= 0) {
      this.selectedOptions.splice(index, 1);
    } else {
      this.selectedOptions.push(option);
    }
    this.onChange(this.selectedOptions);
  }

  removeOption(option: any) {
    this.selectedOptions = this.selectedOptions.filter(o => o !== option);
    this.onChange(this.selectedOptions);
    this.showDropdown = true;
  }

  writeValue(value: any): void {
    if (Array.isArray(value)) {
      this.selectedOptions = [...value];
    } else {
      this.selectedOptions = [];
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
