import { Component, OnDestroy, OnInit } from '@angular/core';
import { Categories } from './usf-functional.service';

@Component({
  selector: 'usf-functional',
  templateUrl: './usf-functional.component.html',
  styleUrls: ['./usf-functional.component.scss']
})
export class UsfFunctionalComponent implements OnInit, OnDestroy {

  selectedCategories: string[] = ['Compute'];
  categories = Categories;
  activeForm: string = 'Compute'

  constructor() { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  manageCategory(selectedCategory: any) {
    selectedCategory.isSelected = !selectedCategory.isSelected;
    this.selectedCategories = this.categories.filter(c => c.isSelected).map(c => c.name);
    this.activeForm = this.selectedCategories.getFirst();
  }
}
