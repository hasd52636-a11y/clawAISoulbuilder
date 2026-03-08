import type { VercelRequest, VercelResponse } from '@vercel/node';

const GLM_API_KEY = process.env.GLM_API_KEY || '';

interface ApiError {
  code: string;
  message: string;
  details?: any;
}

function createError(code: string, message: string, details?: any): ApiError {
  return { code, message, details };
}

function handleError(res: VercelResponse, error: any): VercelResponse {
  console.error('API Error:', error);
  
  if (error.name === 'AbortError') {
    return res.status(504).json(createError('TIMEOUT', 'Request timeout'));
  }
  
  return res.status(500).json(createError('INTERNAL_ERROR', error.message || 'Internal Server Error'));
}

async function handleHealthCheck(req: VercelRequest, res: VercelResponse): Promise<VercelResponse> {
  return res.status(200).json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    service: "AI Soul Weaver API"
  });
}

async function handleChat(req: VercelRequest, res: VercelResponse): Promise<VercelResponse> {
  const { messages, temperature } = req.body;

  if (!GLM_API_KEY) {
    return res.status(500).json(createError('CONFIG_ERROR', 'GLM_API_KEY not configured'));
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GLM_API_KEY}`
      },
      body: JSON.stringify({
        model: "glm-4",
        messages: messages || [],
        temperature: temperature || 0.7
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      return res.status(200).json({ text: data.choices[0].message.content });
    } else {
      return res.status(500).json(createError('API_ERROR', data.error?.message || "GLM API error"));
    }
  } catch (error: any) {
    clearTimeout(timeoutId);
    return handleError(res, error);
  }
}

async function handleCompile(req: VercelRequest, res: VercelResponse): Promise<VercelResponse> {
  const { messages, temperature } = req.body;

  if (!GLM_API_KEY) {
    return res.status(500).json(createError('CONFIG_ERROR', 'GLM_API_KEY not configured'));
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GLM_API_KEY}`
      },
      body: JSON.stringify({
        model: "glm-4",
        messages: messages || [],
        temperature: temperature || 0.7
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      return res.status(200).json({ text: data.choices[0].message.content });
    } else {
      return res.status(500).json(createError('API_ERROR', data.error?.message || "GLM API error"));
    }
  } catch (error: any) {
    clearTimeout(timeoutId);
    return handleError(res, error);
  }
}

async function handleGenerateImage(req: VercelRequest, res: VercelResponse): Promise<VercelResponse> {
  const { prompt, size } = req.body;

  if (!prompt) {
    return res.status(400).json(createError('VALIDATION_ERROR', 'prompt is required'));
  }

  if (!GLM_API_KEY) {
    return res.status(500).json(createError('CONFIG_ERROR', 'GLM_API_KEY not configured'));
  }

  try {
    const response = await fetch("https://open.bigmodel.cn/api/paas/v4/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GLM_API_KEY}`
      },
      body: JSON.stringify({
        model: "cogview-3-plus",
        prompt: prompt,
        size: size || "1024x1024"
      })
    });

    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      return res.status(200).json({ 
        imageUrl: data.data[0].url,
        revisedPrompt: data.data[0].revised_prompt
      });
    } else {
      return res.status(500).json(createError('API_ERROR', data.error?.message || "Image generation failed"));
    }
  } catch (error: any) {
    return handleError(res, error);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const path = req.query.path as string || '';
  console.log('API called:', path, 'Method:', req.method);

  try {
    if (path === 'health' || path === 'api/health') {
      return handleHealthCheck(req, res);
    }
    
    if (path === 'chat' || path === 'api/chat') {
      if (req.method !== 'POST') {
        return res.status(405).json(createError('METHOD_NOT_ALLOWED', 'Only POST method is allowed'));
      }
      return handleChat(req, res);
    }
    
    if (path === 'v1/compile' || path === 'api/v1/compile') {
      if (req.method !== 'POST') {
        return res.status(405).json(createError('METHOD_NOT_ALLOWED', 'Only POST method is allowed'));
      }
      return handleCompile(req, res);
    }
    
    if (path === 'generate-image' || path === 'api/generate-image') {
      if (req.method !== 'POST') {
        return res.status(405).json(createError('METHOD_NOT_ALLOWED', 'Only POST method is allowed'));
      }
      return handleGenerateImage(req, res);
    }

    return res.status(404).json(createError('NOT_FOUND', 'API endpoint not found', { path }));
  } catch (error: any) {
    return handleError(res, error);
  }
}
