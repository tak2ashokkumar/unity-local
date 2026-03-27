import { Inject, Injectable, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ClassToggler {

    constructor(
        @Inject(DOCUMENT) private readonly document: Document,
        private renderer: Renderer2,
    ) { }

    removeClasses(newClassNames: string[]): boolean {
        const matchClasses = newClassNames.map(c => this.document.body.classList.contains(c));
        return matchClasses.indexOf(true) !== -1;
    }

    toggleClasses(toggle: string, classNames: string[]): void {
        const level = classNames.indexOf(toggle);
        const newClassNames = classNames.slice(0, level + 1);

        if (this.removeClasses(newClassNames)) {
            newClassNames.forEach(c => this.renderer.removeClass(this.document.body, c));
        } else {
            this.renderer.addClass(this.document.body, toggle);
        }
    }
}
