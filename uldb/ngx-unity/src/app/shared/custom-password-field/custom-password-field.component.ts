import { Component, ElementRef, forwardRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'custom-password-field',
  templateUrl: './custom-password-field.component.html',
  styleUrls: ['./custom-password-field.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomPasswordFieldComponent),
      multi: true,
    }
  ],
})
export class CustomPasswordFieldComponent implements OnInit, ControlValueAccessor {
  @ViewChild('customField') customField: ElementRef;
  hidden: boolean = true;
  icon: 'fa-eye' | 'fa-eye-slash' = 'fa-eye';

  value!: string;
  @Input() isDisabled: boolean = false;
  @Input() options?: { id?: string; placeholder?: string; errors?: any, class?: string };

  onChange!: (value: string) => void;
  onTouched!: () => void;

  constructor(private renderer: Renderer2) { }

  writeValue(obj: any): void {
    this.value = obj;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  ngOnInit(): void {
    this.setIcon();
  }

  getClass() {
    return {
      'is-invalid': this.options.errors,
      [this.options.class]: !!this.options.class
    };
  }

  setIcon() {
    if (this.hidden) {
      this.icon = 'fa-eye';
    } else {
      this.icon = 'fa-eye-slash';
    }
  }

  toggleView() {
    this.hidden = !this.hidden;
    this.setIcon();
  }
}
