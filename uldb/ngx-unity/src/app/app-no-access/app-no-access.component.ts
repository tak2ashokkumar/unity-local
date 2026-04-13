import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-no-access',
  templateUrl: './app-no-access.component.html',
  styleUrls: ['./app-no-access.component.scss']
})
export class AppNoAccessComponent implements OnInit, OnDestroy {
  constructor(@Inject(DOCUMENT) private document: Document) {}

  ngOnInit(): void {
    this.document.body.classList.add('no-access-page');
  }

  ngOnDestroy(): void {
    this.document.body.classList.remove('no-access-page');
  }
}
