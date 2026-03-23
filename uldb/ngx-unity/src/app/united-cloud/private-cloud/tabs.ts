import { PrivateClouds } from 'src/app/shared/SharedEntityTypes/private-cloud.type';

export interface PCTabs extends PrivateClouds {
    url?: string;
}
//TODO: Get this from API and remove here
export const tabItems: Array<PrivateClouds> = [
    {
        name: 'VMware Demo',
        uuid: '66294540-f131-40f2-8555-2e36bf95b921'
    },
    {
        name: 'OpenStack Demo1',
        uuid: 'f1ba14ff-fbb0-4cd5-b5a8-5fae9374d11f'
    }
];