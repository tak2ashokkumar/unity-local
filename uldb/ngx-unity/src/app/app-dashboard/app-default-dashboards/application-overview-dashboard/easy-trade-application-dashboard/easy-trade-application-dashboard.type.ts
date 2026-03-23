export interface EasyTradeSessionToOrders {
    order_submitted: number;
    order_executed: number;
    sessions: number;
}

export interface EasyTradeSessionsByDateRange {
    grouping: string;
    sessions: EasyTradeSessionsByDateRangeSessionData[];
}
export interface EasyTradeSessionsByDateRangeSessionData {
    range: string;
    total: number;
}

export interface EasyTradeNewUsersByDateRange {
    grouping: string;
    new_users: EasyTradeNewUsersByDateRangeUserData[];
}
export interface EasyTradeNewUsersByDateRangeUserData {
    range: string;
    total: number;
}


export interface EasyTradeOrderSuccessRate {
    grouping: string;
    order_success_rate: EasyTradeOrderSuccessRateData[];
}
export interface EasyTradeOrderSuccessRateData {
    range: string;
    total: number;
}

export interface EasyTradeConversionRate {
    grouping: string;
    conversion_rate: EasyTradeConversionRateData[];
}
export interface EasyTradeConversionRateData {
    range: string;
    total: number;
}

export interface EasyTradeOrdersPlaced {
    grouping: string;
    order_placed: EasyTradeConversionRateData[];
}
export interface EasyTradeOrdersPlacedData {
    range: string;
    total: number;
}

export interface EasyTradeActiveUsersVsEvents {
    active_users: EasyTradeActiveUsersData[];
    events: EasyTradeEventsData[];
    grouping: string;
}
export interface EasyTradeActiveUsersData {
    sum: number;
    period: string;
}
export interface EasyTradeEventsData {
    sum: number;
    period: string;
}

export interface EasyTradeUniqueCustomers {
    grouping: string;
    unique_customers: EasyTradeUniqueCustomerData[];
}
export interface EasyTradeUniqueCustomerData {
    range: string;
    total: number;
}

export interface EasyTradeApplicationResponse {
    grouping: string;
    application_resp: EasyTradeApplicationResponseData[];
}
export interface EasyTradeApplicationResponseData {
    range: string;
    total: number;
}

export interface EasyTradeErrorRate {
    grouping: string;
    error_rate: EasyTradeErrorRateData[];
}
export interface EasyTradeErrorRateData {
    range: string;
    total: number;
}

export interface EasyTradeFailureRate {
    grouping: string;
    failure_rate: EasyTradeFailureRateData[];
}
export interface EasyTradeFailureRateData {
    range: string;
    total: number;
}

export interface EasyTradePaymentGatewayLatency {
    grouping: string;
    latency: EasyTradePaymentGatewayLatencyData[];
}
export interface EasyTradePaymentGatewayLatencyData {
    range: string;
    total: number;
}

export interface EasyTradeKPISByUSD {
    grouping: string;
    order_placed: EasyTradeKPISByUSDData[];
}
export interface EasyTradeKPISByUSDData {
    range: string;
    total: number;
}