import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generateShareId, createShare, getShare, cleanupExpiredShares } from '../../src/services/shareService.js';
import fs from 'fs/promises';
import path from 'path';

const SHARES_DIR = path.resolve(__dirname, '../../data/shares');

beforeEach(async () => {
  await fs.mkdir(SHARES_DIR, { recursive: true });
  const files = await fs.readdir(SHARES_DIR).catch(() => []);
  for (const file of files) {
    if (file.endsWith('.json')) {
      await fs.unlink(path.join(SHARES_DIR, file));
    }
  }
});

afterEach(async () => {
  const files = await fs.readdir(SHARES_DIR).catch(() => []);
  for (const file of files) {
    if (file.endsWith('.json')) {
      await fs.unlink(path.join(SHARES_DIR, file));
    }
  }
});

describe('shareService', () => {
  describe('generateShareId', () => {
    it('returns a UUID string', () => {
      const id = generateShareId();
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });

    it('returns unique IDs on each call', () => {
      const id1 = generateShareId();
      const id2 = generateShareId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('createShare', () => {
    it('creates a share snapshot and returns shareId and shareUrl', async () => {
      const result = await createShare({
        tab: 'bugs',
        data: { bugs: [] },
        title: 'Bug Report',
      });

      expect(result).toHaveProperty('shareId');
      expect(result.shareId).toMatch(/^[0-9a-f-]{36}$/);
      expect(result.shareUrl).toBe('http://localhost:5173/shared/' + result.shareId);

      // Verify file was written
      const filePath = path.join(SHARES_DIR, `${result.shareId}.json`);
      const content = await fs.readFile(filePath, 'utf-8');
      const snapshot = JSON.parse(content);
      expect(snapshot.tab).toBe('bugs');
      expect(snapshot.title).toBe('Bug Report');
      expect(snapshot.data).toEqual({ bugs: [] });
      expect(snapshot.createdAt).toBeDefined();
      expect(snapshot.expiresAt).toBeDefined();
    });

    it('uses tab as title when no title provided', async () => {
      const result = await createShare({
        tab: 'features',
        data: { features: [] },
      });

      const filePath = path.join(SHARES_DIR, `${result.shareId}.json`);
      const content = await fs.readFile(filePath, 'utf-8');
      const snapshot = JSON.parse(content);
      expect(snapshot.title).toBe('features');
    });
  });

  describe('getShare', () => {
    it('returns a snapshot when found', async () => {
      const { shareId } = await createShare({
        tab: 'bugs',
        data: { bugs: [] },
        title: 'Bug Report',
      });

      const result = await getShare(shareId);
      expect(result).not.toBeNull();
      expect(result!.shareId).toBe(shareId);
      expect(result!.tab).toBe('bugs');
      expect(result!.title).toBe('Bug Report');
    });

    it('returns null when not found', async () => {
      const result = await getShare('nonexistent-id');
      expect(result).toBeNull();
    });
  });

  describe('cleanupExpiredShares', () => {
    it('removes expired snapshots', async () => {
      // Create an expired snapshot directly
      const expiredId = 'expired-test-id';
      const expiredSnapshot = {
        shareId: expiredId,
        tab: 'bugs',
        title: 'Expired',
        data: {},
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        expiresAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      };
      await fs.writeFile(path.join(SHARES_DIR, `${expiredId}.json`), JSON.stringify(expiredSnapshot));

      // Create a valid snapshot via createShare
      await createShare({
        tab: 'bugs',
        data: { bugs: [] },
        title: 'Valid',
      });

      const removed = await cleanupExpiredShares();
      expect(removed).toBe(1);

      // Expired should be gone
      expect(await getShare(expiredId)).toBeNull();
    });

    it('returns 0 when no expired snapshots', async () => {
      await createShare({
        tab: 'bugs',
        data: { bugs: [] },
        title: 'Valid',
      });

      const removed = await cleanupExpiredShares();
      expect(removed).toBe(0);
    });
  });
});
