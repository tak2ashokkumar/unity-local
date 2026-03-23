import { ServerSidePlatFormMapping } from "src/app/shared/app-utility/app-utility.service"
import { environment } from "src/environments/environment";

export interface PrivateCloudsWidgetMetadataType {
    imageURL: string;
    altText: string;
    platFormType: string;
}

export const PrivateCloudsWidgetMetadata: PrivateCloudsWidgetMetadataType[] = [
    {
        imageURL: 'VMware_ESXI 1.svg',
        altText: 'ESXI',
        platFormType: ServerSidePlatFormMapping.ESXI
    },
    {
        imageURL:  `VMware Cloud Director.svg`,
        altText: 'vCloud',
        platFormType: ServerSidePlatFormMapping.VCLOUD
    },
    {
        imageURL:  `hyper-v.svg`,
        altText: 'Hyper-V',
        platFormType: ServerSidePlatFormMapping.HYPER_V
    },
    {
        imageURL:  `OpenStack-Logo-Horizontal 1.svg`,
        altText: 'Openstack',
        platFormType: ServerSidePlatFormMapping.OPENSTACK
    },
    {
        imageURL:  `proxmox-server-solutions 1.svg`,
        altText: 'Proxmox',
        platFormType: ServerSidePlatFormMapping.PROXMOX
    },
    {
        imageURL:  `V-Center.svg`,
        altText: 'vCenter',
        platFormType: ServerSidePlatFormMapping.VMWARE
    },
    {
        imageURL:  `United Cloud_KVM.svg`,
        altText: 'UPC KVM',
        platFormType: ServerSidePlatFormMapping.G3_KVM
    },
    {
        imageURL:  `United Cloud_Vcenter.svg`,
        altText: 'UPC vCenter',
        platFormType: ServerSidePlatFormMapping.UNITED_PRIVATE_CLOUD_VCENTER
    },
    {
        imageURL:  `nutanix.svg`,
        altText: 'Nutanix',
        platFormType: ServerSidePlatFormMapping.NUTANIX
    }
]