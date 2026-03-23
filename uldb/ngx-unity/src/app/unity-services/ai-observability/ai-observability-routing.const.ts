import { Routes } from "@angular/router";
import { AiObservabilityGpuComponent } from "./ai-observability-gpu/ai-observability-gpu.component";
import { AiObservabilityLlmComponent } from "./ai-observability-llm/ai-observability-llm.component";
import { AiObservabilityVectorDbComponent } from "./ai-observability-vector-db/ai-observability-vector-db.component";
import { AiObservabilityComponent } from "./ai-observability.component";
import { AiObservabilityLlmServicesComponent } from "./ai-observability-llm/ai-observability-llm-services/ai-observability-llm-services.component";
import { AiObservabilityGpuServicesComponent } from "./ai-observability-gpu/ai-observability-gpu-services/ai-observability-gpu-services.component";
import { AiObservabilityVectorDbServicesComponent } from "./ai-observability-vector-db/ai-observability-vector-db-services/ai-observability-vector-db-services.component";
import { AiObservabilityLlmZabbixComponent } from "./ai-observability-llm/ai-observability-llm-services/ai-observability-llm-zabbix/ai-observability-llm-zabbix.component";
import { LLM_ZABBIX_ROUTES } from "./ai-observability-llm/ai-observability-llm-services/ai-observability-llm-zabbix/ai-observability-llm-zabbix-routing.const";
import { AiObservabilityVectorDbServiceZabbixComponent } from "./ai-observability-vector-db/ai-observability-vector-db-services/ai-observability-vector-db-service-zabbix/ai-observability-vector-db-service-zabbix.component";
import { VECTORDB_SERVICE_ZABBIX_ROUTES } from "./ai-observability-vector-db/ai-observability-vector-db-services/ai-observability-vector-db-service-zabbix/ai-observability-vector-db-service-zabbix-routing.const";
import { AiObservabilityGpuServiceZabbixComponent } from "./ai-observability-gpu/ai-observability-gpu-services/ai-observability-gpu-service-zabbix/ai-observability-gpu-service-zabbix.component";
import { GPU_SERVICE_ZABBIX_ROUTES } from "./ai-observability-gpu/ai-observability-gpu-services/ai-observability-gpu-service-zabbix/ai-observability-gpu-service-zabbix-routing.const";
import { AiObservabilityVectorDbSummaryComponent } from "./ai-observability-vector-db/ai-observability-vector-db-summary/ai-observability-vector-db-summary.component";
import { AiObservabilityLlmSummaryComponent } from "./ai-observability-llm/ai-observability-llm-summary/ai-observability-llm-summary.component";
import { AiObservabilityGpuSummaryComponent } from "./ai-observability-gpu/ai-observability-gpu-summary/ai-observability-gpu-summary.component";

export const AI_OBSERVABILITY_ROUTES: Routes = [
    {
        path: 'ai-observability',
        component: AiObservabilityComponent,
        data: {
            breadcrumb: {
                title: 'AI Observability',
                stepbackCount: 0
            }
        },
        children: [
            {
                path: 'llm',
                component: AiObservabilityLlmComponent,
                data: {
                    breadcrumb: {
                        title: 'LLM',
                        stepbackCount: 0
                    }
                },
                children: [
                    {
                        path: 'summary',
                        component: AiObservabilityLlmSummaryComponent,
                        data: {
                            breadcrumb: {
                                title: 'Summary',
                                stepbackCount: 0
                            }
                        }
                    },
                    {
                        path: 'services',
                        component: AiObservabilityLlmServicesComponent,
                        data: {
                            breadcrumb: {
                                title: 'Services',
                                stepbackCount: 0
                            }
                        }
                    },
                    {
                        path: 'services/:Id/zbx',
                        component: AiObservabilityLlmZabbixComponent,
                        data: {
                            breadcrumb: {
                                title: 'Service',
                                stepbackCount: 2
                            }
                        },
                        children: LLM_ZABBIX_ROUTES
                    },
                ]
            },
            {
                path: 'vector-db',
                component: AiObservabilityVectorDbComponent,
                data: {
                    breadcrumb: {
                        title: 'Vector DB',
                        stepbackCount: 0
                    }
                },
                children: [
                    {
                        path: 'summary',
                        component: AiObservabilityVectorDbSummaryComponent,
                        data: {
                            breadcrumb: {
                                title: 'Summary',
                                stepbackCount: 0
                            }
                        }
                    },
                    {
                        path: 'services',
                        component: AiObservabilityVectorDbServicesComponent,
                        data: {
                            breadcrumb: {
                                title: 'Services',
                                stepbackCount: 0
                            }
                        }
                    },
                    {
                        path: 'services/:Id/zbx',
                        component: AiObservabilityVectorDbServiceZabbixComponent,
                        data: {
                            breadcrumb: {
                                title: 'Service',
                                stepbackCount: 2
                            }
                        },
                        children: VECTORDB_SERVICE_ZABBIX_ROUTES
                    },
                ]
            },
            {
                path: 'gpu',
                component: AiObservabilityGpuComponent,
                data: {
                    breadcrumb: {
                        title: 'GPU',
                        stepbackCount: 0
                    }
                },
                children: [
                    {
                        path: 'summary',
                        component: AiObservabilityGpuSummaryComponent,
                        data: {
                            breadcrumb: {
                                title: 'Summary',
                                stepbackCount: 0
                            }
                        }
                    },
                    {
                        path: 'services',
                        component: AiObservabilityGpuServicesComponent,
                        data: {
                            breadcrumb: {
                                title: 'Services',
                                stepbackCount: 0
                            }
                        }
                    },
                    {
                        path: 'services/:Id/zbx',
                        component: AiObservabilityGpuServiceZabbixComponent,
                        data: {
                            breadcrumb: {
                                title: 'Service',
                                stepbackCount: 0
                            }
                        },
                        children: GPU_SERVICE_ZABBIX_ROUTES
                    }
                ]
            }
        ]
    },
]
