import { Directive, Input, ElementRef, Renderer2, HostListener, OnInit, RendererStyleFlags2 } from '@angular/core';

@Directive({
  selector: '[setTableColumnWidth]'
})
export class SetColumnWidthDirective implements OnInit {
  isActionIconsExists: boolean = false;
  isStatusExists: boolean = false;

  constructor(private eleRef: ElementRef,
    private renderer: Renderer2) {
  }

  ngOnInit() { }

  setActionIconsColumnWidth(td: any, actionIconsColumnWidth: number) {
    this.renderer.setStyle(td, 'width', actionIconsColumnWidth + 'px');
    this.renderer.addClass(td, 'text-truncate');
  }

  setOtherColumnsWidth(tableWidth: number, numberOfColumns: number, actionIconsColumnWidth: number, td: any) {
    let WidthWithoutStatusAndActionIcons = tableWidth;
    let counter = 0;

    if (this.isActionIconsExists) {
      counter = counter + 1;
      WidthWithoutStatusAndActionIcons = WidthWithoutStatusAndActionIcons - actionIconsColumnWidth;
      // WidthWithoutStatusAndActionIcons = WidthWithoutStatusAndActionIcons - actionIconsColumnWidth - 100;
    }

    // WidthWithoutStatusAndActionIcons = (tableWidth - WidthWithoutStatusAndActionIcons < 100 ? tableWidth - 100 : WidthWithoutStatusAndActionIcons)
    this.renderer.setStyle(td, 'width', WidthWithoutStatusAndActionIcons / (numberOfColumns - counter) + 'px');
    this.renderer.addClass(td, 'text-truncate');
    const isStatusExists = td.className.includes('status-column');
    if (td.children.length && !isStatusExists) {
      this.renderer.setStyle(td.children[0], 'width', (WidthWithoutStatusAndActionIcons / (numberOfColumns - counter)) - 16 + 'px');
      this.renderer.addClass(td.children[0], 'text-truncate');

      if (td.childNodes[0].scrollWidth > td.childNodes[0].clientWidth) {
        this.renderer.removeClass(td, 'custom-tooltip-hide');
      } else {
        this.renderer.addClass(td, 'custom-tooltip-hide');
      }
    }
  }

  setColumnWidth(tableWidth: number) {
    const numberOfColumns = this.eleRef.nativeElement.children.length;
    this.isActionIconsExists = this.eleRef.nativeElement.children[numberOfColumns - 1].className.includes('action-icons-column');

    let actionIconsColumnWidth = 0;
    if (this.isActionIconsExists) {
      actionIconsColumnWidth = this.eleRef.nativeElement.children[numberOfColumns - 1].children.length * 50;
    }

    for (let td of this.eleRef.nativeElement.children) {
      // console.log('td : ', td.children[0].nodeName);
      if (td.className.includes('action-icons-column')) {
        this.setActionIconsColumnWidth(td, actionIconsColumnWidth);
      } else {
        this.setOtherColumnsWidth(tableWidth, numberOfColumns, actionIconsColumnWidth, td);
      }
    }
  }

  setTableWidth() {
    // console.log('ele : ', this.eleRef);
    let cardBodyWidth = 0;
    if (this.eleRef.nativeElement.parentNode.parentNode.parentNode.className.includes('card-body')) {
      cardBodyWidth = this.eleRef.nativeElement.parentNode.parentNode.parentNode.clientWidth;
    } else {
      cardBodyWidth = this.eleRef.nativeElement.parentNode.parentNode.parentNode.parentNode.clientWidth;
    }
    const tableWidth = cardBodyWidth - 32;
    this.renderer.setStyle(this.eleRef.nativeElement, 'width', tableWidth);

    this.setColumnWidth(tableWidth)
  }

  ngAfterViewInit() {
    this.setTableWidth();
  }

  @HostListener('window:resize')
  resized() {
    this.setTableWidth();
  }
}

@Directive({
  selector: '[elementTooltip]'
})
export class ElementTooltipDirective implements OnInit {
  // @Input('truncateText') columnPercent: number;
  constructor(private eleRef: ElementRef,
    private renderer: Renderer2) {
  }

  ngOnInit() { }

  showElemTooltip() {
    let td = this.eleRef.nativeElement;
    if (td.children.length) {
      if (td.childNodes[0].scrollWidth > td.childNodes[0].clientWidth) {
        this.renderer.removeClass(td, 'custom-tooltip-hide');
      } else {
        this.renderer.addClass(td, 'custom-tooltip-hide');
      }
    }
  }

  ngAfterViewInit() {
    this.showElemTooltip();
  }
}

@Directive({
  selector: '[truncateText]'
})
export class TruncateTextDirective implements OnInit {
  actionIconsColumnWidth: number = 0;
  constructor(private eleRef: ElementRef,
    private renderer: Renderer2) {
  }

  ngOnInit() { }

  showElemTooltip(td: HTMLElement) {
    if (td.children.length) {
      if (td.children[0].scrollWidth > td.children[0].clientWidth) {
        this.renderer.removeClass(td, 'custom-tooltip-hide');
      } else {
        this.renderer.addClass(td, 'custom-tooltip-hide');
      }
    }
  }

  getWidthClass(td: HTMLElement): string {
    const classNames: string[] = td.className.split(' ');
    let widthClass = null;
    for (let i = 0; i < classNames.length; i++) {
      let k = classNames[i].match('tdw-');
      if (k) {
        widthClass = k.input;
        break;
      }
    }
    return widthClass;
  }

  getColumnWidthPercentage(td: HTMLElement) {
    let columnClass = this.getWidthClass(td);
    if (columnClass) {
      columnClass = columnClass.split('-').getLast();
      return Number(columnClass);
    } else {
      return null;
    }
  }

  setColumnWidth() {
    const tableWidth = this.getCardBodyWidth() - 32;
    const tr = this.eleRef.nativeElement as HTMLElement;
    this.renderer.setStyle(tr, 'width', tableWidth);

    const columnsWidth = tableWidth - this.actionIconsColumnWidth;
    tr.childNodes.forEach(td => {
      let column = td as HTMLElement;
      if (column.className && !column.className.includes('action-icons-column')) {
        const conlumnWidthPercentage = this.getColumnWidthPercentage(column);
        if (conlumnWidthPercentage) {
          const columnWidth = conlumnWidthPercentage * (columnsWidth / 100);
          this.renderer.setStyle(column, 'width', columnWidth + 'px');
          this.renderer.addClass(column, 'text-truncate');

          if (column.hasChildNodes() && column.children[0]) {
            this.renderer.setStyle(column.children[0], 'width', (columnWidth - 16) + 'px');
            this.renderer.addClass(column.children[0], 'text-truncate');
            this.showElemTooltip(column);
          }
        }
      }
    })
  }

  getCardBodyWidth() {
    if (this.eleRef.nativeElement.parentNode.parentNode.parentNode.className.includes('card-body')) {
      return this.eleRef.nativeElement.parentNode.parentNode.parentNode.clientWidth;
    } else {
      return this.eleRef.nativeElement.parentNode.parentNode.parentNode.parentNode.clientWidth;
    }
  }

  setTableandTrWidth() {
    const tr = this.eleRef.nativeElement as HTMLElement;
    if (tr.hasChildNodes()) {
      let lastTD = tr.children[tr.childElementCount - 1] as HTMLElement;
      if (lastTD.className.includes('action-icons-column')) {
        this.actionIconsColumnWidth = lastTD.childElementCount * 50;
        this.renderer.setStyle(lastTD, 'width', this.actionIconsColumnWidth + 'px', RendererStyleFlags2.Important);
        this.renderer.addClass(lastTD, 'text-truncate');
      }
      this.setColumnWidth()
    }
  }

  ngAfterViewInit() {
    this.setTableandTrWidth();
  }

  @HostListener('window:resize')
  resized() {
    this.setTableandTrWidth();
  }
}