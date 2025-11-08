import { GoogleGenAI, Modality } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";

const API_RETRY_LIMIT = 3;

export async function generateImage(base64Data: string, promptText: string, signal: AbortSignal): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

  const textPart = { text: promptText };
  const imagePart = {
    inlineData: {
      mimeType: "image/png",
      data: base64Data
    }
  };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseModalities: [Modality.IMAGE],
      },
      // The AbortSignal is not directly supported in the SDK config,
      // but the surrounding fetch call will be aborted.
    });

    const candidate = response.candidates?.[0];

    if (!candidate) {
      throw new Error('API returned no candidates.');
    }

    if (candidate.finishReason && candidate.finishReason !== 'STOP') {
      throw new Error(`Generation failed: ${candidate.finishReason}`);
    }

    const imageData = candidate?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;

    if (!imageData) {
      throw new Error('No image data in API response.');
    }

    return `data:image/png;base64,${imageData}`;

  } catch (error) {
    if (error instanceof Error) {
        if (error.name === 'AbortError') {
            console.log('API call aborted by user.');
        }
        throw error;
    }
    throw new Error('An unknown error occurred during image generation.');
  }
}

export async function generateImageWithRetry(base64Data: string, promptText: string, signal: AbortSignal, retryCount = 0): Promise<string> {
    try {
        if (signal.aborted) {
            throw new Error('AbortError');
        }
        return await generateImage(base64Data, promptText, signal);
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
            throw error; // Don't retry if aborted by user
        }
        
        console.error(`Attempt ${retryCount + 1} failed:`, error);
        if (retryCount < API_RETRY_LIMIT - 1) {
            const delay = Math.pow(2, retryCount) * 1000;
            await new Promise(res => setTimeout(res, delay));
            return generateImageWithRetry(base64Data, promptText, signal, retryCount + 1);
        } else {
            throw error;
        }
    }
}
