import { Directive, Input, ElementRef, Renderer2, HostListener, OnInit, RendererStyleFlags2, OnDestroy } from '@angular/core';

@Directive({
  selector: '[setTableColumnWidth]'
})
export class SetColumnWidthDirective implements OnInit, OnDestroy {
  isCheckboxColumnExists: boolean = false;
  isActionIconsExists: boolean = false;
  isStatusExists: boolean = false;

  private resizeObserver: ResizeObserver;

  constructor(private eleRef: ElementRef,
    private renderer: Renderer2) {
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
  }

  setCheckboxColumnWidth(td: any, checkboxColumnWidth: number) {
    this.renderer.setStyle(td, 'width', checkboxColumnWidth + 'px');
  }

  setActionIconsColumnWidth(td: any, actionIconsColumnWidth: number) {
    this.renderer.setStyle(td, 'width', actionIconsColumnWidth + 'px');
    this.renderer.addClass(td, 'text-truncate');
  }

  setOtherColumnsWidth(tableWidth: number, numberOfColumns: number, checkboxColumnWidth: number, actionIconsColumnWidth: number, td: any) {
    let availableWidth = tableWidth;
    let counter = 0;

    if (this.isCheckboxColumnExists) {
      counter = counter + 1;
      availableWidth = availableWidth - checkboxColumnWidth;
    }

    if (this.isActionIconsExists) {
      counter = counter + 1;
      availableWidth = availableWidth - actionIconsColumnWidth;
      // availableWidth = availableWidth - actionIconsColumnWidth - 100;
    }

    // availableWidth = (tableWidth - availableWidth < 100 ? tableWidth - 100 : availableWidth)
    this.renderer.setStyle(td, 'width', availableWidth / (numberOfColumns - counter) + 'px');
    this.renderer.addClass(td, 'text-truncate');
    const isStatusExists = td.className.includes('status-column');
    if (td.children.length && !isStatusExists) {
      this.renderer.setStyle(td.children[0], 'width', (availableWidth / (numberOfColumns - counter)) - 16 + 'px');
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
    this.isCheckboxColumnExists = this.eleRef.nativeElement.children[0].className.includes('checkbox-column');
    this.isActionIconsExists = this.eleRef.nativeElement.children[numberOfColumns - 1].className.includes('action-icons-column');

    const checkboxColumnWidth = 21;

    let actionIconsColumnWidth = 0;
    if (this.isActionIconsExists) {
      actionIconsColumnWidth = this.eleRef.nativeElement.children[numberOfColumns - 1].children.length * 50;
    }


    for (let td of this.eleRef.nativeElement.children) {
      // console.log('td : ', td.children[0].nodeName);
      if (td.className.includes('checkbox-column')) {
        this.setCheckboxColumnWidth(td, checkboxColumnWidth);
      } else if (td.className.includes('action-icons-column')) {
        this.setActionIconsColumnWidth(td, actionIconsColumnWidth);
      } else {
        this.setOtherColumnsWidth(tableWidth, numberOfColumns, checkboxColumnWidth, actionIconsColumnWidth, td);
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
    let observeEle;
    if (this.eleRef.nativeElement?.parentNode?.parentNode?.parentNode?.className?.includes('card-body')) {
      observeEle = this.eleRef.nativeElement.parentNode.parentNode.parentNode;
    } else {
      observeEle = this.eleRef.nativeElement?.parentNode?.parentNode?.parentNode?.parentNode;
    }
    let lastWidth: number | null = null;
    this.resizeObserver = new ResizeObserver((entries) => {
      let width = entries[0].contentRect.width;
      if (width == lastWidth) return;
      lastWidth = width;
      this.setTableWidth();
    });
    this.resizeObserver.observe(observeEle);
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
    let tr = this.eleRef.nativeElement;
    if (tr.children.length) {
      for (let index = 0; index < tr.children.length; index++) {
        if (tr.childNodes[index].classList.contains('text-truncate')) {
          if (tr.childNodes[index].scrollWidth > tr.childNodes[index].clientWidth) {
            this.renderer.removeClass(tr.childNodes[index], 'custom-tooltip-hide');
          } else {
            this.renderer.addClass(tr.childNodes[index], 'custom-tooltip-hide');
          }
        }
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
export class TruncateTextDirective implements OnInit, OnDestroy {
  checkboxColumnWidth: number = 0;
  isCheckboxColumnWidthExist: boolean = false;
  statusToggleColumnWidth: number = 0;
  isStatusToggleColumnWidthExist: boolean = false;
  actionIconsColumnWidth: number = 0;

  private resizeObserver: ResizeObserver;

  constructor(private eleRef: ElementRef,
    private renderer: Renderer2) {
  }

  ngOnInit() { }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
  }

  showElemTooltip(elem: HTMLElement) {
    if (elem.children.length) {
      if (elem.children[0].scrollWidth > elem.children[0].clientWidth) {
        this.renderer.removeClass(elem, 'custom-tooltip-hide');
      } else {
        this.renderer.addClass(elem, 'custom-tooltip-hide');
      }
    }
  }

  getWidthClass(elem: HTMLElement): string {
    const classNames: string[] = elem.className.split(' ');
    let widthClass = null;
    for (let i = 0; i < classNames.length; i++) {
      let k = classNames[i].match('tdw-') || classNames[i].match('tdsw-');
      if (k) {
        widthClass = k.input;
        break;
      }
    }
    return widthClass;
  }

  getColumnWidthPercentage(elem: HTMLElement) {
    let columnClass = this.getWidthClass(elem);
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

    const trChildElemtCount = tr.childElementCount;
    const columnsWidth = tableWidth - this.checkboxColumnWidth - this.statusToggleColumnWidth - this.actionIconsColumnWidth;

    tr.childNodes.forEach(td => {
      let column = td as HTMLElement;
      if (!column.className) {
        return;
      }
      const hasExcludedClass = (this.isCheckboxColumnWidthExist && column.className.includes('checkbox-column')) || (this.isStatusToggleColumnWidthExist && column.className.includes('status-toggle-column')) || column.className.includes('action-icons-column');
      if (!hasExcludedClass) {
        const conlumnWidthPercentage = this.getColumnWidthPercentage(column);
        if (conlumnWidthPercentage) {
          const columnWidth = conlumnWidthPercentage * (columnsWidth / 100);
          this.renderer.setStyle(column, 'width', columnWidth + 'px');
          this.renderer.addClass(column, 'text-truncate');

          if (column.hasChildNodes() && column.children[0]) {
            if (column.children[0].className.includes('has-sub')) {
              let widthAvailable = columnWidth - 16;
              let clmn = column.children[0] as HTMLElement;
              clmn.childNodes.forEach(c => {
                let cnode = c as HTMLElement;
                if (cnode.className) {
                  const nodeWidthPercentage = this.getColumnWidthPercentage(cnode);
                  this.renderer.setStyle(cnode, 'display', 'inline-block');
                  if (nodeWidthPercentage) {
                    const cnodeWidth = nodeWidthPercentage * (widthAvailable / 100);
                    this.renderer.setStyle(cnode, 'width', cnodeWidth + 'px');
                    this.renderer.addClass(cnode, 'text-truncate');
                    if (cnode.children[0]) {
                      this.renderer.addClass(cnode.children[0], 'text-truncate');
                    }
                    this.showElemTooltip(cnode);
                  }
                }
              })
            } else {
              this.renderer.setStyle(column.children[0], 'width', (columnWidth - 16) + 'px');
              this.renderer.addClass(column.children[0], 'text-truncate');
              this.showElemTooltip(column);
            }
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
        this.actionIconsColumnWidth = lastTD.childElementCount * 35;
        this.renderer.setStyle(lastTD, 'width', this.actionIconsColumnWidth + 'px', RendererStyleFlags2.Important);
        this.renderer.addClass(lastTD, 'text-truncate');
      }

      let firstTD = tr.children[0] as HTMLElement;
      if (firstTD.className.includes('checkbox-column')) {
        this.checkboxColumnWidth = 21;
        this.isCheckboxColumnWidthExist = true;
        this.renderer.setStyle(firstTD, 'width', this.checkboxColumnWidth + 'px');
      }

      for (const td of Array.from(tr.children)) {
        if (td.className && td.className.includes('status-toggle-column')) {
          this.statusToggleColumnWidth = 130;
          this.isStatusToggleColumnWidthExist = true;
          this.renderer.setStyle(td, 'width', this.statusToggleColumnWidth + 'px');
          break;
        }
      }

      this.setColumnWidth()
    }
  }

  ngAfterViewInit() {
    this.setTableandTrWidth();
    let observeEle;
    if (this.eleRef.nativeElement?.parentNode?.parentNode?.parentNode?.className?.includes('card-body')) {
      observeEle = this.eleRef.nativeElement.parentNode.parentNode.parentNode;
    } else {
      observeEle = this.eleRef.nativeElement?.parentNode?.parentNode?.parentNode?.parentNode;
    }
    let lastWidth: number | null = null;
    this.resizeObserver = new ResizeObserver((entries) => {
      let width = entries[0].contentRect.width;
      if (width == lastWidth) return;
      lastWidth = width;
      this.setTableandTrWidth();
    });
    this.resizeObserver.observe(observeEle);
  }

  @HostListener('window:resize')
  resized() {
    this.setTableandTrWidth();
  }
}

@Directive({
  selector: '[nodeTooltip]'
})
export class NodeTooltipDirective implements OnInit {
  @Input() tooltipText: string = '';

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) { }

  ngOnInit() {
    this.checkTruncation();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkTruncation();
  }

  private checkTruncation() {
    const element = this.el.nativeElement;

    // Check if text is truncated
    const isTruncated = element.clientWidth < element.scrollWidth;
    if (isTruncated) {
      // if (this.tooltipText) {
      //   this.renderer.setAttribute(element, 'title', this.tooltipText);
      // } else {
      //   this.renderer.setAttribute(element, 'title', element.textContent);
      // }
      this.renderer.removeClass(element, 'custom-tooltip-hide');
    } else {
      // Remove title if not truncated
      // this.renderer.removeAttribute(element, 'title');
      this.renderer.addClass(element, 'custom-tooltip-hide');
    }
  }
}