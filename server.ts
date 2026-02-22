import express from 'express';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json());

  // API Routes
  app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    // Checksum placeholder
    res.json({ 
      filename: req.file.originalname, 
      size: req.file.size, 
      status: 'uploaded', 
      checksum_valid: true 
    });
  });

  app.post('/api/extract', upload.single('file'), (req, res) => {
    // Mock extraction for Node.js environment
    // In a real scenario, this would call the Python backend or implement BinaryECUParser in TS
    res.json({
      map_data: [
        [10, 20, 30, 40, 50],
        [15, 25, 35, 45, 55],
        [20, 30, 40, 50, 60],
        [25, 35, 45, 55, 65]
      ]
    });
  });

  app.get('/api/safe-limit', (req, res) => {
    const currentValue = parseFloat(req.query.current_value as string) || 0;
    const strategy = (req.query.strategy as string) || 'Manual';
    
    const strategyMultipliers: Record<string, number> = {
      "Heavy Duty": 0.8,
      "Gasoline": 1.2,
      "Diesel": 1.0,
      "Eco": 0.5,
      "Manual": 1.5
    };
    
    const multiplier = strategyMultipliers[strategy] || 1.0;
    
    const riskScore = Math.min(100, Math.max(0, (currentValue / 100) * 50 * multiplier));
    const hardLimit = 150.0 * (1 / multiplier);
    
    res.json({ 
      risk_score: riskScore, 
      hard_limit: hardLimit, 
      strategy,
      is_safe: currentValue <= hardLimit
    });
  });
  
  app.post('/api/ai/identify-maps', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: 'GEMINI_API_KEY is not set' });
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are an expert Automotive Software Engineer specializing in ECU tuning.
        Analyze the following ECU metadata and identify potential map addresses for Fuel, Boost, and Ignition.
        
        Metadata:
        ${JSON.stringify(req.body, null, 2)}
        
        Provide a detailed analysis of where these maps might be located based on standard ECU architectures.`,
      });
      res.json({ analysis: response.text });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'AI Analysis failed' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
