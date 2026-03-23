interface CloudController {
    name: string;
    uuid: string;
    platform_type: string;
    proxy: CloudControllerProxy;
    hypervisors: Hypervisors[]
}
interface Hypervisors {
    name: string;
}
interface CloudControllerProxy {
    proxy_fqdn: string;
    same_tab: Boolean;
}
