import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, from, of, throwError } from 'rxjs';
import { catchError, filter, map, mergeMap, switchMap, take, takeUntil } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { UnitedCloudSharedService } from '../../../united-cloud-shared.service';
import { VmsService } from '../../vms.service';
import { DEPLOY_OVF_WIZARD_STEPS, UnityDeployOvfTreeViewNodeType, VmsListVmwareDeployOvfService } from './vms-list-vmware-deploy-ovf.service';
import { DEPLOY_OVF_TEMPLATE_STEPS, OVFDeployAllStepsDataType, OVFDeployWizardStepType, VcenterOVFDeployDatastoreItem, VcenterOVFDeployMetaData } from './vms-list-vmware-deploy-ovf.type';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'vms-list-vmware-deploy-ovf',
  templateUrl: './vms-list-vmware-deploy-ovf.component.html',
  styleUrls: ['./vms-list-vmware-deploy-ovf.component.scss'],
})
export class VmsListVmwareDeployOvfComponent implements OnInit, OnDestroy {
  @Input('pcId') pcId: string;
  @Input('metaData') metaData: VcenterOVFDeployMetaData[];
  @Output('created') created = new EventEmitter();
  private action: 'add' | 'edit';
  filesToUpload: { [key: string]: any };

  private ngUnsubscribe = new Subject();
  steps: OVFDeployWizardStepType[] = [];
  DEPLOY_OVF_TEMPLATE_STEPS = DEPLOY_OVF_TEMPLATE_STEPS;
  mainData: OVFDeployAllStepsDataType;

  storage: VcenterOVFDeployDatastoreItem[] = [];
  network: string[] = [];
  currentActiveIndex: number = 0;

  hardDiskExpand: boolean = false;

  @ViewChild('deployOvfRef') deployOvfRef: ElementRef;
  deployOvfModelRef: BsModalRef;

  maxFileSize: number = 50000000000; //50 GB
  chunkSize: number = 100000000; //100 MB

  nameAndFolderCtx = {
    list: [],
    action: (node: UnityDeployOvfTreeViewNodeType) => this.selectNameAndFolder(node),
  }

  computeResourceCtx = {
    list: [],
    action: (node: UnityDeployOvfTreeViewNodeType) => this.selectComputeResource(node),
  }

  openModal: boolean = false;
  libraryError: boolean = false;
  deplymentInProgress: boolean = false;
  cloudNameForApi: string = '';

  constructor(public deploySvc: VmsListVmwareDeployOvfService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilSvc: AppUtilityService,
    private appService: AppLevelService,
    private modalService: BsModalService,
    private vmsService: VmsService,
    private ucSharedService: UnitedCloudSharedService) {
    this.steps = DEPLOY_OVF_WIZARD_STEPS;

    this.deploySvc.deployAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.action = 'add';
      this.deplymentInProgress = false;
      if (this.metaData) {
        this.resetStepsAndData();
        //If not metadata then show msg to wait till metadata
        this.deployOvfModelRef = this.modalService.show(this.deployOvfRef, Object.assign({}, { class: 'modal-xl', keyboard: true, ignoreBackdropClick: true }));
      } else {
        this.openModal = true;
        this.spinner.start('main');
      }
    });
  }

  ngOnInit(): void {
    this.getVMCreationMetaData();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getVMCreationMetaData() {
    this.cloudNameForApi = this.ucSharedService.getCloudNameForEndpoint(this.vmsService.platformType);
    if (this.openModal) {
      this.openModal = !this.openModal;
      if (this.action == 'add') {
        this.resetStepsAndData();
        this.deployOvfModelRef = this.modalService.show(this.deployOvfRef, Object.assign({}, { class: 'modal-xl', keyboard: true, ignoreBackdropClick: true }));
      }
    }
  }

  resetStepsAndData() {
    this.currentActiveIndex = 0;
    this.steps.forEach(step => {
      step.active = false;
      step.visited = false;
    });
    this.steps[this.currentActiveIndex].active = true;
    this.mainData = {
      [DEPLOY_OVF_TEMPLATE_STEPS.UPLOAD_FILES]: this.deploySvc.uploadFileDefault(),
      [DEPLOY_OVF_TEMPLATE_STEPS.NAME_AND_FOLDER]: this.deploySvc.nameAndFolderDefault(),
      [DEPLOY_OVF_TEMPLATE_STEPS.COMPUTE_RESOURCE]: this.deploySvc.computeResourceDefault(),
      [DEPLOY_OVF_TEMPLATE_STEPS.REVIEW]: {},
      [DEPLOY_OVF_TEMPLATE_STEPS.STORAGE]: this.deploySvc.storageDefault(),
      [DEPLOY_OVF_TEMPLATE_STEPS.NETWORK]: this.deploySvc.networkDefault(),
      [DEPLOY_OVF_TEMPLATE_STEPS.SUMMARY]: {},
    }
    if (this.metaData) {
      this.nameAndFolderCtx.list = this.deploySvc.convertToNameAndFolderTypeTreeNode(this.metaData);
      this.computeResourceCtx.list = [];
      this.storage = [];
      this.network = [];
      this.updateResourcesData();
    }
  }

  updateResourcesData() {
    let dcObj = this.metaData.find(md => md.datacenter == this.mainData[DEPLOY_OVF_TEMPLATE_STEPS.NAME_AND_FOLDER].destination);
    if (dcObj) {
      this.computeResourceCtx.list = this.deploySvc.convertClusterTypeToTreeNode(dcObj.datacenter, dcObj.cluster);
      this.storage = dcObj.datastore;
      this.network = dcObj.network;
      this.storage.forEach(stg => {
        stg.isSelected = false;
        let freespace = stg.summary.freespace.split(' ');
        stg.summary.freespaceInBytes = this.utilSvc.convertSizeToBytes(Number(freespace[0]), freespace[1])
        stg.summary.capacity_fmt = Number(stg.summary.capacity.split(' ')[0]);
      });
    }
  }

  isActive(index: number) {
    if (this.currentActiveIndex == index) {
      return true;
    }
    return false;
  }

  next() {
    if (this.currentActiveIndex == 0) {
      if (this.deploySvc.validateUploadFile(this.mainData[DEPLOY_OVF_TEMPLATE_STEPS.UPLOAD_FILES])) {
        this.spinner.start('main');
        let count = 0;
        from(Object.entries(<{ [key: string]: any }>this.mainData[DEPLOY_OVF_TEMPLATE_STEPS.UPLOAD_FILES].files))
          .pipe(
            map(([key, value]) => ({ key, value })),
            //Added this line as enhancement to upload only ovf
            filter(obj => obj.key.endsWith('ovf')),
            mergeMap((e) => {
              count++;
              return this.deploySvc.uploadFiles(this.pcId, this.cloudNameForApi, e)
            }),
            takeUntil(this.ngUnsubscribe))
          .subscribe(res => {
            const key = res.keys().next().value;
            let obj = res.get(key);
            if (obj) {
              this.mainData[DEPLOY_OVF_TEMPLATE_STEPS.UPLOAD_FILES].files[key].uploaded = true;
              this.mainData[DEPLOY_OVF_TEMPLATE_STEPS.UPLOAD_FILES].files[key].uploadError = '';
              if (key.endsWith('ovf')) {
                (<string[]>obj.ovf_data.vm_network).forEach((nw: string, index: number) => {
                  if (!this.network.includes(nw)) {
                    this.network.push(nw);
                  }
                  if (index == 0) {
                    this.mainData[DEPLOY_OVF_TEMPLATE_STEPS.NETWORK].network = nw;
                  }
                });
                this.mainData[DEPLOY_OVF_TEMPLATE_STEPS.UPLOAD_FILES].uploadedResponse = obj;
                obj.ovf_data.file.forEach((file: any) => {
                  if (this.mainData[DEPLOY_OVF_TEMPLATE_STEPS.UPLOAD_FILES].files[file.name]) {
                    this.mainData[DEPLOY_OVF_TEMPLATE_STEPS.UPLOAD_FILES].files[file.name].name = file.name;
                    this.mainData[DEPLOY_OVF_TEMPLATE_STEPS.UPLOAD_FILES].files[file.name].size = file.size;
                    this.mainData[DEPLOY_OVF_TEMPLATE_STEPS.UPLOAD_FILES].files[file.name].capacity = file.capacity;
                    this.mainData[DEPLOY_OVF_TEMPLATE_STEPS.UPLOAD_FILES].files[file.name].populated_size = file.populated_size;
                  }
                });
              }
            } else {
              this.mainData[DEPLOY_OVF_TEMPLATE_STEPS.UPLOAD_FILES].files[key].uploadError = 'Error while uploading this file';
              this.mainData[DEPLOY_OVF_TEMPLATE_STEPS.UPLOAD_FILES].files[key].uploaded = false;
            }
            count--;
            if (count == 0) {
              this.spinner.stop('main');
              //This will remove active class which adds blue color
              this.steps[this.currentActiveIndex].active = false;
              //This is set to previous line, icon and text to green by adding `complete` class to li
              this.steps[this.currentActiveIndex].visited = true;
              this.currentActiveIndex++;
              //This will add active class to current step
              this.steps[this.currentActiveIndex].active = true;
            }
          }, err => {
            count--;
            if (count == 0) {
              this.spinner.stop('main');
            }
            console.log(err)
            this.notification.error(new Notification('Something went wrong!! Please try again'));
          })
      }
    } else {
      if (this.deploySvc.isValidStep(this.steps[this.currentActiveIndex].stepName, this.mainData)) {
        // updating resources based on Datacenter Selection
        if (this.steps[this.currentActiveIndex].stepName == DEPLOY_OVF_TEMPLATE_STEPS.NAME_AND_FOLDER && this.mainData[DEPLOY_OVF_TEMPLATE_STEPS.NAME_AND_FOLDER]?.destination) {
          this.updateResourcesData();
        }
        //This will remove active class which adds blue color
        this.steps[this.currentActiveIndex].active = false;
        //This is set to previous line, icon and text to green by adding `complete` class to li
        this.steps[this.currentActiveIndex].visited = true;
        this.currentActiveIndex++;
        //This will add active class to current step
        this.steps[this.currentActiveIndex].active = true;
      }
    }
  }

  back() {
    this.mainData = this.deploySvc.resetStepDataToDefault(this.steps[this.currentActiveIndex - 1].stepName, this.mainData)
    //This will remove active class
    this.steps[this.currentActiveIndex].active = false;
    this.currentActiveIndex--;
    //This will add active class to current step
    this.steps[this.currentActiveIndex].active = true;
    //This is set to previous line, icon and text to grey by removing `complete` class from li
    this.steps[this.currentActiveIndex].visited = false;
  }

  resetAllSelectedNodes(nodes: UnityDeployOvfTreeViewNodeType[]) {
    nodes.forEach(node => {
      if (node.hasChildren()) {
        this.resetAllSelectedNodes(node.children);
      }
      node.isSelected = false;
    });
  }


  onFileDropped($event: FileList) {
    this.detectFiles($event);
  }

  detectFiles(files: FileList) {
    if (!files.length) {
      return;
    }
    for (let i = 0; i < files.length; i++) {
      const element = files[i];
      if (element.name.endsWith('vmdk')) {
        this.mainData[DEPLOY_OVF_TEMPLATE_STEPS.UPLOAD_FILES].vmdkCount++;
      }
      this.mainData[DEPLOY_OVF_TEMPLATE_STEPS.UPLOAD_FILES].files[element.name] = {
        file: element,
        size: this.formatBytes(element.size, 2),
        uploadError: '',
        uploaded: false,
        uploading: false
      };
    }
  }

  removeFile(key: string) {
    if (key.endsWith('vmdk')) {
      this.mainData[DEPLOY_OVF_TEMPLATE_STEPS.UPLOAD_FILES].vmdkCount--
    }
    delete this.mainData[DEPLOY_OVF_TEMPLATE_STEPS.UPLOAD_FILES].files[key];
  }

  formatBytes(bytes: number, decimals: number) {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals || 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  selectNameAndFolder(node: UnityDeployOvfTreeViewNodeType) {
    if (node.canSelect) {
      this.resetAllSelectedNodes(this.nameAndFolderCtx.list);
      node.isSelected = true;
      this.mainData[DEPLOY_OVF_TEMPLATE_STEPS.NAME_AND_FOLDER].destination = node.name;
      this.deploySvc.validateFolder(this.mainData[DEPLOY_OVF_TEMPLATE_STEPS.NAME_AND_FOLDER])
    }
  }

  selectComputeResource(node: UnityDeployOvfTreeViewNodeType) {
    if (node.canSelect) {
      this.resetAllSelectedNodes(this.computeResourceCtx.list);
      node.isSelected = true;
      this.mainData[DEPLOY_OVF_TEMPLATE_STEPS.COMPUTE_RESOURCE].computeResource = node.name;
      this.deploySvc.validateComputeResource(this.mainData);
    }
  }

  selectStorage(data: VcenterOVFDeployDatastoreItem) {
    this.storage.forEach(stg => stg.isSelected = false)
    if (!data.isSelected) {
      data.isSelected = true;
      this.mainData[DEPLOY_OVF_TEMPLATE_STEPS.STORAGE].storage = [data];
      this.deploySvc.validateStorage(this.mainData);
    }
  }

  saveFileInChunks() {
    let count = 0;
    from(Object.entries(<{ [key: string]: any }>this.mainData[DEPLOY_OVF_TEMPLATE_STEPS.UPLOAD_FILES].files))
      .pipe(
        map(([key, value]) => ({ key, value })),
        filter(obj => obj.key.endsWith('vmdk')),
        mergeMap((e) => {
          this.deplymentInProgress = true;
          count++;
          this.notification.success(new Notification('VMDK files are being uploaded'))
          this.mainData[DEPLOY_OVF_TEMPLATE_STEPS.UPLOAD_FILES].files[e.key].uploading = true;
          return this.deploySvc.uploadFileInChunkedSequence(this.chunkSize, e.value.file).pipe(
            catchError((error) => {
              console.error('Error while uploading file:', error);
              // Handle the error here
              return of({ response: null, file: e.key }); // Return null or any default value to continue the flow
            })
          );
        }),
        takeUntil(this.ngUnsubscribe))
      .pipe(
        takeUntil(this.ngUnsubscribe))
      .subscribe(res => {
        if (res.current == res.total) {
          count--;
          const key = res.file;
          this.mainData[DEPLOY_OVF_TEMPLATE_STEPS.UPLOAD_FILES].files[key].uploading = false;
          if (res.response) {
            this.mainData[DEPLOY_OVF_TEMPLATE_STEPS.UPLOAD_FILES].files[key].uploaded = true;
            this.mainData[DEPLOY_OVF_TEMPLATE_STEPS.UPLOAD_FILES].files[key].uploadError = '';
            this.mainData[DEPLOY_OVF_TEMPLATE_STEPS.UPLOAD_FILES].uploadedVmdkFiles.push(res.response.upload_id);
          } else {
            this.notification.error(new Notification(`Error while trying to upload ${key}!! Please try again`));
            this.mainData[DEPLOY_OVF_TEMPLATE_STEPS.UPLOAD_FILES].files[key].uploadError = 'Error while uploading this file';
            this.mainData[DEPLOY_OVF_TEMPLATE_STEPS.UPLOAD_FILES].files[key].uploaded = false;
          }
        }
        if (count == 0) {
          this.deplymentInProgress = false;
          this.submit();
        }
      }, err => {
        this.notification.error(new Notification('Something went wrong!! Please try again'));
      })
  }

  submit() {
    let data = this.deploySvc.convertToVMCreationData(this.mainData);
    this.spinner.start('main')
    this.deploySvc.deployTemplate(this.pcId, this.cloudNameForApi, data).pipe(catchError((e: HttpErrorResponse) => {
      return throwError(e);
    }), switchMap(res => {
      if (res.task_id) {
        this.spinner.stop('main');
        this.deployOvfModelRef.hide();
        this.notification.success(new Notification('OVF template deployment is in-progress. We will update the status once the deployment is complete.'));
        return this.appService.pollForTask(res.task_id, 3, 200).pipe(take(1));
      } else {
        throw new Error('Something went wrong');
      }
    }), takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.created.emit();
      this.notification.success(new Notification('OVF template deployment completed successfully. Please wait latest data is being updated'));
    }, err => {
      this.notification.error(new Notification(err.error.detail));
      // this.notification.error(new Notification('Error while deploying OVF Template. Please try again later!!'));
      this.spinner.stop('main');
    });
  }
}
