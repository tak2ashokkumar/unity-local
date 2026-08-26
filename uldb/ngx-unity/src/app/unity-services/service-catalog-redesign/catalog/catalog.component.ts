import { Component, ElementRef, HostListener, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { catalogListViewData, CatalogService } from './catalog.service';
import { AddToCartPayload, CartViewData, CatalogDetail, CatalogFilterChoices, CatalogFilterOption, CatalogItem, ConfigurationField, ConfigurationViewData, ModalTab, OverviewViewData, PricingViewData, RequirementsViewData, SlaViewData } from './catalog.type';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PAGE_SIZES, SearchCriteria } from 'src/app/shared/table-functionality/search-criteria';
import { finalize, takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { Subject, Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IMultiSelectSettings, IMultiSelectTexts } from 'src/app/shared/multiselect-dropdown/types';
import { FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { PaginatedResult } from 'src/app/shared/SharedEntityTypes/paginated.type';

@Component({
  selector: 'catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit {
  catalogs: CatalogItem[] = [];
  modalTabs: ModalTab[] = [];
  isCartPinned = false;
  isDetailsModalOpen = false;
  isChatPanelOpen = false;
  activeModalTab: string = 'overview';
  activeExploreTab: string = 'catalog';
  selectedCatalogItem: CatalogItem | null = null;
  currentCriteria: SearchCriteria;
  private ngUnsubscribe = new Subject();
  private catalogRequestSubscription: Subscription;
  viewCatalogsData: catalogListViewData[] = [];
  assetsBaseUrl = environment.assetsUrl;
  catalogUuid: string
  @ViewChild('confirmdelete') confirmdelete: ElementRef;
  taskDeleteModalRef: BsModalRef;

  selectedCatalogDetail: CatalogDetail | null = null;
  isDetailLoading = false;

  overviewData: OverviewViewData | null = null;
  pricingData: PricingViewData | null = null;
  slaData: SlaViewData | null = null;
  requirementsData: RequirementsViewData | null = null;

  isSidebarScrolling = false;
  @ViewChild('modalScrollContent') modalScrollContent: ElementRef<HTMLDivElement>;
  @ViewChildren('modalSection') modalSections: QueryList<ElementRef<HTMLDivElement>>;

  configurationFields: ConfigurationField[] = [];
  configForm: FormGroup;
  multiSelectModel: { [key: string]: any[] } = {};

  quantity = 1;

  cartData: CartViewData | null = null;
  isCartLoading = false;
  private cartLoaded = false;
  deletingItemUuid: string | null = null;

  effectivePrice = 0;

  isLoadingMore = false;
  hasMoreData = true;
  private readonly scrollThreshold = 150;
  private loadMoreSubscription?: Subscription;

  filterSettings: IMultiSelectSettings = {
    isSimpleArray: false,
    lableToDisplay: 'label',
    enableSearch: true,
    checkedStyle: 'fontawesome',
    buttonClasses: 'btn btn-default btn-block',
    dynamicTitleMaxItems: 1,
    displayAllSelectedText: true,
    showCheckAll: true,
    showUncheckAll: true,
    selectAsObject: false,
    keyToSelect: 'value'
  };

  channelsTypeSettings: IMultiSelectSettings = {
    ...this.filterSettings
  };

  typeTexts: IMultiSelectTexts = { defaultTitle: 'Select Options' };
  categoryTexts: IMultiSelectTexts = { defaultTitle: 'Category' };
  platformTexts: IMultiSelectTexts = { defaultTitle: 'Platform' };
  datacenterTexts: IMultiSelectTexts = { defaultTitle: 'Datacenter' };
  managementTypeTexts: IMultiSelectTexts = { defaultTitle: 'Management Type' };

  filterOptions: { [key: string]: CatalogFilterOption[] } = {
    datacenter: [],
    management_type: [],
    category: [],
    platform: []
  };

  constructor(private catalogService: CatalogService,
    private router: Router,
    private route: ActivatedRoute,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private modalService: BsModalService,
    private utilService: AppUtilityService,
    private fb: FormBuilder,
  ) {
    this.currentCriteria = {
      sortColumn: '',
      sortDirection: '',
      searchValue: '',
      pageNo: 1,
      pageSize: 16 as PAGE_SIZES,
      multiValueParam: {
        datacenter: [],
        management_type: [],
        category: [],
        platform: []
      }
    };
  }

  ngOnInit(): void {
    this.getCatalogs(true);
    this.getCatalogFilterChoices();
    this.modalTabs = this.catalogService.modalTabs;
    this.getCart();
  }

  onSearched(event: string) {
    this.currentCriteria.searchValue = event;
    this.currentCriteria.pageNo = 1;
    this.getCatalogs(true);
  }

  refreshData(pageNo: number) {
    this.currentCriteria.pageNo = pageNo;
    this.getCatalogs();
  }

  onFilterChange() {
    this.currentCriteria.pageNo = 1;
    this.getCatalogs(false);
  }

  onFilterSelectionChange(filterKey: string, selectedValues: any[]): void {
    this.currentCriteria.multiValueParam[filterKey] = selectedValues;
    this.onFilterChange();
  }

  get activeFilterCount(): number {
    return Object.keys(this.currentCriteria.multiValueParam || {})
      .reduce((count, key) => count + (this.currentCriteria.multiValueParam[key]?.length || 0), 0);
  }

  private getCatalogFilterChoices(): void {
    this.catalogService.getCatalogFilterChoices().pipe(takeUntil(this.ngUnsubscribe)).subscribe((choices: CatalogFilterChoices) => {
      Object.keys(this.filterOptions).forEach(key => {
        this.filterOptions[key] = choices[key] || [];
      });
    }, () => {
      this.notification.error(new Notification('Failed to load catalog filters'));
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const documentHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;

    // If the page content doesn't even overflow the viewport, there's nothing
    // to scroll toward — never treat that as "reached the bottom".
    const isScrollable = documentHeight > viewportHeight + this.scrollThreshold;
    if (!isScrollable) { return; }

    const scrollPosition = viewportHeight + window.scrollY;
    const atBottom = documentHeight - scrollPosition < this.scrollThreshold;
    if (atBottom && !this.isLoadingMore && this.hasMoreData) {
      this.loadMoreCatalogs();
    }
  }

  getCatalogs(showLoader: boolean = false) {
    this.catalogRequestSubscription?.unsubscribe();
    this.loadMoreSubscription?.unsubscribe();
    this.currentCriteria.pageNo = 1;
    this.hasMoreData = true;

    if (showLoader) {
      this.spinner.start('main');
    }

    this.catalogRequestSubscription = this.catalogService.getCatalogs(this.currentCriteria).pipe(
      takeUntil(this.ngUnsubscribe), finalize(() => {
        if (showLoader) {
          this.spinner.stop('main');
        }
      })
    ).subscribe(data => {
      this.catalogs = data.results;
      this.viewCatalogsData = this.catalogService.convertCatalogListToViewData(this.catalogs);
      this.hasMoreData = this.checkHasMore(data);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to get catalog list'));
    });
  }

  loadMoreCatalogs(): void {
    this.isLoadingMore = true;
    const nextCriteria = {
      ...this.currentCriteria,
      pageNo: this.currentCriteria.pageNo + 1
    };

    this.loadMoreSubscription = this.catalogService.getCatalogs(nextCriteria).pipe(takeUntil(this.ngUnsubscribe), finalize(() => this.isLoadingMore = false)
    ).subscribe(data => {
      this.currentCriteria.pageNo = nextCriteria.pageNo;
      this.catalogs = [...this.catalogs, ...data.results];
      const newViewData = this.catalogService.convertCatalogListToViewData(data.results);
      this.viewCatalogsData = [...this.viewCatalogsData, ...newViewData];
      this.hasMoreData = this.checkHasMore(data);
    }, (err: HttpErrorResponse) => {
      this.notification.error(new Notification('Failed to load more catalog items'));
    });
  }

  private checkHasMore(data: any): boolean {
    // Prefer an explicit signal from the API over inferring from page size.
    if (data.next !== undefined) { return !!data.next; }
    if (data.count !== undefined) {
      return this.catalogs.length < data.count; // after this.catalogs is updated
    }
    return (data.results || []).length === this.currentCriteria.pageSize;
  }

  frequencySuffix(frequency: string): string {
    return this.catalogService.frequencySuffix(frequency);
  }

  currencySymbol(currencyCode: string | null | undefined): string {
    return this.catalogService.getCurrencySymbol(currencyCode);
  }

  openConfigurationModal(item: CatalogItem): void {
    this.openDetailsModal(item, 'configuration');
  }

  /** TODO: open/close the catalog item details modal */
  openDetailsModal(catalogItem: CatalogItem, initialTab: string = 'overview'): void {
    this.selectedCatalogItem = catalogItem;
    this.isDetailsModalOpen = true;
    this.isDetailLoading = true;
    this.activeModalTab = initialTab;
    this.overviewData = this.pricingData = this.slaData = this.requirementsData = null;
    this.configurationFields = [];
    this.configForm = null;
    this.multiSelectModel = {};

    this.catalogService.getCatalogDetail(catalogItem.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (detail) => {
        this.selectedCatalogDetail = detail;
        this.isDetailLoading = false;

        this.overviewData = this.catalogService.convertToOverviewData(detail);
        this.pricingData = this.catalogService.convertToPricingData(detail);
        this.slaData = this.catalogService.convertToSlaData(detail);
        this.requirementsData = this.catalogService.convertToRequirementsData(detail);

        // ---- NEW: build configuration form ----
        this.configurationFields = detail.configuration || [];
        this.configForm = this.buildConfigForm(this.configurationFields);

        this.configurationFields = detail.configuration || [];
        this.configForm = this.buildConfigForm(this.configurationFields);

        // Calculate initial price
        this.quantity = detail.min_quantity && detail.min_quantity > 0
          ? detail.min_quantity
          : 1;

        this.calculateEffectivePrice();

        this.configForm.valueChanges
          .pipe(takeUntil(this.ngUnsubscribe))
          .subscribe(() => {
            this.calculateEffectivePrice();
          });

        // After the DOM renders the sections, jump to requested tab
        setTimeout(() => this.scrollToSection(initialTab));
      },
      () => {
        this.isDetailLoading = false;
        this.notification.error(new Notification('Failed to load catalog details'));
      }
    );
  }

  private readonly FREQUENCY_FACTOR = {
    Hourly: 24 * 30,
    Daily: 30,
    Monthly: 1,
    Yearly: 1 / 12
  };

  getPerUnitRate(cost: any): number {
    const rawRate = Number(cost.rate) || 0;
    const baseQty = Number(cost.base_quantity) > 0 ? Number(cost.base_quantity) : 1;
    const sourceFactor = this.FREQUENCY_FACTOR[cost.rate_frequency] ?? 1;
    const targetFactor = this.FREQUENCY_FACTOR[this.selectedCatalogDetail?.frequency] ?? 1;
    const monthlyRate = rawRate * sourceFactor;
    const adjustedRate = monthlyRate / targetFactor;
    return adjustedRate / baseQty;
  }

  calculateEffectivePrice(): void {
    if (!this.selectedCatalogDetail) {
      this.effectivePrice = 0;
      return;
    }
    let total = 0;
    for (const component of this.selectedCatalogDetail.cost_mapping || []) {
      if (component.source === 'Fixed') {
        total += Number(component.count || 0);
        continue;
      }
      if (component.source === 'Static') {
        total += this.getPerUnitRate(component) * Number(component.count || 0);
        continue;
      }
      if (component.source === 'Config') {
        const value = Number(
          this.configForm?.get(component.config_key)?.value
        );
        if (!isNaN(value)) {
          total += this.getPerUnitRate(component) * value;
        }
      }
    }
    total *= this.quantity;
    this.effectivePrice = Number(total.toFixed(2));
  }

  removeCartItem(line: any, event: Event): void {
    event.stopPropagation();
    if (!line?.uuid) {
      return;
    }
    this.catalogService.deleteCartItem(line.uuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      () => this.getCart(),
      () => this.notification.error(new Notification('Failed to remove item from cart'))
    );
  }

  closeDetailsModal(): void {
    this.isDetailsModalOpen = false;
    this.selectedCatalogItem = null;
    this.selectedCatalogDetail = null;
    this.overviewData = this.pricingData = this.slaData = this.requirementsData = null;
    this.configurationFields = [];
    this.configForm = null;
    this.multiSelectModel = {};
    this.activeModalTab = 'overview';
    this.quantity = 1;
  }

  // Sidebar link click -> smooth-scroll to that section, same as scrollToSection() in JS
  scrollToSection(key: string): void {
    const container = this.modalScrollContent?.nativeElement;
    const target = container?.querySelector<HTMLElement>(`#section_${key}`);
    if (!container || !target) return;

    this.isSidebarScrolling = true;
    this.activeModalTab = key;

    const topPos = target.offsetTop - container.offsetTop;
    container.scrollTo({ top: topPos, behavior: 'smooth' });

    setTimeout(() => { this.isSidebarScrolling = false; }, 500);
  }

  // Scroll handler on the right-hand content pane -> highlight nearest sidebar link
  onModalScroll(): void {
    if (this.isSidebarScrolling) return;
    const container = this.modalScrollContent?.nativeElement;
    if (!container || !this.modalSections) return;

    let closestKey: string | null = null;
    let minDistance = Infinity;
    const containerRect = container.getBoundingClientRect();

    this.modalSections.forEach(sectionRef => {
      const el = sectionRef.nativeElement;
      const rect = el.getBoundingClientRect();
      const dist = Math.abs(rect.top - containerRect.top - 20);
      if (dist < minDistance) {
        minDistance = dist;
        closestKey = el.id.replace('section_', '');
      }
    });

    if (closestKey) {
      this.activeModalTab = closestKey;
    }
  }


  setActiveModalTab(key: string): void {
    this.activeModalTab = key;
    if (!this.selectedCatalogDetail) return;

    switch (key) {
      case 'overview':
        this.overviewData = this.overviewData ?? this.catalogService.convertToOverviewData(this.selectedCatalogDetail);
        break;
      case 'pricing':
        this.pricingData = this.pricingData ?? this.catalogService.convertToPricingData(this.selectedCatalogDetail);
        break;
      case 'sla':
        this.slaData = this.slaData ?? this.catalogService.convertToSlaData(this.selectedCatalogDetail);
        break;
      case 'requirements':
        this.requirementsData = this.requirementsData ?? this.catalogService.convertToRequirementsData(this.selectedCatalogDetail);
        break;
    }
  }

  createCatalog() {
    this.router.navigate(['create'], { relativeTo: this.route })
  }

  editCatalog(catalogId: string) {
    this.router.navigate([`${catalogId}/update`], { relativeTo: this.route });
  }

  deleteCatalog(uuid: string) {
    this.catalogUuid = uuid;
    this.taskDeleteModalRef = this.modalService.show(this.confirmdelete, Object.assign({}, { class: '', keyboard: true, ignoreBackdropClick: true }));
  }

  // ================= CONFIGURATION FORM BUILDING =================

  private buildConfigForm(fields: ConfigurationField[]): FormGroup {
    const group: { [key: string]: any } = {};

    fields.forEach(field => {
      const validators = this.buildFieldValidators(field);
      let defaultValue: any = field.default ?? null;

      if (field.type === 'checkbox') {
        defaultValue = field.default === true || field.default === 'true';
      } else if (field.type === 'multiselect') {
        defaultValue = Array.isArray(field.default) ? field.default : [];
        this.multiSelectModel[field.key] = defaultValue;
      } else if (field.type === 'number' || field.type === 'range') {
        defaultValue = field.default != null && field.default !== ''
          ? Number(field.default)
          : (field.min != null ? field.min : 0);
      } else {
        defaultValue = field.default != null ? field.default : '';
      }

      group[field.key] = this.fb.control(
        { value: defaultValue, disabled: !!field.disabled },
        validators
      );
    });

    return this.fb.group(group);
  }

  private buildFieldValidators(field: ConfigurationField): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
    if (field.required) validators.push(Validators.required);
    if (field.min != null) validators.push(Validators.min(field.min));
    if (field.max != null) validators.push(Validators.max(field.max));

    (field.validators || []).forEach(v => {
      switch (v.type) {
        case 'min_length': validators.push(Validators.minLength(Number(v.value))); break;
        case 'max_length': validators.push(Validators.maxLength(Number(v.value))); break;
        case 'min': validators.push(Validators.min(Number(v.value))); break;
        case 'max': validators.push(Validators.max(Number(v.value))); break;
        case 'regex': validators.push(Validators.pattern(v.value)); break;
      }
    });

    return validators;
  }

  toMultiselectOptions(field: ConfigurationField): { value: string; label: string }[] {
    return (field.options || []).map(o => ({ value: o.value, label: o.label }));
  }

  onMultiselectChange(key: string): void {
    this.configForm.get(key)?.setValue(this.multiSelectModel[key]);
    this.configForm.get(key)?.markAsTouched();
  }

  getFieldError(field: ConfigurationField): string {
    const control = this.configForm.get(field.key);
    if (!control || !control.errors) return '';
    const errors = control.errors;
    if (errors['required']) return `${field.label} is required.`;
    if (errors['min']) return `Minimum value is ${errors['min'].min}.`;
    if (errors['max']) return `Maximum value is ${errors['max'].max}.`;
    if (errors['minlength']) return `Minimum length is ${errors['minlength'].requiredLength}.`;
    if (errors['maxlength']) return `Maximum length is ${errors['maxlength'].requiredLength}.`;
    if (errors['pattern']) return `Invalid format.`;
    return 'Invalid value.';
  }

  // ================= QUANTITY STEPPER =================

  incrementQty(): void {
    const max = this.selectedCatalogDetail?.max_quantity;

    if (max == null || this.quantity < max) {
      this.quantity++;
      this.calculateEffectivePrice();
    }
  }

  decrementQty(): void {
    const min = this.selectedCatalogDetail?.min_quantity ?? 1;

    if (this.quantity > min) {
      this.quantity--;
      this.calculateEffectivePrice();
    }
  }

  // ================= ADD TO CART =================

  addToCart(_catalogItem?: CatalogItem): void {
    if (!this.selectedCatalogDetail) return;

    if (this.configForm && this.configForm.invalid) {
      this.configForm.markAllAsTouched();
      this.notification.error(new Notification('Please fix the configuration errors before adding to cart.'));
      this.activeModalTab = 'configuration';
      this.scrollToSection('configuration');
      return;
    }

    const payload: AddToCartPayload = {
      catalog: this.selectedCatalogDetail.uuid,
      quantity: this.quantity,
      configuration: this.configForm ? this.configForm.getRawValue() : {},
      effective_price: this.effectivePrice
    };

    this.catalogService.addToCart(payload).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      () => {
        this.notification.success(new Notification('Added to cart successfully.'));
        this.getCart();
        // this.isCartPinned = true;
        this.closeDetailsModal();
      },
      () => {
        this.notification.error(new Notification('Failed to add to cart. Please try again.'));
      }
    );
  }

  getCart(): void {
    this.isCartLoading = true;
    this.catalogService.getCart().pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (cart) => {
        this.cartData = this.catalogService.convertToCartViewData(cart);
        this.cartLoaded = true;
        this.isCartLoading = false;
      },
      () => {
        this.isCartLoading = false;
      }
    );
  }

  goToCheckout(): void {
    this.router.navigate(['checkout'], { relativeTo: this.route });
    // or this.router.navigateByUrl('/checkout') depending on your routing setup
  }

  // ---- UPDATED: toggle on click instead of showing on hover ----
  toggleCart(): void {
    // event.stopPropagation();
    this.isCartPinned = !this.isCartPinned;
    if (this.isCartPinned) {
      this.getCart();
    }
  }

  closeCart(): void {
    this.isCartPinned = false;
  }

  // Close the cart dropdown when clicking anywhere outside the widget
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isCartPinned) return;
    const target = event.target as HTMLElement;
    if (!target.closest('.cart-widget')) {
      this.isCartPinned = false;
    }
  }

  confirmCatalogDelete() {
    this.taskDeleteModalRef.hide();
    this.spinner.start('main');
    this.catalogService.deleteCatalog(this.catalogUuid).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.notification.success(new Notification('Catalog deleted successfully.'));
      this.getCatalogs();
    }, err => {
      this.notification.error(new Notification('Catalog can not be deleted!! Please try again.'));
    });
  }

  private CATEGORY_ICON_MAP: { [key: string]: string } = {
    'Compute': 'fa fa-server',
    'Storage': 'fa fa-hdd',
    'Backup': 'fa fa-archive',
    'Application': 'fa fa-th-large',
    'Network': 'fa fa-network-wired',
    'Database': 'fa fa-database',
    'Security': 'fa fa-shield-alt',
    'Operations': 'fa fa-cogs',
    'Container': 'fa fa-docker',
    'Identity & Access': 'fa fa-id-badge',
    'Other': 'fa fa-cube',
    'Others': 'fa fa-cube'
  };

  categoryIcon(category: string): string {
    const normalized = Object.keys(this.CATEGORY_ICON_MAP).find(
      k => k.toLowerCase() === (category || '').toLowerCase()
    );
    return this.CATEGORY_ICON_MAP[normalized || 'Others'];
  }

  logoUrl(item: any): string | null {
    return item?.logo || null;
  }
}
