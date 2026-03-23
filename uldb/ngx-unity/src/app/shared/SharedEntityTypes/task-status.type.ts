import { HttpErrorResponse } from '@angular/common/http';

export interface TaskStatus {
    state: StatusState;
    result: Result;
}
export interface Result {
    message: string;
    data: any;
    [key: string]: any;
}

export enum StatusState {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    FAILURE = 'FAILURE'
}

export class TaskError {
    private _error: string;
    constructor(msg: string) {
        this._error = msg;
    }

    get error() {
        return this._error;
    }
}

export interface ExecutionStatus {
    output: string;
    status: "Running" | "Success" | "Failed";
}