import { Directive, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';

@Directive({
  selector: '[fileDnd]'
})
export class FileDndDirective {
  @Input() type: string[];
  @Input() maxFiles: number;

  @HostBinding('class.fileover') fileOver: boolean;
  @Output() fileDropped = new EventEmitter<any>();
  constructor(private notification: AppNotificationService) { }

  // Dragover listener
  @HostListener('dragover', ['$event']) onDragOver(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.fileOver = true;
  }

  // Dragleave listener
  @HostListener('dragleave', ['$event']) public onDragLeave(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.fileOver = false;
  }

  // Drop listener
  @HostListener('drop', ['$event']) public ondrop(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    this.fileOver = false;
    let files = evt.dataTransfer.files;
    if (this.maxFiles && files.length > this.maxFiles) {
      this.notification.error(new Notification(`Cannot upload more than ${this.maxFiles} file at a time`));
    }
    if (files.length) {
      if (this.type.length) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (!this.type.includes(file.type)) {
            this.notification.error(new Notification(`Unsupported file type ${file.type}!! Please upload ${this.type.join(", ")} file only`));
            return;
          }
        }
      }
      this.fileDropped.emit(files);
    }
  }

}