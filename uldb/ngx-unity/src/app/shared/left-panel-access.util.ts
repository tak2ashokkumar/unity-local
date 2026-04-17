import { UserInfoService } from './user-info.service';

export const canAccessAiInfraManagement = (userService: UserInfoService): boolean => {
    return !!userService.selfBrandedOrgName;
};

export const canAccessAiAgents = (userService: UserInfoService): boolean => {
    // return !!userService.isTenantOrg;
    return true;
};

export const canAccessCostAnalysis = (userService: UserInfoService): boolean => {
    return !userService.selfBrandedOrgName;
};
