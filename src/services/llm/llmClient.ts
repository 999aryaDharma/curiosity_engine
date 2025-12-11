// src/services/llm/llmClient.ts

import axios, { AxiosInstance } from "axios";
import { LLM_CONFIG } from "@constants/config";
import { ApiError } from "@type/common.types";

export interface LLMRequest {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
}

class LLMClient {
  private client: AxiosInstance;
  private apiKey: string = "";

  constructor() {
    this.client = axios.create({
      baseURL: LLM_CONFIG.GEMINI.BASE_URL,
      timeout: LLM_CONFIG.TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  setApiKey(key: string): void {
    this.apiKey = key;
  }

  async generate(request: LLMRequest): Promise<LLMResponse> {
    if (!this.apiKey) {
      throw new Error("Gemini API key not set");
    }

    try {
      return await this.generateGemini(request);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  private async generateGemini(request: LLMRequest): Promise<LLMResponse> {
    const systemInstruction = request.systemPrompt
      ? {
          parts: [
            {
              text: request.systemPrompt,
            },
          ],
        }
      : undefined;

    const response = await this.client.post(
      `/models/${LLM_CONFIG.GEMINI.MODEL}:generateContent?key=${this.apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: request.prompt,
              },
            ],
          },
        ],
        systemInstruction,
        generationConfig: {
          temperature: request.temperature || LLM_CONFIG.GEMINI.TEMPERATURE,
        },
      }
    );

    const candidate = response.data.candidates?.[0];

    if (!candidate) {
      throw new Error("No response from Gemini");
    }

    const content = candidate.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error("Empty response from Gemini");
    }

    return {
      content,
      usage: {
        promptTokens: response.data.usageMetadata?.promptTokenCount || 0,
        completionTokens:
          response.data.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: response.data.usageMetadata?.totalTokenCount || 0,
      },
      model: LLM_CONFIG.GEMINI.MODEL,
    };
  }

  async generateWithRetry(
    request: LLMRequest,
    maxRetries: number = LLM_CONFIG.MAX_RETRIES
  ): Promise<LLMResponse> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          await this.sleep(LLM_CONFIG.RETRY_DELAY * attempt);
          console.log(`[LLM] Retry attempt ${attempt}/${maxRetries}`);
        }

        return await this.generate(request);
      } catch (error: any) {
        lastError = error;
        console.error(`[LLM] Attempt ${attempt + 1} failed:`, error.message);

        if (attempt === maxRetries) {
          break;
        }
      }
    }

    throw lastError || new Error("LLM generation failed after retries");
  }

  private handleError(error: any): ApiError {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error?.message || error.message;

      if (status === 400) {
        return {
          code: "INVALID_REQUEST",
          message: message || "Invalid request to Gemini API",
        };
      } else if (status === 403) {
        return {
          code: "INVALID_API_KEY",
          message: "Invalid Gemini API key",
        };
      } else if (status === 429) {
        return {
          code: "RATE_LIMIT",
          message: "Rate limit exceeded",
        };
      } else if (status === 500 || status === 503) {
        return {
          code: "SERVER_ERROR",
          message: "Gemini server error",
        };
      }

      return {
        code: "LLM_ERROR",
        message: message,
      };
    } else if (error.code === "ECONNABORTED") {
      return {
        code: "TIMEOUT",
        message: "Request timeout",
      };
    } else if (error.code === "ENOTFOUND") {
      return {
        code: "NETWORK_ERROR",
        message: "Network connection failed",
      };
    }

    return {
      code: "UNKNOWN_ERROR",
      message: error.message || "Unknown error occurred",
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.generateWithRetry({
        prompt: 'Say "OK" if you can read this.',
        maxTokens: 10,
      });
      return true;
    } catch {
      return false;
    }
  }
}

export default new LLMClient();
