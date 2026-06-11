import { DatePipe } from '@angular/common';
import { Directive, ElementRef, HostListener, Renderer2, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { UserInfoService } from '../user-info.service';

@Directive({
  selector: '[formControlNameDateFormatter]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormControlNameDateFormatterDirective),
      multi: true
    }
  ]
})
export class FormControlNameDateFormatterDirective {
  private innerValue: any;
  private onChange: (_: any) => void;
  private onTouched: () => void;
  private datePipe: DatePipe;

  constructor(private el: ElementRef,
    private renderer: Renderer2,
    private userInfo: UserInfoService) {
    this.datePipe = new DatePipe(environment.dateLocateForAngularDatePipe);
  }

  @HostListener('input', ['$event.target.value'])
  onInput(value: any) {
    this.innerValue = value;
    this.updateView();
    this.onChange(this.innerValue);
  }

  writeValue(value: any): void {
    this.innerValue = value;
    this.updateView();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.renderer.setProperty(this.el.nativeElement, 'disabled', isDisabled);
  }

  private updateView(): void {
    const classList = <DOMTokenList>this.el.nativeElement.classList;
    let formattedValue = '';
    if (classList.contains('date')) {
      formattedValue = this.innerValue ? this.datePipe.transform(this.innerValue.replace(/\s/g, "T"), 'MMM dd, y') : null;
    } else {
      formattedValue = this.innerValue ? this.datePipe.transform(this.innerValue.replace(/\s/g, "T"), environment.unityDateFormat) : null;
    }
    this.renderer.setProperty(this.el.nativeElement, 'value', formattedValue);
  }

}
