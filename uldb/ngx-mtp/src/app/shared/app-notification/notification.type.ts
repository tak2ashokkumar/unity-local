export class Notification {
  message: string;
  type: NotificationType;
  timeout?: number;
  constructor(message: string, type?: NotificationType) {
    this.message = message;
    this.type = type;
  }
}

export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'danger',
  WARNING = 'warning'
}