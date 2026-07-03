import axios from 'axios';
import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';

export const callOpenRouter = async (messages, options = {}) => {
  if (!env.OPENROUTER_API_KEY) {
    throw new Error('OPENROUTER_API_KEY is missing in environment variables');
  }

  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: env.OPENROUTER_MODEL,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 500
      },
      {
        headers: {
          'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': env.CLIENT_URL,
          'X-Title': 'ProjectHub AI'
        },
        timeout: 15000 // 15 seconds
      }
    );

    if (
      !response.data ||
      !response.data.choices ||
      !response.data.choices[0] ||
      !response.data.choices[0].message
    ) {
      throw new Error('Malformed response from OpenRouter');
    }

    return response.data.choices[0].message.content;
  } catch (error) {
    // Avoid leaking raw axios error objects or external service details to the client
    console.error('OpenRouter Service Error:', error.message);
    throw new ApiError(502, 'AI service unavailable, please try again');
  }
};
