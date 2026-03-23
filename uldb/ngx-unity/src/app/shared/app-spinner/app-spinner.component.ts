import { Component, OnInit, Input, OnDestroy, SimpleChanges } from '@angular/core';
import { AppSpinnerService } from './app-spinner.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-spinner',
  templateUrl: './app-spinner.component.html',
  styleUrls: ['./app-spinner.component.scss']
})
export class AppSpinnerComponent implements OnInit, OnDestroy {

  @Input() name: string;
  @Input() width: number;
  show: boolean = false;
  baseClass: string = 'wave-spinner';
  childClass: string = 'rect';
  color: string = '#fff';
  position: string;
  zIndex: string;
  items: Array<number> = Array(5);
  private ngUnsubscribe = new Subject();
  constructor(private spinnerService: AppSpinnerService,
    private sanitizer: DomSanitizer,
    private modalService: BsModalService) {
  }

  ngOnInit() {
    if (!this.name) {
      throw new Error("Spinner must have a 'name' attribute.");
    }
    this.spinnerService.register(this);
    this.position = this.name == 'main' ? 'fixed' : 'absolute';
    this.zIndex = this.name == 'main' ? '2150' : '1950';
    this.spinnerService.spinnerToggled$.pipe(takeUntil(this.ngUnsubscribe)).subscribe((spinnerName: string) => {
      if (this.name === spinnerName) {
        this.show = !this.show;
      }
    });
    this.modalService.onShown.subscribe(() => {
      this.zIndex = this.name == 'main' ? '2190' : '1950';
    });
    this.modalService.onHidden.subscribe(() => {
      this.zIndex = this.name == 'main' ? '2150' : '1950';
    });
  }

  get wrapperPosition() {
    return this.sanitizer.bypassSecurityTrustStyle(this.position);
  }

  get wrapperwidth() {
    return this.sanitizer.bypassSecurityTrustStyle("calc(100% - " + this.width + "px)");
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
    this.spinnerService.unregister(this.name);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.width = changes['width'] ? changes['width'].currentValue : 0;
  }
}