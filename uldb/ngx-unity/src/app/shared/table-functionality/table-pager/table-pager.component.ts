import { Component, OnInit, Input, Output, EventEmitter, ElementRef, Renderer2, ChangeDetectorRef, SimpleChanges } from '@angular/core';
import { SearchCriteria } from '../search-criteria';

@Component({
  selector: 'table-pager',
  templateUrl: './table-pager.component.html',
  styleUrls: ['./table-pager.component.scss']
})
export class TablePagerComponent implements OnInit {

  firstText: string = "«";
  lastText: string = "»";
  previousText: string = "‹";
  nextText: string = "›";
  boundaryLinks: boolean = true;
  directionLinks: boolean = true;
  rotate: boolean = false;
  adjacents: number = 2;
  pages: Array<any>;
  private totalPages: number = 0;
  private maxSize: number = 8;

  @Input('totalCount') totalCount: number = 0;
  @Input('pageNo') pageNo: number = 0;
  @Input('pageSize') pageSize: number = 0;
  @Input('minPager') minPager?: boolean = false;
  @Output() pageChange: EventEmitter<any> = new EventEmitter<any>();

  constructor() {
  }

  ngOnInit() {
    if (!this.pageSize && this.pageSize != 0) {
      this.pageSize = 10;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.pages = this.getPages(this.pageNo, this.calculateTotalPages());
    if (changes.totalCount && !changes.totalCount.isFirstChange()) {
      setTimeout(() => {
        if (this.pageNo > this.pages.length) {
          this.pageNo--;
        }
        this.pageChange.emit(this.pageNo);
      }, 0);
    }
  }

  calculateTotalPages() {
    let totalPages = this.pageSize < 1 ? 1 : Math.ceil(this.totalCount / this.pageSize);
    this.totalPages = Math.max(totalPages || 0, 1);
    return this.totalPages;
  }

  selectPage(page: number) {
    if (this.pageNo !== page && page > 0 && page <= this.totalPages) {
      this.pageNo = page;
      this.pages = this.getPages(this.pageNo, this.totalPages);
      this.pageChange.emit(page);
    }
  }

  getText(key: string): string {
    return this[key + 'Text'] || this[key + 'Text'];
  }

  noPrevious(): boolean {
    return this.pageNo === 1;
  }

  noNext(): boolean {
    return this.pageNo === this.totalPages;
  }

  makePage(number: number, text: string, isActive: boolean): any {
    return {
      number: number,
      text: text,
      active: isActive
    };
  }

  getPages(currentPage: number, totalPages: number) {
    let pages = [];
    let startPage: number = 1, endPage: number = totalPages;
    if (this.minPager) {
      startPage = this.pageNo > startPage ? this.pageNo - startPage : this.pageNo;
      endPage = this.pageNo < endPage ? this.pageNo + 1 : this.pageNo;
      for (let num = startPage; num <= endPage; num++) {
        let page = this.makePage(num, num.toString(), num === currentPage);
        pages.push(page);
      }
      return pages;
    }
    let isMaxSized: boolean = this.maxSize < totalPages;
    let calcedMaxSize: number = isMaxSized ? this.maxSize : 0;
    // If we want to limit the maxSize within the constraint of the adjacents, we can do so like this.
    // This adjusts the maxSize based on current page and current page and whether the front-end adjacents are added.
    if (isMaxSized && !this.rotate && this.adjacents > 0 && currentPage >= (calcedMaxSize - 1) && totalPages >= (calcedMaxSize + (this.adjacents * 2))) {
      calcedMaxSize = this.maxSize - this.adjacents;
    }
    // Adjust max size if we are going to add the adjacents
    if (isMaxSized && !this.rotate && this.adjacents > 0) {
      let tempStartPage = ((Math.ceil(currentPage / calcedMaxSize) - 1) * calcedMaxSize) + 1;
      let tempEndPage = Math.min(tempStartPage + calcedMaxSize - 1, totalPages);
      if (tempEndPage < totalPages) {
        if (totalPages - this.adjacents > currentPage) { // && currentPage > adjacents) {
          calcedMaxSize = calcedMaxSize - this.adjacents;
        }
      }
    }
    // recompute if maxSize
    if (isMaxSized) {
      if (this.rotate) {
        // Current page is displayed in the middle of the visible ones
        startPage = Math.max(currentPage - Math.floor(calcedMaxSize / 2), 1);
        endPage = startPage + calcedMaxSize - 1;
        // Adjust if limit is exceeded
        if (endPage > totalPages) {
          endPage = totalPages;
          startPage = endPage - calcedMaxSize + 1;
        }
      } else {
        // Visible pages are paginated with maxSize
        startPage = ((Math.ceil(currentPage / calcedMaxSize) - 1) * calcedMaxSize) + 1;
        // Adjust last page if limit is exceeded
        endPage = Math.min(startPage + calcedMaxSize - 1, totalPages);
      }
    }
    // Add page number links
    for (let num = startPage; num <= endPage; num++) {
      let page = this.makePage(num, num.toString(), num === currentPage);
      pages.push(page);
    }
    // Add links to move between page sets
    if (isMaxSized && !this.rotate) {
      if (startPage > 1) {
        let previousPageSet = this.makePage(startPage - 1, '...', false);
        pages.unshift(previousPageSet);
        if (this.adjacents > 0) {
          if (totalPages >= this.maxSize + (this.adjacents * 2)) {
            pages.unshift(this.makePage(2, '2', false));
            pages.unshift(this.makePage(1, '1', false));
          }
        }
      }
      if (endPage < totalPages) {
        let nextPageSet = this.makePage(endPage + 1, '...', false);
        let addedNextPageSet = false;
        if (this.adjacents > 0) {
          if (totalPages - this.adjacents > currentPage) { // && currentPage > adjacents) {
            let removedLast = false;
            addedNextPageSet = true;
            if (pages && pages.length > 1 && pages[pages.length - 1].number == totalPages - 1) {
              pages.splice(pages.length - 1, 1);
              removedLast = true;
            }
            pages.push(nextPageSet);
            if (removedLast || pages[pages.length - 1].number < totalPages - 2 || pages[pages.length - 2].number < totalPages - 2) {
              pages.push(this.makePage(totalPages - 1, (totalPages - 1).toString(), false));
            }

            pages.push(this.makePage(totalPages, (totalPages).toString(), false));
          }
        }
        if (!addedNextPageSet) {
          pages.push(nextPageSet);
        }
      }
    }
    return pages;
  }
}
