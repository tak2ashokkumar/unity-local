export interface NotificationEmailType {
  uuid: string;
  email_list: string[];
  email_content: string[];
  subject_list: string[];
  custom_message: string;
  customer: number;
  tenant: number[];
  flag: boolean;
}

