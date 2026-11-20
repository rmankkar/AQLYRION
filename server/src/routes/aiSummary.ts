import { Router } from 'express';
import { generateAISummary } from '../services/aiSummaryService.js';
import { z } from 'zod';

const router = Router();

const aiSummarySchema = z.object({
  body: z.object({
    tab: z.string().min(1),
    data: z.record(z.string(), z.any()).optional(),
    context: z.string().optional(),
  }),
});

router.post('/',
  async (_req, res) => {
    const parseResult = aiSummarySchema.safeParse({ body: _req.body, query: _req.query, params: _req.params });
    if (!parseResult.success) {
      res.status(400).json({ error: 'Validation Error', message: 'Invalid request data', details: parseResult.error.errors });
      return;
    }

    const { tab, data, context } = parseResult.data.body;
    const result = await generateAISummary({ tab, data: data ?? {}, context });
    res.json(result);
  }
);

export default router;
