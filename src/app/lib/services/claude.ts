import { Anthropic } from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

export const MODELS = {
    SONNET: 'claude-3-sonnet-20240229',
    OPUS: 'claude-3-opus-20240229'
} as const;
