export const DATABASE_CONNECTION_TYPE = 'database';

export const DATABASE_ENGINE_OPTIONS = [
  { label: 'PostgreSQL', value: 'postgres' },
  { label: 'MySQL', value: 'mysql' },
  { label: 'MSSQL', value: 'mssql' },
  { label: 'Oracle', value: 'oracle' },
];

export const DATABASE_ENGINE_DEFAULT_PORTS: { [engine: string]: number } = {
  postgres: 5432,
  mysql: 3306,
  mssql: 1433,
  oracle: 1521,
};

export const DATABASE_AGENT_APPLICATION = 'Database Agent';
