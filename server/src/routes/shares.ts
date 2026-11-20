import { Router } from 'express';
import { createShare, getShare } from '../services/shareService.js';
import { z } from 'zod';

const router = Router();

const createShareSchema = z.object({
  body: z.object({
    tab: z.enum(['features', 'bugs', 'testcases', 'qaassignments']),
    data: z.record(z.string(), z.any()),
    title: z.string().optional(),
  }),
});

router.post('/',
  async (_req, res) => {
    const parseResult = createShareSchema.safeParse({ body: _req.body, query: _req.query, params: _req.params });
    if (!parseResult.success) {
      res.status(400).json({ error: 'Validation Error', message: 'Invalid request data', details: parseResult.error.errors });
      return;
    }

    const { tab, data, title } = parseResult.data.body;
    const result = await createShare({ tab, data: data ?? {}, title });
    res.status(201).json(result);
  }
);

router.get('/:shareId',
  async (_req, res) => {
    const { shareId } = _req.params;
    const snapshot = await getShare(shareId);

    if (!snapshot) {
      res.status(404).json({ error: 'Not Found', message: 'Share not found or has expired' });
      return;
    }

    res.json(snapshot);
  }
);

export default router;
