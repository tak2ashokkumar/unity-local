import { Injectable } from '@angular/core';

@Injectable()
export class UsfFunctionalService {

  constructor() { }
}

export const Categories = [
  { 'name': 'Compute', 'isSelected': true},
  { 'name': 'OS Config', 'isSelected': false},
  { 'name': 'Storage', 'isSelected': false},
]