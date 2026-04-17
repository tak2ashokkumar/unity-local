// Metadata contracts returned by the Dynamic report model APIs.
// These are used to build query filters and selectable output fields at runtime.
/**
 * Describes the Dynamic Reports Field Meta data contract used by Unity Reports.
 */
export interface DynamicReportsFieldMeta {
  /**
   * Describes the display name value in the Dynamic Reports Field Meta contract.
   */
  display_name: string;
  /**
   * Describes the name value in the Dynamic Reports Field Meta contract.
   */
  name: string;
  /**
   * Describes the url value in the Dynamic Reports Field Meta contract.
   */
  url: null | string;
  /**
   * Describes the operators value in the Dynamic Reports Field Meta contract.
   */
  operators: string[];
  /**
   * Describes the choices value in the Dynamic Reports Field Meta contract.
   */
  choices: ChoicesDataType[] | string[][];
  /**
   * Describes the query value in the Dynamic Reports Field Meta contract.
   */
  query: boolean;
  /**
   * Describes the type value in the Dynamic Reports Field Meta contract.
   */
  type: string;
}

/**
 * Describes the Choices Data Type data contract used by Unity Reports.
 */
export interface ChoicesDataType {
  /**
   * Describes the id value in the Choices Data Type contract.
   */
  id: number;
  /**
   * Describes the uuid value in the Choices Data Type contract.
   */
  uuid: string;
  /**
   * Describes the name value in the Choices Data Type contract.
   */
  name: string;
  // monitoring: Monitoring;
  /**
   * Describes the device type value in the Choices Data Type contract.
   */
  device_type: string;
}
