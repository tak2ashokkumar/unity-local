import { Injectable } from '@angular/core';
import { AppSpinnerComponent } from './app-spinner.component';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppSpinnerService {

  constructor() {
  }
  private spinnerCache = new Map<string, AppSpinnerCount>();
  private spinnerSource = new Subject<string>();
  spinnerToggled$: Observable<string> = this.spinnerSource.asObservable();

  register(spinner: AppSpinnerComponent) {
    if (this.spinnerCache.has(spinner.name)) {
      throw new Error(spinner.name + "Spinner is already registered!!");
    } else {
      this.spinnerCache.set(spinner.name, new AppSpinnerCount(spinner));
    }
  }

  unregister(spinnerName: string) {
    this.spinnerCache.delete(spinnerName);
  }

  start(spinnerName: string) {
    let spinner = this.spinnerCache.get(spinnerName);
    // console.log('Start B4', spinnerName, spinner.count)
    if (spinner) {
      if (spinner.count == 0) {
        spinner.count++;
        this.spinnerCache.set(spinnerName, spinner);
        this.spinnerSource.next(spinnerName);
      } else {
        this.spinnerCache.set(spinnerName, spinner);
        spinner.count++;
      }
    }
    // console.log('Start after', spinnerName, spinner.count)
  }

  stop(spinnerName: string) {
    let spinner = this.spinnerCache.get(spinnerName);
    // console.log('Stop B4', spinnerName, spinner.count)
    if (spinner) {
      if (spinner.count == 1) {
        spinner.count--;
        this.spinnerCache.set(spinnerName, spinner);
        this.spinnerSource.next(spinnerName);
      } else if (spinner.count > 1) {
        this.spinnerCache.set(spinnerName, spinner);
        spinner.count--;
      }
    }
    // console.log('Stop after', spinnerName, spinner.count)
  }

  /**
   * DO NOT USE THIS METHOD. FOR DEBUGGING PURPOSE ONLY 
   * @param spinnerName 
   */
  getSpinnerCount(spinnerName: string) {
    return this.spinnerCache.get(spinnerName).count;
  }

}
class AppSpinnerCount {
  count: number;
  spinnerComponent: AppSpinnerComponent;
  constructor(comp: AppSpinnerComponent) {
    this.count = 0;
    this.spinnerComponent = comp;
  }
}