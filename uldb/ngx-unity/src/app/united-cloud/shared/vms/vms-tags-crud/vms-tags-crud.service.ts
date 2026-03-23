import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NoWhitespaceValidator, PlatFormMapping } from 'src/app/shared/app-utility/app-utility.service';
import { RxwebValidators, IpVersion } from '@rxweb/reactive-form-validators';
import { UPDATE_VM_TAGS } from 'src/app/shared/api-endpoint.const';

@Injectable({
  providedIn: 'root'
})
export class VmsTagsCrudService {
  private addOrEditAnnouncedSource = new Subject<VMTagsCRUD>();
  addOrEditAnnounced$ = this.addOrEditAnnouncedSource.asObservable();

  constructor(private builder: FormBuilder,
    private http: HttpClient) { }

  updateTags(input: VMTagsCRUD) {
    this.addOrEditAnnouncedSource.next(input);
  }

  createTagsForm(tags: string[]): FormGroup {
    return this.builder.group({
      'tags': [tags],
    });
  }

  resetTagsFormErrors() {
    return {
      'tags': ''
    };
  }

  tagsFormValidationMessages = {
    'tags': {
      'required': 'Tags are required'
    }
  }

  updateTagsData(data: { tags: string[] }, param: VMTagsCRUD) {
    return this.http.post(UPDATE_VM_TAGS(param.vmId, param.vmType), data);
  }
}

export class VMTagsCRUD {
  vmId: string;
  tags: string[];
  vmType: PlatFormMapping;
  constructor() { }
}

