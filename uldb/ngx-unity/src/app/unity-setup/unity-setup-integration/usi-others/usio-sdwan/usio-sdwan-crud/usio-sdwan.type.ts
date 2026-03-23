import { UnityScheduleType } from "src/app/shared/SharedEntityTypes/schedule.type";

export interface SdWanAccountDetails {
    uuid: string;
    name: string;
    account_url: string;
    port: string;
    collector: string;
    username: string;
    password: string;
    schedule_meta: UnityScheduleType;
  }
  