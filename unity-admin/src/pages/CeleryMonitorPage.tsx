import { useList } from '../data/useResource';
import { ApiRecord } from '../data/types';
import { FieldDef } from '../config/fieldTypes';
import { Card, CardHead, Badge, Button, LoadingBlock, EmptyState } from '../components/ui/primitives';
import { DataTable } from '../components/ui/DataTable';

// Celery Jobs (legacy /integ/celery_monitor): running task queue + active workers.
/* Field names come from ULDBService2.celeryTask() (uldb-service.js:3155): id,
   task_name, state, elapsed, start_time, end_time. The port invented name/worker/
   received/runtime, which exist nowhere in the API - those columns rendered blank
   against a real backend and only looked right because the mock was written to
   match the React code rather than the API. */
const TASK_COLUMNS: FieldDef[] = [
  { name: 'id', label: 'Task ID', cell: 'mono' },
  { name: 'task_name', label: 'Task Name', cell: 'text' },
  {
    name: 'state',
    label: 'State',
    cell: 'badge',
    badgeMap: {
      SUCCESS: 'success',
      STARTED: 'info',
      PENDING: 'neutral',
      RETRY: 'warning',
      FAILURE: 'danger',
      REVOKED: 'danger',
    },
  },
  { name: 'elapsed', label: 'Seconds Elapsed', cell: 'number', align: 'right' },
  { name: 'start_time', label: 'Start Time', cell: 'datetime' },
  { name: 'end_time', label: 'End Time', cell: 'datetime' },
];

const WORKER_COLUMNS: FieldDef[] = [
  { name: 'name', label: 'Worker', cell: 'text' },
  { name: 'pid', label: 'PID', cell: 'mono', align: 'right' },
];

export function CeleryMonitorPage() {
  const tasks = useList<ApiRecord>('celery_task');
  const workers = useList<ApiRecord>('celery_worker');

  const reloadAll = () => {
    tasks.reload();
    workers.reload();
  };

  const activeCount = tasks.items.filter((t) => t.state === 'STARTED' || t.state === 'PENDING' || t.state === 'RETRY').length;
  const failedCount = tasks.items.filter((t) => t.state === 'FAILURE').length;

  return (
    <div className="content-fade">
      <Card style={{ marginBottom: 18 }}>
        <CardHead
          title="Workers"
          icon="cpu"
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Badge tone="brand">{workers.count} online</Badge>
              <Button variant="default" size="sm" icon="refresh-cw" onClick={reloadAll}>
                Refresh
              </Button>
            </div>
          }
        />
        {workers.loading ? (
          <LoadingBlock label="Loading workers..." />
        ) : workers.error ? (
          <EmptyState
            icon="alert-triangle"
            title="Couldn't load workers"
            message={workers.error}
            action={
              <Button variant="default" size="sm" icon="refresh-cw" onClick={() => workers.reload()}>
                Retry
              </Button>
            }
          />
        ) : workers.items.length === 0 ? (
          <EmptyState icon="cpu" title="No workers online" message="No Celery workers are currently reporting in." />
        ) : (
          <DataTable columns={WORKER_COLUMNS} rows={workers.items} idField="pid" showActions={false} />
        )}
      </Card>

      <Card>
        <CardHead
          title="Tasks"
          icon="list-checks"
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Badge tone="info">{activeCount} active</Badge>
              {failedCount > 0 && <Badge tone="danger">{failedCount} failed</Badge>}
              <Badge tone="neutral">{tasks.count} total</Badge>
            </div>
          }
        />
        {tasks.loading ? (
          <LoadingBlock label="Loading tasks..." />
        ) : tasks.error ? (
          <EmptyState
            icon="alert-triangle"
            title="Couldn't load tasks"
            message={tasks.error}
            action={
              <Button variant="default" size="sm" icon="refresh-cw" onClick={() => tasks.reload()}>
                Retry
              </Button>
            }
          />
        ) : tasks.items.length === 0 ? (
          <EmptyState icon="list-checks" title="No tasks" message="The Celery queue is currently empty." />
        ) : (
          <DataTable columns={TASK_COLUMNS} rows={tasks.items} idField="id" showActions={false} />
        )}
      </Card>
    </div>
  );
}
