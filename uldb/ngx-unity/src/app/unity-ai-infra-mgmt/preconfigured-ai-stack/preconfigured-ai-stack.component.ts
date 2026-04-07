import { Component, OnDestroy, OnInit } from '@angular/core';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AiStack } from './preconfigured-ai-stack.constants';
import { PreconfiguredAiStackService } from './preconfigured-ai-stack.service';

@Component({
  selector: 'preconfigured-ai-stack',
  templateUrl: './preconfigured-ai-stack.component.html',
  styleUrls: ['./preconfigured-ai-stack.component.scss'],
  providers: [PreconfiguredAiStackService]
})
export class PreconfiguredAiStackComponent implements OnInit, OnDestroy {
  private ngUnsubscribe = new Subject<void>();

  filteredStacks: AiStack[] = [];
  categories: string[] = [];
  activeCategory = 'All';
  searchQuery = '';
  loading = true;

  private stacks: AiStack[] = [];

  constructor(private service: PreconfiguredAiStackService,
    private notification: AppNotificationService) { }

  ngOnInit(): void {
    forkJoin({
      categories: this.service.getFilterCategories(),
      stacks: this.service.getAiStacks()
    })
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(({ categories, stacks }) => {
        this.categories = categories;
        this.stacks = stacks;
        this.filteredStacks = stacks;
        this.loading = false;
      });
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  onSearchInput(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  selectCategory(category: string): void {
    this.activeCategory = category;
    this.applyFilters();
  }

  deploy(stack: AiStack): void {
    this.service.deployStack(stack.id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (success) => {
          if (success) {
            this.notification.success(new Notification(`${stack.title} deployed successfully.`));
          } else {
            this.notification.error(new Notification(`Failed to deploy ${stack.title}.`));
          }
        },
        error: () => {
          this.notification.error(new Notification(`Failed to deploy ${stack.title}. Please try again.`));
        }
      });
  }

  private applyFilters(): void {
    const query = this.searchQuery.toLowerCase();
    this.filteredStacks = this.stacks.filter(stack => {
      const matchCategory = this.activeCategory === 'All' || stack.category === this.activeCategory;
      const matchSearch = !query
        || stack.title.toLowerCase().includes(query)
        || stack.description.toLowerCase().includes(query);
      return matchCategory && matchSearch;
    });
  }

}
