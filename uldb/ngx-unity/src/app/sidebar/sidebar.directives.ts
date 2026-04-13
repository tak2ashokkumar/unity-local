import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, HostBinding, HostListener, Inject, Injectable, Input, OnInit, Renderer2 } from '@angular/core';

const SIDEBAR_CSS_CLASSES: string[] = [
    'sidebar-show',
    'sidebar-sm-show',
    'sidebar-md-show',
    'sidebar-lg-show',
    'sidebar-xl-show'
];

@Injectable({ providedIn: 'root' })
export class ClassToggler {

    constructor(
        @Inject(DOCUMENT) private readonly document: Document,
        private renderer: Renderer2) { }

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

@Directive({
    selector: '[appSidebarToggler]',
    providers: [ClassToggler]
})
export class SidebarToggleDirective implements OnInit {
    @Input('appSidebarToggler') breakpoint: string;
    private bp: string;

    constructor(private classToggler: ClassToggler) { }

    ngOnInit(): void {
        this.bp = this.breakpoint;
    }

    @HostListener('click', ['$event'])
    toggleOpen($event: Event): void {
        $event.preventDefault();
        const cssClass = this.bp ? `sidebar-${this.bp}-show` : SIDEBAR_CSS_CLASSES[0];
        this.classToggler.toggleClasses(cssClass, SIDEBAR_CSS_CLASSES);
    }
}

@Directive({
    selector: '[appSidebarMinimizer]'
})
export class SidebarMinimizeDirective {
    constructor(
        @Inject(DOCUMENT) private readonly document: Document,
        private renderer: Renderer2,
    ) { }

    @HostListener('click', ['$event'])
    toggleOpen($event: Event): void {
        $event.preventDefault();
        const body = this.document.body;
        body.classList.contains('sidebar-minimized')
            ? this.renderer.removeClass(body, 'sidebar-minimized')
            : this.renderer.addClass(body, 'sidebar-minimized');
    }
}

@Directive({
    selector: '[appMobileSidebarToggler]'
})
export class MobileSidebarToggleDirective {
    constructor(
        @Inject(DOCUMENT) private readonly document: Document,
        private renderer: Renderer2,
    ) { }

    @HostListener('click', ['$event'])
    toggleOpen($event: Event): void {
        $event.preventDefault();
        const body = this.document.body;
        body.classList.contains('sidebar-show')
            ? this.renderer.removeClass(body, 'sidebar-show')
            : this.renderer.addClass(body, 'sidebar-show');
    }
}

@Directive({
    selector: '[appSidebarClose]'
})
export class SidebarOffCanvasCloseDirective {
    constructor(
        @Inject(DOCUMENT) private readonly document: Document,
        private renderer: Renderer2) { }

    @HostListener('click', ['$event'])
    toggleOpen($event: Event): void {
        $event.preventDefault();
        const body = this.document.body;
        if (body.classList.contains('sidebar-off-canvas')) {
            body.classList.contains('sidebar-show')
                ? this.renderer.removeClass(body, 'sidebar-show')
                : this.renderer.addClass(body, 'sidebar-show');
        }
    }
}

@Directive({
    selector: '[appBrandMinimizer]'
})
export class BrandMinimizeDirective {
    constructor(
        @Inject(DOCUMENT) private readonly document: Document,
        private renderer: Renderer2,
    ) { }

    @HostListener('click', ['$event'])
    toggleOpen($event: Event): void {
        $event.preventDefault();
        const body = this.document.body;
        body.classList.contains('brand-minimized')
            ? this.renderer.removeClass(body, 'brand-minimized')
            : this.renderer.addClass(body, 'brand-minimized');
    }
}

@Directive({
    selector: '[appHtmlAttr]'
})
export class AppHtmlAttrDirective implements OnInit {

    @Input() appHtmlAttr: { [key: string]: any };

    constructor(private renderer: Renderer2,
        private el: ElementRef) { }

    ngOnInit(): void {
        const attribs = this.appHtmlAttr;
        if (!attribs) { return; }
        Object.keys(attribs).forEach(attr => {
            if (attr === 'style' && typeof attribs[attr] === 'object') {
                this.setStyle(attribs[attr]);
            } else if (attr === 'class') {
                this.addClass(attribs[attr]);
            } else {
                this.setAttrib(attr, attribs[attr]);
            }
        });
    }

    private setStyle(styles: { [key: string]: string }): void {
        Object.keys(styles).forEach(style => {
            this.renderer.setStyle(this.el.nativeElement, style, styles[style]);
        });
    }

    private addClass(classes: string | string[]): void {
        const classArray = Array.isArray(classes) ? classes : classes.split(' ');
        classArray.filter(c => c.length > 0).forEach(c => {
            this.renderer.addClass(this.el.nativeElement, c);
        });
    }

    private setAttrib(key: string, value: string): void {
        this.renderer.setAttribute(this.el.nativeElement, key, value);
    }
}

@Directive({
    selector: '[appSidebarDropdownToggle]'
})
export class SidebarDropdownToggleDirective {
    @Input('appSidebarDropdownToggle') expanded = false;

    @HostBinding('attr.aria-expanded')
    get ariaExpanded(): boolean {
        return this.expanded;
    }
}
