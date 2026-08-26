import moment from 'moment';

export const CUSTOM_DATE_FILTER_DATE_FORMAT = 'YYYY-MM-DDTHH:mm:ss.SSSZ';

export enum CustomDateFilterPeriod {
  TWENTY_FOUR_HOURS = '24h',
  ONE_DAY = '1d',
  SEVEN_DAYS = '7d',
  THIRTY_DAYS = '30d',
  SIXTY_DAYS = '60d',
  NINETY_DAYS = '90d',
  LAST_WEEK = 'last_week',
  LAST_MONTH = 'last_month',
  LAST_YEAR = 'last_year',
  LAST_24_HR = 'last_24_hr',
  LAST_24_HOURS = 'last_24_hours',
  LAST_7_DAYS = 'last_7days',
  LAST_7_DAYS_UNDERSCORE = 'last_7_days',
  LAST_30_DAYS = 'last_30_days',
  LAST_90_DAYS = 'last_90_days',
  LAST_QUARTER = 'last_quarter',
  ALL_TIME = 'all_time',
  ALL = 'all',
  CUSTOM = 'custom'
}

export interface CustomDateFilterOption {
  label?: string;
  value?: string;
  from?: string;
  to?: string;
}

export interface CustomDateFilterChange {
  period: CustomDateFilterPeriod;
  from: string | null;
  to: string | null;
}

export function isCustomDateFilterPeriod(period?: string | null): period is CustomDateFilterPeriod {
  return !!period && Object.values(CustomDateFilterPeriod).indexOf(period as CustomDateFilterPeriod) !== -1;
}

export function getCustomDateFilterRange(
  period: CustomDateFilterPeriod,
  customFrom?: string | Date | null,
  customTo?: string | Date | null,
  dateOnlyPicker: boolean = true,
  dateFormat: string = CUSTOM_DATE_FILTER_DATE_FORMAT
): CustomDateFilterChange | null {
  if (!isCustomDateFilterPeriod(period)) {
    return null;
  }

  if (period === CustomDateFilterPeriod.ALL || period === CustomDateFilterPeriod.ALL_TIME) {
    return { period: period, from: null, to: null };
  }

  if (period === CustomDateFilterPeriod.CUSTOM) {
    return getCustomRange(period, customFrom, customTo, dateOnlyPicker, dateFormat);
  }

  const now = moment();
  let from = now.clone().subtract(30, 'days').startOf('day');
  let to = now.clone().endOf('day');

  switch (period) {
    case CustomDateFilterPeriod.TWENTY_FOUR_HOURS:
    case CustomDateFilterPeriod.ONE_DAY:
    case CustomDateFilterPeriod.LAST_24_HR:
    case CustomDateFilterPeriod.LAST_24_HOURS:
      from = now.clone().subtract(1, 'day');
      to = now.clone();
      break;
    case CustomDateFilterPeriod.SEVEN_DAYS:
    case CustomDateFilterPeriod.LAST_7_DAYS:
    case CustomDateFilterPeriod.LAST_7_DAYS_UNDERSCORE:
      from = now.clone().subtract(7, 'days').startOf('day');
      to = now.clone().endOf('day');
      break;
    case CustomDateFilterPeriod.THIRTY_DAYS:
    case CustomDateFilterPeriod.LAST_30_DAYS:
      from = now.clone().subtract(30, 'days').startOf('day');
      to = now.clone().endOf('day');
      break;
    case CustomDateFilterPeriod.SIXTY_DAYS:
      from = now.clone().subtract(60, 'days').startOf('day');
      to = now.clone().endOf('day');
      break;
    case CustomDateFilterPeriod.NINETY_DAYS:
    case CustomDateFilterPeriod.LAST_90_DAYS:
    case CustomDateFilterPeriod.LAST_QUARTER:
      from = now.clone().subtract(90, 'days').startOf('day');
      to = now.clone().endOf('day');
      break;
    case CustomDateFilterPeriod.LAST_WEEK:
      from = now.clone().subtract(1, 'week').startOf('week');
      to = now.clone().subtract(1, 'week').endOf('week');
      break;
    case CustomDateFilterPeriod.LAST_MONTH:
      from = now.clone().subtract(1, 'month').startOf('month');
      to = now.clone().subtract(1, 'month').endOf('month');
      break;
    case CustomDateFilterPeriod.LAST_YEAR:
      from = now.clone().subtract(1, 'year').startOf('year');
      to = now.clone().subtract(1, 'year').endOf('year');
      break;
    default:
      return null;
  }

  return {
    period: period,
    from: formatClientDate(from, dateFormat),
    to: formatClientDate(to, dateFormat)
  };
}

function getCustomRange(
  period: CustomDateFilterPeriod,
  customFrom?: string | Date | null,
  customTo?: string | Date | null,
  dateOnlyPicker: boolean = true,
  dateFormat: string = CUSTOM_DATE_FILTER_DATE_FORMAT
): CustomDateFilterChange {
  if (!customFrom || !customTo) {
    return { period: period, from: null, to: null };
  }

  const from = moment(customFrom);
  const to = moment(customTo);
  if (!from.isValid() || !to.isValid()) {
    return { period: period, from: null, to: null };
  }

  const startDate = dateOnlyPicker ? from.startOf('day') : from;
  const endDate = dateOnlyPicker ? to.endOf('day') : to;

  return {
    period: period,
    from: formatClientDate(startDate, dateFormat),
    to: formatClientDate(endDate, dateFormat)
  };
}

function formatClientDate(value: moment.Moment, dateFormat: string): string {
  return value.clone().format(dateFormat);
}
