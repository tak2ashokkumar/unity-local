/**
 * Created by rt on 9/28/16.
 */


var app = angular.module('uldb');

app.factory('FixtureService', [
    function () {
        var PRODUCTS = [
            {
                "attributes": {
                    "type": "Product2",
                    "url": "/services/data/v29.0/sobjects/Product2/01tR0000002o13SIAQ"
                },
                "Id": "01tR0000002o13SIAQ",
                "Name": "MSP:MPC:Compute:1CPU",
                "ProductCode": null,
                "CreatedById": "00560000001eLaUAAU",
                "IsActive": true,
                "LastModifiedById": "00560000001eLaUAAU",
                "Description": null,
                "Family": "MSP:PrivateCloud",
                "Unity_Enabled_Product__c": true
            },
            {
                "attributes": {
                    "type": "Product2",
                    "url": "/services/data/v29.0/sobjects/Product2/01tR0000002o13XIAQ"
                },
                "Id": "01tR0000002o13XIAQ",
                "Name": "MSP:MPC:Compute:1G RAM",
                "ProductCode": null,
                "CreatedById": "00560000001eLaUAAU",
                "IsActive": true,
                "LastModifiedById": "00560000001eLaUAAU",
                "Description": null,
                "Family": "MSP:PrivateCloud",
                "Unity_Enabled_Product__c": true
            },
            {
                "attributes": {
                    "type": "Product2",
                    "url": "/services/data/v29.0/sobjects/Product2/01tR0000002o13mIAA"
                },
                "Id": "01tR0000002o13mIAA",
                "Name": "MSP:MPC:Storage:1TB:Enterprise",
                "ProductCode": null,
                "CreatedById": "00560000001eLaUAAU",
                "IsActive": true,
                "LastModifiedById": "00560000001eLaUAAU",
                "Description": null,
                "Family": "MSP:PrivateCloud",
                "Unity_Enabled_Product__c": true
            },
            {
                "attributes": {
                    "type": "Product2",
                    "url": "/services/data/v29.0/sobjects/Product2/01tR0000002o13hIAA"
                },
                "Id": "01tR0000002o13hIAA",
                "Name": "MSP:MPC:Storage:1TB:Standard",
                "ProductCode": null,
                "CreatedById": "00560000001eLaUAAU",
                "IsActive": true,
                "LastModifiedById": "00560000001eLaUAAU",
                "Description": null,
                "Family": "MSP:PrivateCloud",
                "Unity_Enabled_Product__c": true
            },
            {
                "attributes": {
                    "type": "Product2",
                    "url": "/services/data/v29.0/sobjects/Product2/01tR0000002o13rIAA"
                },
                "Id": "01tR0000002o13rIAA",
                "Name": "MSP:MPC:Labor",
                "ProductCode": null,
                "CreatedById": "00560000001eLaUAAU",
                "IsActive": true,
                "LastModifiedById": "00560000001eLaUAAU",
                "Description": null,
                "Family": "MSP:PrivateCloud",
                "Unity_Enabled_Product__c": true
            },
            {
                "attributes": {
                    "type": "Product2",
                    "url": "/services/data/v29.0/sobjects/Product2/01tR0000002o13cIAA"
                },
                "Id": "01tR0000002o13cIAA",
                "Name": "MSP:MPC:Switch:1G",
                "ProductCode": null,
                "CreatedById": "00560000001eLaUAAU",
                "IsActive": true,
                "LastModifiedById": "00560000001eLaUAAU",
                "Description": null,
                "Family": "MSP:PrivateCloud",
                "Unity_Enabled_Product__c": true
            }
        ];

        var OPPORTUNITIES = [
            {
                "attributes": {
                    "type": "Opportunity",
                    "url": "/services/data/v29.0/sobjects/Opportunity/006R000000BtqqmIAB"
                },
                "Id": "006R000000BtqqmIAB",
                "Name": "Dev Cloud",
                "Owner": {
                    "attributes": {
                        "type": "User",
                        "url": "/services/data/v29.0/sobjects/User/00560000001eLaUAAU"
                    },
                    "Name": "Unitedlayer SF-Admin"
                },
                "Email__c": "rtapia@unitedlayer.com",
                "Account": {
                    "attributes": {
                        "type": "Account",
                        "url": "/services/data/v29.0/sobjects/Account/001R0000016fWvzIAE"
                    },
                    "Name": "Dev"
                },
                "AccountId": "001R0000016fWvzIAE",
                "StageName": "Closed Won",
                "Unity_Enabled_Opportunity__c": true,
                "OpportunityLineItems": {
                    "totalSize": 6,
                    "done": true,
                    "records": [
                        {
                            "attributes": {
                                "type": "OpportunityLineItem",
                                "url": "/services/data/v29.0/sobjects/OpportunityLineItem/00kR0000007ireNIAQ"
                            },
                            "Id": "00kR0000007ireNIAQ",
                            "Quantity": 32.0,
                            "UnitPrice": 1.0,
                            "ListPrice": 1.0,
                            "TotalPrice": 32.0,
                            "PricebookEntry": {
                                "attributes": {
                                    "type": "PricebookEntry",
                                    "url": "/services/data/v29.0/sobjects/PricebookEntry/01uR0000007zZ8mIAE"
                                },
                                "Product2Id": "01tR0000002o13SIAQ",
                                "Product2": {
                                    "attributes": {
                                        "type": "Product2",
                                        "url": "/services/data/v29.0/sobjects/Product2/01tR0000002o13SIAQ"
                                    },
                                    "Name": "MSP:MPC:Compute:1CPU",
                                    "Unity_Enabled_Product__c": true
                                },
                                "UnitPrice": 1.0
                            }
                        },
                        {
                            "attributes": {
                                "type": "OpportunityLineItem",
                                "url": "/services/data/v29.0/sobjects/OpportunityLineItem/00kR0000007ireOIAQ"
                            },
                            "Id": "00kR0000007ireOIAQ",
                            "Quantity": 128.0,
                            "UnitPrice": 1.0,
                            "ListPrice": 1.0,
                            "TotalPrice": 128.0,
                            "PricebookEntry": {
                                "attributes": {
                                    "type": "PricebookEntry",
                                    "url": "/services/data/v29.0/sobjects/PricebookEntry/01uR0000007zZ8rIAE"
                                },
                                "Product2Id": "01tR0000002o13XIAQ",
                                "Product2": {
                                    "attributes": {
                                        "type": "Product2",
                                        "url": "/services/data/v29.0/sobjects/Product2/01tR0000002o13XIAQ"
                                    },
                                    "Name": "MSP:MPC:Compute:1G RAM",
                                    "Unity_Enabled_Product__c": true
                                },
                                "UnitPrice": 1.0
                            }
                        },
                        {
                            "attributes": {
                                "type": "OpportunityLineItem",
                                "url": "/services/data/v29.0/sobjects/OpportunityLineItem/00kR0000007ireRIAQ"
                            },
                            "Id": "00kR0000007ireRIAQ",
                            "Quantity": 5.0,
                            "UnitPrice": 100.0,
                            "ListPrice": 100.0,
                            "TotalPrice": 500.0,
                            "PricebookEntry": {
                                "attributes": {
                                    "type": "PricebookEntry",
                                    "url": "/services/data/v29.0/sobjects/PricebookEntry/01uR0000007zZ8wIAE"
                                },
                                "Product2Id": "01tR0000002o13hIAA",
                                "Product2": {
                                    "attributes": {
                                        "type": "Product2",
                                        "url": "/services/data/v29.0/sobjects/Product2/01tR0000002o13hIAA"
                                    },
                                    "Name": "MSP:MPC:Storage:1TB:Standard",
                                    "Unity_Enabled_Product__c": true
                                },
                                "UnitPrice": 100.0
                            }
                        },
                        {
                            "attributes": {
                                "type": "OpportunityLineItem",
                                "url": "/services/data/v29.0/sobjects/OpportunityLineItem/00kR0000007ireSIAQ"
                            },
                            "Id": "00kR0000007ireSIAQ",
                            "Quantity": 1.0,
                            "UnitPrice": 10.0,
                            "ListPrice": 10.0,
                            "TotalPrice": 10.0,
                            "PricebookEntry": {
                                "attributes": {
                                    "type": "PricebookEntry",
                                    "url": "/services/data/v29.0/sobjects/PricebookEntry/01uR0000007zZ91IAE"
                                },
                                "Product2Id": "01tR0000002o13cIAA",
                                "Product2": {
                                    "attributes": {
                                        "type": "Product2",
                                        "url": "/services/data/v29.0/sobjects/Product2/01tR0000002o13cIAA"
                                    },
                                    "Name": "MSP:MPC:Switch:1G",
                                    "Unity_Enabled_Product__c": true
                                },
                                "UnitPrice": 10.0
                            }
                        },
                        {
                            "attributes": {
                                "type": "OpportunityLineItem",
                                "url": "/services/data/v29.0/sobjects/OpportunityLineItem/00kR0000007ireQIAQ"
                            },
                            "Id": "00kR0000007ireQIAQ",
                            "Quantity": 1.0,
                            "UnitPrice": 500.0,
                            "ListPrice": 500.0,
                            "TotalPrice": 500.0,
                            "PricebookEntry": {
                                "attributes": {
                                    "type": "PricebookEntry",
                                    "url": "/services/data/v29.0/sobjects/PricebookEntry/01uR0000007zZ96IAE"
                                },
                                "Product2Id": "01tR0000002o13mIAA",
                                "Product2": {
                                    "attributes": {
                                        "type": "Product2",
                                        "url": "/services/data/v29.0/sobjects/Product2/01tR0000002o13mIAA"
                                    },
                                    "Name": "MSP:MPC:Storage:1TB:Enterprise",
                                    "Unity_Enabled_Product__c": true
                                },
                                "UnitPrice": 500.0
                            }
                        },
                        {
                            "attributes": {
                                "type": "OpportunityLineItem",
                                "url": "/services/data/v29.0/sobjects/OpportunityLineItem/00kR0000007irePIAQ"
                            },
                            "Id": "00kR0000007irePIAQ",
                            "Quantity": 1.0,
                            "UnitPrice": 5000.0,
                            "ListPrice": 5000.0,
                            "TotalPrice": 5000.0,
                            "PricebookEntry": {
                                "attributes": {
                                    "type": "PricebookEntry",
                                    "url": "/services/data/v29.0/sobjects/PricebookEntry/01uR0000007zZ9BIAU"
                                },
                                "Product2Id": "01tR0000002o13rIAA",
                                "Product2": {
                                    "attributes": {
                                        "type": "Product2",
                                        "url": "/services/data/v29.0/sobjects/Product2/01tR0000002o13rIAA"
                                    },
                                    "Name": "MSP:MPC:Labor",
                                    "Unity_Enabled_Product__c": true
                                },
                                "UnitPrice": 5000.0
                            }
                        }
                    ]
                }
            }
        ];

        return {
            PRODUCTS: PRODUCTS,
            OPPORTUNITIES: OPPORTUNITIES
        };
    }
]);

