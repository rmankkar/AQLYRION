import { env } from '../config/env.js';

export interface AISummaryRequest {
  tab: string;
  data: unknown;
  context?: string;
}

export interface AISummaryResponse {
  summary: string;
}

interface NvidiaNimChoice {
  message: {
    content: string;
  };
}

interface NvidiaNimResponse {
  choices: NvidiaNimChoice[];
}

export async function generateAISummary(request: AISummaryRequest): Promise<AISummaryResponse> {
  if (!env.nvidiaNimApiKey) {
    return { summary: 'AI summary not configured. Set NVIDIA_NIM_API_KEY to enable.' };
  }

  const systemPrompt = `You are an Azure DevOps reporting assistant. Given a serialized report view from a work-item dashboard, produce a concise, plain-language summary highlighting:

1. TOP RISKS — critical items needing attention (failing tests, blocked bugs, past-due stories)
2. KEY PATTERNS — notable counts/trends (status distribution, assignee load, complexity mix)
3. RECOMMENDATIONS — specific, actionable next steps

Format as 4-6 short bullets with bold lead-ins. Use plain language. Do not include PII or raw work-item IDs unless essential. Keep it scannable and executive-ready.`;

  const userPrompt = `Dashboard Tab: ${request.tab}\nContext: ${request.context ?? 'N/A'}\n\nReport Data:\n${JSON.stringify(request.data, null, 2)}\n\nPlease analyze this data and provide the summary above.`;

  try {
    const response = await fetch(`${env.nvidiaNimBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.nvidiaNimApiKey}`,
      },
      body: JSON.stringify({
        model: env.aiSummaryModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.5,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`NVIDIA NIM API error ${response.status}: ${errorText}`);
    }

    const result = (await response.json()) as NvidiaNimResponse;
    const summary = result.choices?.[0]?.message?.content?.trim() ?? '';

    if (!summary || summary.length < 10) {
      return { summary: 'AI summary returned an incomplete response. Please try again.' };
    }

    return { summary };
  } catch (error) {
    console.error('AI summary generation failed:', error);
    return {
      summary: 'AI summary unavailable. Please check your NVIDIA NIM configuration and try again.',
    };
  }
}
