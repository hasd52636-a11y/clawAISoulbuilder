import type { VercelRequest, VercelResponse } from '@vercel/node';

const GLM_API_KEY = process.env.GLM_API_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method;

  try {
    // Chat endpoint
    if (method === 'POST' && (req.url?.includes('/api/chat') || req.url?.includes('/api/v1/compile'))) {
      const { messages, temperature } = req.body;

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
        })
      });

      const data = await response.json();
      
      if (data.choices && data.choices.length > 0) {
        return res.status(200).json({ text: data.choices[0].message.content });
      } else {
        throw new Error(data.error?.message || "GLM API error");
      }
    }

    // Image generation endpoint
    if (method === 'POST' && req.url?.includes('/api/generate-image')) {
      const { prompt, size } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: 'prompt is required' });
      }

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
        return res.status(500).json({ error: data.error?.message || "Image generation failed" });
      }
    }

    // Health check
    if (method === 'GET' && req.url?.includes('/api/health')) {
      return res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
    }

    return res.status(404).json({ error: 'Not found' });

  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
