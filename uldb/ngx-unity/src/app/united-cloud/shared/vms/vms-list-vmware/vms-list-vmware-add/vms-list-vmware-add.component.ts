import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subject, throwError } from 'rxjs';
import { catchError, switchMap, take, takeUntil } from 'rxjs/operators';
import { AppLevelService } from 'src/app/app-level.service';
import { AppNotificationService } from 'src/app/shared/app-notification/app-notification.service';
import { Notification } from 'src/app/shared/app-notification/notification.type';
import { AppSpinnerService } from 'src/app/shared/app-spinner/app-spinner.service';
import { AppUtilityService } from 'src/app/shared/app-utility/app-utility.service';
import { UnitedCloudSharedService } from '../../../united-cloud-shared.service';
import { VmsService } from '../../vms.service';
import { ADD_VM_WIZARD_STEPS, UnityTreeViewNodeType, VmsListVmwareAddService } from './vms-list-vmware-add.service';
import { ADD_VM_STEPS, AddVMWizardStepType, AllStepsDataType, EditVMHardwareConfigType, VcenterVMCreateDatastoreItem, VcenterVMCreationMetaData } from './vms-list-vmware-add.type';

@Component({
  selector: 'vms-list-vmware-add',
  templateUrl: './vms-list-vmware-add.component.html',
  styleUrls: ['./vms-list-vmware-add.component.scss']
})
export class VmsListVmwareAddComponent implements OnInit, OnDestroy {
  @Input('pcId') pcId: string;
  @Input('metaData') metaData: VcenterVMCreationMetaData[];
  @Output('created') created = new EventEmitter();
  private action: 'add' | 'edit';

  private ngUnsubscribe = new Subject();
  steps: AddVMWizardStepType[] = [];
  ADD_VM_STEPS = ADD_VM_STEPS;
  mainData: AllStepsDataType;

  libraries: { name: string, libId: string }[] = [];
  storage: VcenterVMCreateDatastoreItem[] = [];
  network: string[] = [];
  isoList: { file_name: string, file_path?: string, item_id?: string, iso_file?: string, type?: string }[] = [];
  currentActiveIndex: number = 0;

  hardDiskExpand: boolean = false;

  @ViewChild('addVMRef') addVMRef: ElementRef;
  addVmModelRef: BsModalRef;

  @ViewChild('editVMRef') editVMRef: ElementRef;
  editVmModelRef: BsModalRef;
  editMetaData: {
    uuid: string;
    name: string;
    editable: boolean;
    config: EditVMHardwareConfigType;
  };

  editData: {
    cpu: number,
    memory: any,
    dataStore: any,
    hardDisks: any,
    newHardDisks: any[],
    network: any[],
    newNetwork: any[],
    video_card: any,
    storageControllers: string[],
    USB_xHCI_controller: { label: string, value: string };
    USB_controller: { label: string, value: string };
    newUSBController: string[],
    NVMe_controller: { label: string, value: string }[];
    newNVMe_controller: { label: string, value: string }[];
    SATA_controller: { label: string, value: string }[];
    newSATA_controller: { label: string, value: string }[];
    oldSCSI_controller: { label: string, value: string }[];
    newSCSI_controller: { label: string, value: string }[];
    cdrom: any;
  } = null;

  nameAndFolderCtx = {
    list: [],
    action: (node: UnityTreeViewNodeType) => this.selectNameAndFolder(node),
  }

  computeResourceCtx = {
    list: [],
    action: (node: UnityTreeViewNodeType) => this.selectComputeResource(node),
  }

  openModal: boolean = false;
  libraryError: boolean = false;
  cloudNameForApi: string = '';

  constructor(public vmsAddSvc: VmsListVmwareAddService,
    private spinner: AppSpinnerService,
    private notification: AppNotificationService,
    private utilSvc: AppUtilityService,
    private appService: AppLevelService,
    private modalService: BsModalService,
    private vmsService: VmsService,
    private ucSharedService: UnitedCloudSharedService) {
    this.steps = ADD_VM_WIZARD_STEPS;
    this.vmsAddSvc.addVMAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      this.action = 'add';
      if (this.metaData && this.metaData.length) {
        this.resetStepsAndData();
        //If not metadata then show msg to wait till metadata
        this.addVmModelRef = this.modalService.show(this.addVMRef, Object.assign({}, { class: 'modal-xl', keyboard: true, ignoreBackdropClick: true }));
      } else {
        this.openModal = true;
        this.spinner.start('main');
      }
    });

    this.vmsAddSvc.editVMConfigAnnounced$.pipe(takeUntil(this.ngUnsubscribe)).subscribe(obj => {
      this.spinner.start('main');
      this.action = 'edit';
      this.editMetaData = { uuid: obj.uuid, name: obj.name, editable: false, config: null };
      this.getVMHardwareConfig();
    });
  }

  ngOnInit(): void {
    this.getVMCreationMetaData();
    this.getLibraries();
  }

  ngOnDestroy() {
    this.spinner.stop('main');
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  getVMCreationMetaData() {
    if (this.openModal) {
      this.openModal = !this.openModal;
      if (this.action == 'add') {
        this.resetStepsAndData();
        this.addVmModelRef = this.modalService.show(this.addVMRef, Object.assign({}, { class: 'modal-xl', keyboard: true, ignoreBackdropClick: true }));
      } else {
        this.metaData.map(md => {
          this.storage = this.storage.concat(md.datastore);
          this.network = this.network.concat(md.network);
        })
        this.isoList = [];
        this.editVmModelRef = this.modalService.show(this.editVMRef, Object.assign({}, { class: 'modal-xl', keyboard: true, ignoreBackdropClick: true }));
      }
    }
  }

  getLibraries() {
    // if (this.vmsService.platformType === PlatFormMapping.VMWARE) {
    //   this.vmsAddSvc.getVcenterLibraries(this.pcId).pipe(catchError((e: HttpErrorResponse) => {
    //     return throwError(e);
    //   }), switchMap(res => {
    //     // return of({ "state": "SUCCESS", "result": { "message": "Success", "data": [{ "id": "54e9114b-6e04-4383-80fa-0ddff1a8d81d", "last_updated": "2022-09-10T08:13:28.109000", "type": "LOCAL", "name": "Anas", "created": "2022-09-01T06:56:42.760000" }, { "id": "7d91500a-2f4e-4097-aa86-f6c827a8df08", "last_updated": "2022-09-10T08:14:19.841000", "type": "LOCAL", "name": "unitytest-content-lib1", "created": "2022-09-10T08:14:19.841000" }, { "id": "f0eb82eb-63c9-4998-966d-740affbe5ebf", "last_updated": "2022-10-19T02:33:03.518000", "type": "LOCAL", "name": "test", "created": "2022-10-19T02:33:03.518000" }] } })
    //     return this.appService.pollForTask(res.task_id, 3, 300).pipe(take(1));
    //   }), take(1), takeUntil(this.ngUnsubscribe)).subscribe(res => {
    //     this.libraries = (<Array<any>>res.result.data).map(lib => {
    //       return {
    //         name: lib.name,
    //         libId: lib.id
    //       }
    //     });
    //   }, err => {
    //     this.libraryError = true;
    //   });

    // } else {
    this.cloudNameForApi = this.ucSharedService.getCloudNameForEndpoint(this.vmsService.platformType);
    this.vmsAddSvc.getLibraries(this.pcId, this.cloudNameForApi).pipe(catchError((e: HttpErrorResponse) => {
      return throwError(e);
    }), switchMap(res => {
      // return of({ "state": "SUCCESS", "result": { "message": "Success", "data": [{ "id": "54e9114b-6e04-4383-80fa-0ddff1a8d81d", "last_updated": "2022-09-10T08:13:28.109000", "type": "LOCAL", "name": "Anas", "created": "2022-09-01T06:56:42.760000" }, { "id": "7d91500a-2f4e-4097-aa86-f6c827a8df08", "last_updated": "2022-09-10T08:14:19.841000", "type": "LOCAL", "name": "unitytest-content-lib1", "created": "2022-09-10T08:14:19.841000" }, { "id": "f0eb82eb-63c9-4998-966d-740affbe5ebf", "last_updated": "2022-10-19T02:33:03.518000", "type": "LOCAL", "name": "test", "created": "2022-10-19T02:33:03.518000" }] } })
      return this.appService.pollForTask(res.task_id, 3, 300).pipe(take(1));
    }), take(1), takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.libraries = (<Array<any>>res.result.data).map(lib => {
        return {
          name: lib.name,
          libId: lib.id
        }
      });
    }, err => {
      this.notification.error(new Notification(err.error.detail));
      this.libraryError = true;
    });
    // }
  }

  resetStepsAndData() {
    this.currentActiveIndex = 0;
    this.steps.forEach(step => {
      step.active = false;
      step.visited = false;
    });
    this.steps[0].active = true;
    this.mainData = {
      [ADD_VM_STEPS.CREATION_TYPE]: this.vmsAddSvc.creationTypeDeafult(),
      [ADD_VM_STEPS.NAME_AND_FOLDER]: this.vmsAddSvc.nameAndFolderDefault(),
      [ADD_VM_STEPS.COMPUTE_RESOURCE]: this.vmsAddSvc.computeResourceDefault(),
      [ADD_VM_STEPS.STORAGE]: this.vmsAddSvc.storageDefault(),
      [ADD_VM_STEPS.GUEST_OS]: this.vmsAddSvc.guestOSDefault(),
      [ADD_VM_STEPS.HARDWARE]: this.vmsAddSvc.harwareDefault(),
      [ADD_VM_STEPS.SUMMARY]: {},
    }
    if (this.metaData && this.metaData.length) {
      this.nameAndFolderCtx.list = this.vmsAddSvc.convertToNameAndFolderTypeTreeNode(this.metaData);
      this.computeResourceCtx.list = [];
      this.storage = [];
      this.network = [];
      this.isoList = [];
      this.updateResourcesData();
    }
  }

  updateResourcesData() {
    let dcObj = this.metaData.find(md => md.datacenter == this.mainData[ADD_VM_STEPS.NAME_AND_FOLDER].destination);
    if (dcObj) {
      this.computeResourceCtx.list = this.vmsAddSvc.convertClusterTypeToTreeNode(dcObj.datacenter, dcObj.cluster);
      this.storage = dcObj.datastore;
      this.network = dcObj.network;
      this.isoList = [];
      this.storage.forEach(stg => {
        stg.isSelected = false;
        stg.summary.freespaceInBytes = this.utilSvc.convertSizeToBytes(stg.summary.freespace.value, stg.summary.freespace.unit)
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
    if (this.vmsAddSvc.isValidStep(this.steps[this.currentActiveIndex].stepName, this.mainData)) {

      // updating resources based on Datacenter Selection
      if (this.steps[this.currentActiveIndex].stepName == ADD_VM_STEPS.NAME_AND_FOLDER && this.mainData[ADD_VM_STEPS.NAME_AND_FOLDER]?.destination) {
        this.updateResourcesData();
      }

      //This will remove active class which adds blue color
      this.steps[this.currentActiveIndex].active = false;

      //This is to set previous step line, icon and text to green by adding `complete` class to li
      this.steps[this.currentActiveIndex].visited = true;
      this.currentActiveIndex++;

      //This will add active class to current step
      this.steps[this.currentActiveIndex].active = true;
    }
  }

  back() {
    this.mainData = this.vmsAddSvc.resetStepDataToDefault(this.steps[this.currentActiveIndex - 1].stepName, this.mainData)
    //This will remove active class
    this.steps[this.currentActiveIndex].active = false;
    this.currentActiveIndex--;
    //This will add active class to current step
    this.steps[this.currentActiveIndex].active = true;
    //This is set to previous line, icon and text to grey by removing `complete` class from li
    this.steps[this.currentActiveIndex].visited = false;
  }

  resetAllSelectedNodes(nodes: UnityTreeViewNodeType[]) {
    nodes.forEach(node => {
      if (node.hasChildren()) {
        this.resetAllSelectedNodes(node.children);
      }
      node.isSelected = false;
    });
  }

  selectNameAndFolder(node: UnityTreeViewNodeType) {
    if (node.canSelect) {
      this.resetAllSelectedNodes(this.nameAndFolderCtx.list);
      node.isSelected = true;
      this.mainData[ADD_VM_STEPS.NAME_AND_FOLDER].destination = node.name;
      this.vmsAddSvc.validateFolder(this.mainData[ADD_VM_STEPS.NAME_AND_FOLDER])
    }
  }

  selectComputeResource(node: UnityTreeViewNodeType) {
    if (node.canSelect) {
      this.resetAllSelectedNodes(this.computeResourceCtx.list);
      node.isSelected = true;
      this.mainData[ADD_VM_STEPS.COMPUTE_RESOURCE].computeResource = node.name;
      this.mainData[ADD_VM_STEPS.COMPUTE_RESOURCE].computeResourceType = node.type;
      this.vmsAddSvc.validateComputeResource(this.mainData);
    }
  }

  selectStorage(data: VcenterVMCreateDatastoreItem) {
    this.storage.forEach(stg => stg.isSelected = false)
    if (!data.isSelected) {
      data.isSelected = true;
      this.mainData[ADD_VM_STEPS.STORAGE].storage = [data];
      this.vmsAddSvc.validateStorage(this.mainData);
    }
  }

  bootOptionChanged($event: string) {
    if ($event == 'content library iso' && this.libraryError) {
      this.notification.error(new Notification('Error while fetching libraries. Please try again!!'));
      return;
    }
    this.mainData[ADD_VM_STEPS.HARDWARE].boot_option = $event;
    this.isoList = [];
  }

  selectStorageForISO(stgName: string) {
    this.mainData[ADD_VM_STEPS.HARDWARE].iso_storage = stgName;
    this.mainData[ADD_VM_STEPS.HARDWARE].iso = '';
    this.isoList = [];
    this.spinner.start('main');
    this.vmsAddSvc.getISOList(this.pcId, stgName).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.isoList = res;
    }, err => {
      this.notification.error(new Notification('Error while fetching iso files for selected storage'));
      this.spinner.stop('main');
    });
  }

  selectLibrariesForISO(libId: string) {
    this.mainData[ADD_VM_STEPS.HARDWARE].library_storage = libId;
    this.mainData[ADD_VM_STEPS.HARDWARE].iso = '';
    this.isoList = [];
    this.spinner.start('main');
    this.vmsAddSvc.getLibraryISOList(this.pcId, libId).pipe(catchError((e: HttpErrorResponse) => {
      return throwError(e);
    }), switchMap(res => {
      // return of({ "state": "SUCCESS", "result": { "message": "Success", "data": [{ "item_id": "d175f7bd-e7f1-42f7-aa4e-bd92668eb918", "file_name": "VMware-VMvisor-Installer-6.7.0.update03-17700523.x86_64-DellEMC_Customized-A11", "file_size": "345.8 MB" }, { "item_id": "59ef8071-7958-4b1d-888b-c7c92aecb43a", "file_name": "fever", "file_size": "259.0 bytes" }] } })
      return this.appService.pollForTask(res.task_id, 3, 300).pipe(take(1));
    }), take(1), takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.isoList = (<Array<{ file_name: string, item_id: string, iso_file: string, type: string }>>res.result.data).filter(f => f.type == 'iso')
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while fetching iso files for selected library'));
    });
  }

  selectISO(isoPath: string) {
    this.mainData[ADD_VM_STEPS.HARDWARE].iso = isoPath;
    this.vmsAddSvc.validateHardwareISO(this.mainData[ADD_VM_STEPS.HARDWARE]);
  }

  resetVideoCardSettings() {
    this.mainData[ADD_VM_STEPS.HARDWARE].vcNumDisplay = 1;
    this.mainData[ADD_VM_STEPS.HARDWARE].vcNumDisplayErr = '';
    this.mainData[ADD_VM_STEPS.HARDWARE].vcRamSize = 2;
    this.mainData[ADD_VM_STEPS.HARDWARE].vcRamSizeErr = '';
    if (this.mainData[ADD_VM_STEPS.HARDWARE].vcSettings == 'custom') {
      this.mainData[ADD_VM_STEPS.HARDWARE].vcExpand = true;
    } else {
      this.mainData[ADD_VM_STEPS.HARDWARE].vcExpand = false;
    }
  }

  addNewHardDisk() {
    this.mainData[ADD_VM_STEPS.HARDWARE].hardDisk.push(this.vmsAddSvc.hardDiskDefault());
  }

  removeNewHardDisk(i: number) {
    this.mainData[ADD_VM_STEPS.HARDWARE].hardDisk.splice(i, 1);
  }

  addNewNetwork() {
    this.mainData[ADD_VM_STEPS.HARDWARE].network.push(this.vmsAddSvc.networkDefault());
  }

  removeNewNetwork(i: number) {
    this.mainData[ADD_VM_STEPS.HARDWARE].network.splice(i, 1);
  }

  addNVMeController() {
    let count = this.mainData[ADD_VM_STEPS.HARDWARE].nvmeControllers.length;
    if (count == 4) {
      this.notification.error(new Notification('Cannot add more than 4 NVMe controllers'));
    } else {
      this.mainData[ADD_VM_STEPS.HARDWARE].nvmeControllers.push({
        'label': `NVMe Controller ${count}`,
        'value': `NVMe Controller ${count}`
      });
    }
  }

  removeNVMeController(i: number) {
    this.mainData[ADD_VM_STEPS.HARDWARE].nvmeControllers.splice(i, 1);
  }

  addSataContoller() {
    let count = this.mainData[ADD_VM_STEPS.HARDWARE].sataControllers.length;
    if (count == 4) {
      this.notification.error(new Notification('Cannot add more than 4 SATA controllers'));
    } else {
      this.mainData[ADD_VM_STEPS.HARDWARE].sataControllers.push({
        'label': `SATA Controller ${count}`,
        'value': `SATA Controller ${count}`
      });
    }
  }

  removeSataContoller(i: number) {
    this.mainData[ADD_VM_STEPS.HARDWARE].sataControllers.splice(i, 1);
  }

  addScsiContoller() {
    let count = this.mainData[ADD_VM_STEPS.HARDWARE].scsiControllers.length;
    if (count == 4) {
      this.notification.error(new Notification('Cannot add more than 4 SCSI controllers'));
    } else {
      this.mainData[ADD_VM_STEPS.HARDWARE].scsiControllers.push({
        'label': `SCSI Controller ${count}`,
        'value': 'VirtualLsiLogicSASController'
      });
    }
  }

  removeNewScsiContoller(i: number) {
    this.mainData[ADD_VM_STEPS.HARDWARE].scsiControllers.splice(i, 1);
  }

  addUSBController() {
    if (this.mainData[ADD_VM_STEPS.HARDWARE].usbControllers.length == 2) {
      this.notification.error(new Notification('Cannot add more than 2 USB controllers'));
    } else if (this.mainData[ADD_VM_STEPS.HARDWARE].usbControllers.length == 1) {
      if (this.mainData[ADD_VM_STEPS.HARDWARE].usbControllers[0] == 'USB Controller') {
        this.mainData[ADD_VM_STEPS.HARDWARE].usbControllers.push('USB xHCI Controller');
      } else {
        this.mainData[ADD_VM_STEPS.HARDWARE].usbControllers.push('USB Controller');
      }
    } else {
      this.mainData[ADD_VM_STEPS.HARDWARE].usbControllers.push('USB Controller');
    }
  }

  removeUSBController(i: number) {
    this.mainData[ADD_VM_STEPS.HARDWARE].usbControllers.splice(i, 1);
  }

  changeUSBController(index: number) {
    setTimeout(() => {
      if (this.mainData[ADD_VM_STEPS.HARDWARE].usbControllers.length == 2) {
        this.notification.error(new Notification('Same USB controller cannot be added more than once'));
        if (this.mainData[ADD_VM_STEPS.HARDWARE].usbControllers[index] == 'USB Controller') {
          this.mainData[ADD_VM_STEPS.HARDWARE].usbControllers[index] = 'USB xHCI Controller';
        } else {
          this.mainData[ADD_VM_STEPS.HARDWARE].usbControllers[index] = 'USB Controller';
        }
      }
    }, 10);
  }

  submit() {
    let data = this.vmsAddSvc.convertToVMCreationData(this.mainData);
    this.spinner.start('main');
    this.vmsAddSvc.createVM(this.pcId, this.cloudNameForApi, data).pipe(catchError((e: HttpErrorResponse) => {
      return throwError(e);
    }), switchMap(res => {
      if (res.task_id) {
        this.spinner.stop('main');
        this.addVmModelRef.hide();
        this.notification.success(new Notification('VM creation in progress!!'));
        return this.appService.pollForTask(res.task_id, 3, 200).pipe(take(1));
      } else {
        throw new Error('Something went wrong');
      }
    }), takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.created.emit();
      this.notification.success(new Notification('VM created successfully. Please wait latest data is being updated'));
    }, err => {
      this.notification.error(new Notification(err.error.detail));
      // this.notification.error(new Notification('Error while creating VM. Please try again later!!'));
      this.spinner.stop('main');
    });
  }

  getVMHardwareConfig() {
    this.vmsAddSvc.getVMHardwareConfig(this.pcId, this.cloudNameForApi, this.editMetaData.name).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      if (res && res.result && res.result.data) {
        this.editMetaData.config = res.result.data;
        this.editMetaData.editable = this.editMetaData.config.controller_editable;
        this.editData = this.createEditConfigData(this.editMetaData.config);
        if (this.metaData && this.metaData.length) {
          this.metaData.map(md => {
            this.storage = this.storage.concat(md.datastore);
            this.network = this.network.concat(md.network);
          })
          this.isoList = [];
          this.editVmModelRef = this.modalService.show(this.editVMRef, Object.assign({}, { class: 'modal-xl', keyboard: true, ignoreBackdropClick: true }));
        } else {
          this.notification.error(new Notification('Failed to fetch vm details'));
          this.spinner.stop('main');
        }
      } else {
        this.notification.error(new Notification('Failed to fetch vm details'));
        this.spinner.stop('main');
        return;
      }
    }, err => {
      this.notification.error(new Notification(err.error.detail));
      // this.notification.error(new Notification('Error while updating VM settings. Please try again later!!'));
      this.spinner.stop('main');
    });
  }

  createEditConfigData(data: EditVMHardwareConfigType) {
    let freespace = data.datastore[0].summary.freeSpace.split(' ');
    let freespaceInBytes = this.utilSvc.convertSizeToBytes(Number(freespace[0]), freespace[1])
    let obj = {
      name: this.editMetaData.name,
      cpu: data.cpu.value,
      cpuExpand: false,
      cpuHotAdd: data.cpu.hot_add_cpu,

      memory: {
        memory: data.memory.value,
        memoryUnit: data.memory.unit,
        memoryError: '',
        memoryExpand: false,
        memoryHotAdd: data.memory.hot_add_memory,
      },
      dataStore: {},
      hardDisks: data.harddisk.map(hd => Object.assign({
        hardDiskError: '', hardDiskExpand: false, hardDisk: hd.value,
        hardDiskUnit: hd.unit, hardDiskDeleted: false
      }, hd)),
      newHardDisks: [],
      network: data.network.map(nw => Object.assign({ networkError: '', networkDeleted: false }, nw)),
      newNetwork: [],
      cdrom: Object.assign({
        changeDrive: false,
        label: 'New CD/DVD Drive',
        value: '',
        selectedValue: '',
        boot_option: '',
        iso_storage: '',
        library_storage: '',
        iso: '',
        isoError: '',
      }, data.cdrom),
      video_card: Object.assign(
        {
          vcError: '',
          vcExpand: false,
          vcSettings: data.video_card.settings,
          vcSettingsErr: '',
          vcNumDisplay: data.video_card.num_display,
          vcNumDisplayErr: '',
          vcRamSize: data.video_card.ram_size_in_MB,
          vcRamSizeErr: ''
        }, data.video_card),
      storageControllers: data.storage_controller_list,
      USB_xHCI_controller: data.USB_xHCI_controller ? data.USB_xHCI_controller : null,
      USB_controller: data.USB_controller ? data.USB_controller : null,
      newUSBController: [],
      NVMe_controller: data.NVMe_controller ? data.NVMe_controller : [],
      newNVMe_controller: [],
      SATA_controller: data.SATA_controller ? data.SATA_controller : [],
      newSATA_controller: [],
      oldSCSI_controller: data.SCSI_controller ? data.SCSI_controller : [],
      newSCSI_controller: []
    };
    if (data.harddisk.length) {
      obj['dataStore'] = {
        name: data.harddisk[0].datastore.name,
        summary: {
          freespace: data.harddisk[0].datastore.summary.freeSpace,
          capacity: data.harddisk[0].datastore.summary.capacity,
          freespaceInBytes: freespaceInBytes
        }
      }
    } else {
      obj['dataStore'] = {
        name: data.datastore[0].name,
        summary: {
          freespace: data.datastore[0].summary.freeSpace,
          capacity: data.datastore[0].summary.capacity,
          freespaceInBytes: freespaceInBytes
        }
      }
    }
    if (data.cdrom && data.cdrom.value) {
      obj.cdrom.selectedValue = data.cdrom.value;
    } else {
      obj.cdrom.changeDrive = true;
    }
    return obj;
  }

  addNewHardDiskToEdit() {
    this.editData.newHardDisks.push(this.vmsAddSvc.hardDiskDefault());
  }

  removeNewHardDiskToEdit(i: number) {
    this.editData.newHardDisks.splice(i, 1);
  }

  removeOldHardDiskToEdit(i: number) {
    this.editData.hardDisks[i].hardDiskDeleted = true;
  }

  restoreOldHardDiskToEdit(i: number) {
    this.editData.hardDisks[i].hardDiskDeleted = false;
  }

  addNewNetworkToEdit() {
    this.editData.newNetwork.push(this.vmsAddSvc.networkDefault());
  }

  removeNewNetworkToEdit(i: number) {
    this.editData.newNetwork.splice(i, 1);
  }

  removeOldNetworkToEdit(i: number) {
    this.editData.network[i].networkDeleted = true;
  }

  restoreOldNetworkToEdit(i: number) {
    this.editData.network[i].networkDeleted = false;
  }

  addNVMeControllerToEdit() {
    let count = this.editData.newNVMe_controller.length + this.editData.NVMe_controller.length;
    if (count == 4) {
      this.notification.error(new Notification('Cannot add more than 4 NVMe controllers'));
    } else {
      this.editData.newNVMe_controller.push({
        'label': `NVMe Controller ${count}`,
        'value': `NVMe Controller ${count}`
      });
    }
  }

  removeNVMeControllerToEdit(i: number) {
    this.editData.newNVMe_controller.splice(i, 1);
  }

  addSataContollerToEdit() {
    let count = this.editData.newSATA_controller.length + this.editData.SATA_controller.length;
    if (count == 4) {
      this.notification.error(new Notification('Cannot add more than 4 SATA controllers'));
    } else {
      this.editData.newSATA_controller.push({
        'label': `SATA Controller ${count}`,
        'value': `SATA Controller ${count}`
      });
    }
  }

  removeSataContollerToEdit(i: number) {
    this.editData.newSATA_controller.splice(i, 1);
  }

  addScsiContollerToEdit() {
    let count = this.editData.newSCSI_controller.length + this.editData.oldSCSI_controller.length;
    if (count == 4) {
      this.notification.error(new Notification('Cannot add more than 4 SCSI controllers'));
    } else {
      this.editData.newSCSI_controller.push({
        'label': `SCSI Controller ${count}`,
        'value': 'VirtualLsiLogicSASController'
      });
    }
  }

  removeNewScsiContollerToEdit(i: number) {
    this.editData.newSCSI_controller.splice(i, 1);
  }

  addUSBControllerToEdit() {
    //(Check if both are old usb controllers) OR (1 old controller AND 1 new controller) OR (both new controller)
    if ((this.editData.USB_controller && this.editData.USB_xHCI_controller)
      ||
      ((this.editData.USB_controller || this.editData.USB_xHCI_controller) && this.editData.newUSBController.length == 1)
      ||
      this.editData.newUSBController.length == 2) {
      this.notification.error(new Notification('Cannot add more than 2 USB controllers'));
    } else if (this.editData.USB_controller) {
      this.editData.newUSBController.push('USB xHCI controller');
    } else if (this.editData.USB_xHCI_controller) {
      this.editData.newUSBController.push('USB controller');
    } else if (this.editData.newUSBController.length == 1) {
      if (this.editData.newUSBController[0] == 'USB controller') {
        this.editData.newUSBController.push('USB xHCI controller');
      } else {
        this.editData.newUSBController.push('USB controller');
      }
    } else {
      this.editData.newUSBController.push('USB controller');
    }
  }

  removeUSBControllerToEdit(i: number) {
    this.editData.newUSBController.splice(i, 1);
  }

  changeUSBControllerToEdit(index: number) {
    setTimeout(() => {
      if (this.editData.newUSBController.length == 2) {
        this.notification.error(new Notification('Same USB controller cannot be added more than once'));
        if (this.editData.newUSBController[index] == 'USB controller') {
          this.editData.newUSBController[index] = 'USB xHCI controller';
        } else {
          this.editData.newUSBController[index] = 'USB controller';
        }
      }
    }, 10);
  }

  resetEditVideoCardSettings() {
    this.editData.video_card.vcNumDisplay = 1;
    this.editData.video_card.vcNumDisplayErr = '';
    this.editData.video_card.vcRamSize = 2;
    this.editData.video_card.vcRamSizeErr = '';
    if (this.editData.video_card.vcSettings == 'custom') {
      this.editData.video_card.vcExpand = true;
    } else {
      this.editData.video_card.vcExpand = false;
    }
  }

  changeEditDrive() {
    this.editData.cdrom.changeDrive = !this.editData.cdrom.changeDrive;
    this.editData.cdrom.selectedValue = '';
  }

  cancelEditDrive() {
    this.editData.cdrom.changeDrive = !this.editData.cdrom.changeDrive;
    this.editData.cdrom.selectedValue = this.editData.cdrom.value;
    this.editData.cdrom.boot_option = '';
    this.editData.cdrom.iso = '';
    this.editData.cdrom.iso_storage = '';
    this.editData.cdrom.library_storage = '';
    this.isoList = [];
  }

  editBootOptionChanged($event: string) {
    if ($event == 'content library iso' && this.libraryError) {
      this.notification.error(new Notification('Error while fetching libraries. Please try again!!'));
      return;
    }
    this.editData.cdrom.boot_option = $event;
    this.isoList = [];
  }

  selectEditStorageForISO(stgName: string) {
    this.editData.cdrom.iso_storage = stgName;
    this.editData.cdrom.iso = '';
    this.isoList = [];
    this.spinner.start('main');
    this.vmsAddSvc.getISOList(this.pcId, stgName).pipe(takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.isoList = res;
    }, err => {
      this.notification.error(new Notification('Error while fetching iso files for selected storage'));
      this.spinner.stop('main');
    });
  }

  selectEditLibrariesForISO(libId: string) {
    this.editData.cdrom.library_storage = libId;
    this.editData.cdrom.iso = '';
    this.isoList = [];
    this.spinner.start('main');
    this.vmsAddSvc.getLibraryISOList(this.pcId, libId).pipe(catchError((e: HttpErrorResponse) => {
      return throwError(e);
    }), switchMap(res => {
      // return of({ "state": "SUCCESS", "result": { "message": "Success", "data": [{ "item_id": "d175f7bd-e7f1-42f7-aa4e-bd92668eb918", "file_name": "VMware-VMvisor-Installer-6.7.0.update03-17700523.x86_64-DellEMC_Customized-A11", "file_size": "345.8 MB" }, { "item_id": "59ef8071-7958-4b1d-888b-c7c92aecb43a", "file_name": "fever", "file_size": "259.0 bytes" }] } })
      return this.appService.pollForTask(res.task_id, 3, 300).pipe(take(1));
    }), take(1), takeUntil(this.ngUnsubscribe)).subscribe(res => {
      this.spinner.stop('main');
      this.isoList = (<Array<{ file_name: string, item_id: string, iso_file: string, type: string }>>res.result.data).filter(f => f.type == 'iso')
    }, err => {
      this.spinner.stop('main');
      this.notification.error(new Notification('Error while fetching iso files for selected library'));
    });
  }

  selectEditISO(isoPath: string) {
    this.editData.cdrom.iso = isoPath;
    this.editData.cdrom.selectedValue = isoPath;
    this.vmsAddSvc.validateHardwareISO(this.editData.cdrom);
  }

  submitEdit() {
    if (this.vmsAddSvc.validateEditConfig(this.editData)) {
      let data = this.vmsAddSvc.convertToVMEditConfigData(this.editData);
      this.vmsAddSvc.submitEditConfig(this.pcId, this.cloudNameForApi, data).pipe(catchError((e: HttpErrorResponse) => {
        return throwError(e);
      }), switchMap(res => {
        this.editVmModelRef.hide();
        this.notification.success(new Notification('Request is being processed. Status will be updated shortly'));
        return this.appService.pollForTask(res.task_id, 3, 200).pipe(take(1));
      }), take(1), takeUntil(this.ngUnsubscribe)).subscribe(res => {
        this.notification.success(new Notification('VM hardware config has been updated successfully.'));
      }, err => {
        this.notification.error(new Notification('VM hardware config update failed. Please try again!!'));
      });
    }
  }
}
