import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AceEditorService {

  constructor() { }
  
  private loaded: { [key: string]: boolean } = {};

  loadScript(path: string): Promise<void> {
    if (this.loaded[path]) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = path;
      script.async = true;
      script.onload = () => {
        this.loaded[path] = true;
        resolve();
      };
      script.onerror = () => reject(`Failed to load ${path}`);
      document.body.appendChild(script);
    });
  }
}
