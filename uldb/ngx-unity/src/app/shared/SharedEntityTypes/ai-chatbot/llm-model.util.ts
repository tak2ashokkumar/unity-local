import { SupportedLLMConfigData } from './llm-model.type';

export const DEFAULT_TOKEN_MULTIPLIER = '1.00x';

export function hasTokenMultiplier(model: SupportedLLMConfigData): boolean {
    return model?.cost_multiplier !== null &&
        model?.cost_multiplier !== undefined &&
        `${model.cost_multiplier}`.trim() !== '';
}

export function getTokenMultiplier(model: SupportedLLMConfigData): string | null {
    return hasTokenMultiplier(model) ? `${model.cost_multiplier}` : null;
}

export function getTokenMultiplierTooltip(model: SupportedLLMConfigData): string {
    const multiplier = getTokenMultiplier(model);
    if (!multiplier) {
        return '';
    }
    if (multiplier === DEFAULT_TOKEN_MULTIPLIER) {
        return 'This is the standard model against which token multipliers are measured.';
    }
    return `This model consumes roughly ${multiplier} more tokens than standard model.`;
}
