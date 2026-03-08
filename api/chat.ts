import type { VercelRequest, VercelResponse } from '@vercel/node';

const GLM_API_KEY = process.env.GLM_API_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('API called:', req.url, 'GLM_KEY exists:', !!GLM_API_KEY);

  try {
    if (method === 'POST' && req.url?.includes('/api/chat')) {
      const { messages, temperature } = req.body;

      if (!GLM_API_KEY) {
        return res.status(500).json({ error: 'GLM_API_KEY not configured' });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);

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
      console.log('GLM Response:', JSON.stringify(data).substring(0, 200));
      
      if (data.choices && data.choices.length > 0) {
        return res.status(200).json({ text: data.choices[0].message.content });
      } else {
        return res.status(500).json({ error: data.error?.message || "GLM API error" });
      }
    }

    if (method === 'POST' && req.url?.includes('/api/generate-image')) {
      const { prompt } = req.body;

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
          size: "1024x1024"
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

    return res.status(404).json({ error: 'Not found' });

  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
