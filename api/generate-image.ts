import type { VercelRequest, VercelResponse } from '@vercel/node';

const GLM_API_KEY = process.env.GLM_API_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = req.method;

  try {
    if (method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

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
    console.log('Image generation response:', data);
    
    if (data.data && data.data.length > 0) {
      return res.status(200).json({ 
        imageUrl: data.data[0].url,
        revisedPrompt: data.data[0].revised_prompt
      });
    } else {
      return res.status(500).json({ error: data.error?.message || "Image generation failed" });
    }

  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
