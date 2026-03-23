import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent, HttpResponse, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { ActivatedRoute } from '@angular/router';
import { Injectable } from "@angular/core";
declare var csrfTokenObject: any;


export const Handle404Header = new HttpHeaders().set('x-handle404', 'true');

@Injectable()
export class AppHttpInterceptor implements HttpInterceptor {

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (req.method == 'POST' || req.method == 'DELETE') {
            let token = new csrfTokenObject();
            req = req.clone({
                headers: req.headers.set('X-CSRF-Token', token.csrf_token)
            });
        }
        if (req.headers.has('x-handle404')) {
            return next.handle(req).pipe(
                catchError((error: any) => {
                    // if (error instanceof ErrorEvent) {
                    //     console.log(error)
                    // } else
                    if (error instanceof HttpErrorResponse) {
                        if (error.status == 404) {
                            let res = new HttpResponse({ body: null, status: 200, statusText: 'Thrown 404 in server, updated in interceptor' });
                            return of(res);
                        }
                    }
                    return throwError(error);
                })
            );
        }
        return next.handle(req).pipe(tap(() => { },
            (err: any) => {
                if (err instanceof HttpErrorResponse) {
                    if (err.status !== 401 && err.status !== 403) {
                        return;
                    } else {
                        window.location.href = 'account/login/?next=/main' + window.location.hash;
                    }
                }
            }));
    }
}