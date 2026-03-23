import { StorageType } from './storage-type';

export interface IStorage {
    getByKey(key: string, storageType: StorageType): Object;
    put(key: string, object: Object, storageType: StorageType): void;
    removeByKey(key: string, storageType: StorageType): void;
    removeAll(storageType: StorageType): void;
    extractByKey(key: string, storageType: StorageType): Object;
}