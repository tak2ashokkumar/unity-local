export interface SshWinRmCrudType {
  connection_type: null;
  mon_connection_type: 'SSH' | 'WinRM';
  mon_port: number;
  host_ip: string;
  mon_credential_mode: 'local' | 'manual';
  mon_credential_id?: string;
  mon_username?: string;
  mon_password?: string;
  mtp_templates: number[];
}