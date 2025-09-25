import { apiClient } from "@/lib/api-client";

type TranslatePayload = {
  text: string;
  sourceLanguageId: string;
  targetLanguageId: string;
};

export interface TranslateResult {
  translation: string;
  detectedSourceLanguageId?: string;
  provider?: string;
}

export async function translateText(payload: TranslatePayload): Promise<TranslateResult> {
  const response = await apiClient.post<TranslateResult>("/translate", payload);
  return response.data;
}
