import { NextResponse } from "next/server";

type TranslateRequest = {
  text?: string;
  sourceLanguageId?: string;
  targetLanguageId?: string;
};

type ExternalTranslateResponse = {
  translatedText: string;
  detectedSourceLanguageId?: string;
};

function detectLanguage(text: string): string {
  const chineseCharacters = /[\u4e00-\u9fff]/;
  if (chineseCharacters.test(text)) {
    return "zh-CN";
  }
  const asciiLetters = /[A-Za-z]/;
  if (asciiLetters.test(text)) {
    return "en-US";
  }
  return "en-US";
}

function simpleFallbackTranslation(text: string, targetLanguageId: string): string {
  if (!text.trim()) {
    return "";
  }

  const dictionary: Record<string, Partial<Record<string, string>>> = {
    "欢迎来到新的 Web 工作台": {
      "en-US": "Welcome to the new web workspace",
      "ja-JP": "新しい Web ワークスペースへようこそ",
    },
    "扩展背景脚本已经连接到 PWA": {
      "en-US": "The extension background worker is connected to the PWA",
    },
    "Hello": {
      "zh-CN": "你好",
      "ja-JP": "こんにちは",
    },
    "Thank you": {
      "zh-CN": "谢谢你",
      "ja-JP": "ありがとうございます",
    },
  };

  const normalized = text.trim();
  const direct = dictionary[normalized]?.[targetLanguageId];
  if (direct) {
    return direct;
  }

  if (targetLanguageId.startsWith("en")) {
    return `${normalized} (translated to English)`;
  }
  if (targetLanguageId.startsWith("zh")) {
    return `${normalized}（已转换为中文语境）`;
  }
  if (targetLanguageId.startsWith("ja")) {
    return `${normalized}（翻訳済み）`;
  }

  return `${normalized} [${targetLanguageId}]`;
}

async function callExternalProvider(payload: Required<TranslateRequest>) {
  const endpoint = process.env.TRANSLATE_API_URL;
  if (!endpoint) {
    return null;
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.TRANSLATE_API_KEY
          ? { Authorization: `Bearer ${process.env.TRANSLATE_API_KEY}` }
          : {}),
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as ExternalTranslateResponse;
    if (!data.translatedText) {
      return null;
    }

    return data;
  } catch (error) {
    console.warn("External translation provider failed", error);
    return null;
  }
}

export async function POST(request: Request) {
  const body = (await request.json()) as TranslateRequest;
  const text = body.text?.toString() ?? "";
  const targetLanguageId = body.targetLanguageId ?? "en-US";
  const sourceLanguageId = body.sourceLanguageId ?? "auto";

  if (!text.trim()) {
    return NextResponse.json(
      { error: "Text is required" },
      { status: 400 },
    );
  }

  const payload = {
    text,
    targetLanguageId,
    sourceLanguageId: sourceLanguageId === "auto" ? detectLanguage(text) : sourceLanguageId,
  };

  const external = await callExternalProvider(payload);
  if (external) {
    return NextResponse.json({
      translation: external.translatedText,
      detectedSourceLanguageId: external.detectedSourceLanguageId ?? payload.sourceLanguageId,
      provider: "external",
    });
  }

  const translation = simpleFallbackTranslation(text, targetLanguageId);

  return NextResponse.json({
    translation,
    detectedSourceLanguageId: payload.sourceLanguageId,
    provider: "fallback",
  });
}
