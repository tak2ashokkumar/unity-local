import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BaseUrlService {

  constructor() { }

  getBaseUrl(): string {
    const origin = window.location.origin;

    const url = `${origin}/knowledge/`;
    return url;

    // //  Dev (local IPs like 10.x.x.x)
    // if (/^https?:\/\/10\./.test(origin)) {
    //   return "https://knowledge-stage.unitedlayer.com/";
    // }

    // // Alpha
    // if (origin.includes("upc-demo.unitedlayer.com")) {
    //   return "https://knowledge-stage.unitedlayer.com/";
    // }

    // //  Prod (UUID subdomain or unity-ams)
    // if (/unity\.unitedlayer\.com/.test(origin)) {
    //   return "https://knowledge.unitedlayer.com/"; // will match both <uuid>.unity.unitedlayer.com and unity-ams.unitedlayer.com
    // }

    // fallback (optional)
    // return 'https://knowledge-stage.unitedlayer.com/';
  }

}
