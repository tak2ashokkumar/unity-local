import { api } from './apiClient';

/*
 * Celery task polling.
 *
 * Several legacy endpoints answer immediately with { task_id } and do the real work
 * in a worker; the panel then polls /task/<id>/ until it settles. This is the shared
 * form of TaskService/TaskService2 (services/task-service.js).
 */
interface TaskState {
  state?: string;
  result?: unknown;
}

const POLL_INTERVAL_MS = 1000;

export async function awaitTask<T = unknown>(taskId: string, limit = 20): Promise<T> {
  for (let i = 0; i < limit; i += 1) {
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    const t = await api.rawGet<TaskState>(`/task/${taskId}`);
    if (t?.state === 'SUCCESS') return t.result as T;
    if (t?.state === 'FAILURE') {
      throw new Error(typeof t.result === 'string' ? t.result : JSON.stringify(t.result ?? 'Task failed'));
    }
  }
  throw new Error(`Task is still running after ${limit}s. Check the backend for the outcome.`);
}
