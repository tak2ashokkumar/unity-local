import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AI_STACKS, AiStack, FILTER_CATEGORIES } from './preconfigured-ai-stack.constants';

export { AI_STACKS };  // re-export so existing imports from this path still work

@Injectable()
export class PreconfiguredAiStackService {

  getFilterCategories(): Observable<string[]> {
    return of(FILTER_CATEGORIES);
  }

  getAiStacks(): Observable<AiStack[]> {
    return of(AI_STACKS).pipe(delay(300));
  }

  deployStack(stackId: string): Observable<boolean> {
    return of(true).pipe(delay(500));
  }
}