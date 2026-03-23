import { Directive, ElementRef, forwardRef, HostListener, Renderer2 } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: '[maskedFormControls]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MaskedFormControlsDirective),
      multi: true
    }
  ]
})
export class MaskedFormControlsDirective {
  private innerValue: any;
  private onChange: (_: any) => void;

  constructor(private el: ElementRef,
    private renderer: Renderer2,) { }

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

  setDisabledState?(isDisabled: boolean): void {
    this.renderer.setProperty(this.el.nativeElement, 'disabled', isDisabled);
  }

  private updateView(): void {
    this.renderer.setProperty(this.el.nativeElement, 'value', '*******************************');
  }

}

@Directive({
  selector: '[onloadMaskedFormControl]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OnLoadMaskedFormControlsDirective),
      multi: true
    }
  ]
})
export class OnLoadMaskedFormControlsDirective  {
  private prevValue: any;
  private onChange: (_: any) => void;
  private onTouched: () => void;
  constructor(private el: ElementRef,
    private renderer: Renderer2,) { }

  writeValue(value: any): void {
    console.log('write value : ', value);
    this.updateView();
  }

  registerOnChange(fn: any): void {
    // console.log('registerOnChange value');
    // this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    // console.log('registerOnTouched value');
    // this.onTouched = fn;
  }

  private updateView(): void {
    this.renderer.setProperty(this.el.nativeElement, 'value', '');
  }
}
