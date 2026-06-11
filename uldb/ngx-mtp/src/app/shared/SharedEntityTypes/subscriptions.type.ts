export interface MTPSubscription {
    organization_name: string;
    organization_id: number;
    organizatino_uuid: string;
    subscribed_modules: MTPSubscriptionModule[];
    not_subscribed_modules: MTPSubscriptionModule[];
}
export interface MTPSubscriptionModule {
    module_name: string;
    module_id: number;
}