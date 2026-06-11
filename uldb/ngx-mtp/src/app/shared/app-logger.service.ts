import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class Logger {

  constructor() { }

  log(msg: any) {
    if (!environment.production) {
      console.log(msg);
    }
  }

}
