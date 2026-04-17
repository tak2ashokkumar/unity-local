export const cloudAttributes = [
  {
    cloudType: "AWS",
    attributes: ["name", "account_id", "cloud_type", "aws_user", "access_key", "secret_key", "account_name"]
  },
  {
    cloudType: "Azure",
    attributes: ["name", "account_id", "cloud_type", "user_name", "subscription_id", "secret_key", "client_id", "tenant_id", "client_secret"
    ]
  },
  {
    cloudType: "GCP",
    attributes: ["name", "account_id", "cloud_type", "email", "project_id", "service_account_info"]
  },
  {
    cloudType: "OCI",
    attributes: ["name", "account_id", "cloud_type", "user_ocid", "tenancy_ocid", "region"]
  },
  {
    cloudType: "OpenStack",
    attributes: ["name", "account_id", "cloud_type", "hostname", "username", "password", "project", "user_domain", "project_domain"
    ]
  },
  {
    cloudType: "Proxmox",
    attributes: ["name", "account_id", "cloud_type", "host_address", "username", "password"]
  },
  {
    cloudType: "VMware vCenter",
    attributes: ["name", "account_id", "cloud_type", "hostname", "username", "password"]
  },
  {
    cloudType: "HyperV",
    attributes: ["name", "account_id", "cloud_type", "username", "password", "domain", "host_address"]
  },
  {
    cloudType: "Nutanix",
    attributes: ["name", "account_id", "cloud_type", "credentials", "hostname", "prism_type", "protection_domain_name"
    ]
  },
  {
    cloudType: "VMware vCloud Director",
    attributes: ["name", "account_id", "cloud_type", "endpoint", "username", "password"]
  },
  {
    cloudType: "ESXi",
    attributes: ["name", "account_id", "cloud_type", "username", "password", "hostname", "config", "port"]
  }
];

