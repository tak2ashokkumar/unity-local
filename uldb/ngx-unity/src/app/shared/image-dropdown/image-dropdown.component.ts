import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'image-dropdown',
  templateUrl: './image-dropdown.component.html',
  styleUrls: ['./image-dropdown.component.scss']
})
export class ImageDropdownComponent implements OnInit {

  @Input() values: any[];
  @Input() multiselect: boolean;
  @Input() defaultLabel: string;
  @Input() imageWithText: boolean;
  @Input() onlyImage: boolean;
  @Input() editCaseImageValue: any;
  @Output() selectedDropdownValue = new EventEmitter<any>();
  selectedValue: any;
  clickFlag: boolean = false;

  constructor() { }

  ngOnInit(): void {
    if(this.editCaseImageValue) {
      this.selectedValue =  this.editCaseImageValue;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const dropdownElement = document.querySelector('.dropdown');
    if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
      this.clickFlag = false;
    }
  }

  selectedDropValue(selectedVal: any) {
    this.selectedValue = selectedVal;
    this.selectedDropdownValue.emit(this.selectedValue);
  }

  toggleDrop(event: Event): void {
    this.clickFlag = !this.clickFlag;
    event.stopPropagation();
  }


}
