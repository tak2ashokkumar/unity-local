import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'unity-pdf-viewer',
  templateUrl: './unity-pdf-viewer.component.html',
  styleUrls: ['./unity-pdf-viewer.component.scss']
})
export class UnityPdfViewerComponent implements OnInit {

  @Input() pdfUrl: string;
  urlParams: string = '&pid=explorer&efh=false&a=v&chrome=false&embedded=true';
  url: SafeResourceUrl;
  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.sanitizeUrl();
  }

  sanitizeUrl() {
    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.pdfUrl + this.urlParams);
  }

}
