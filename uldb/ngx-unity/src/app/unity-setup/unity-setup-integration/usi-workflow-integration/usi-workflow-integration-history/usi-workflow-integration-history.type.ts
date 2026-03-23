export interface WorkflowIntegratonHistory {
    uuid: string;
    unity_id: string;
    external_id: string;
    requested_on: string | null;
    started_on: string | null;
    completed_on: string | null;
    status: 'In Progress' | 'Success' | 'Failed';
    payload: any;
}

// interface RequestPayload {
//     req_id: string;
//     subject: string;
//     cloud: string;
//     service_name: string;
//     application_name: string;
//     env: string;
//     parameters: {
//         account_id: string;
//     };
// }