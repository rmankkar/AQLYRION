import { env } from '../config/env.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import type { ShareSnapshot, ShareResponse, CreateShareRequest } from '../types/share.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SHARES_DIR = path.resolve(__dirname, '../../data/shares');

export function generateShareId(): string {
  return crypto.randomUUID();
}

export async function ensureSharesDir(): Promise<void> {
  await fs.mkdir(SHARES_DIR, { recursive: true });
}

export async function createShare(request: CreateShareRequest): Promise<ShareResponse> {
  await ensureSharesDir();

  const shareId = generateShareId();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + env.shareRetentionDays * 24 * 60 * 60 * 1000);

  const snapshot: ShareSnapshot = {
    shareId,
    tab: request.tab,
    title: request.title ?? request.tab,
    data: request.data,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };

  await fs.writeFile(
    path.join(SHARES_DIR, `${shareId}.json`),
    JSON.stringify(snapshot, null, 2)
  );

  const shareUrl = `${env.shareBaseUrl}/shared/${shareId}`;
  return { shareId, shareUrl };
}

export async function getShare(shareId: string): Promise<ShareSnapshot | null> {
  const filePath = path.join(SHARES_DIR, `${shareId}.json`);

  let content: string;
  try {
    content = await fs.readFile(filePath, 'utf-8');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw error;
  }

  const snapshot: ShareSnapshot = JSON.parse(content);

  // TTL enforcement: delete expired snapshots lazily
  if (new Date(snapshot.expiresAt) < new Date()) {
    await fs.unlink(filePath).catch(() => {});
    return null;
  }

  return snapshot;
}

export async function cleanupExpiredShares(): Promise<number> {
  await ensureSharesDir();
  const files = await fs.readdir(SHARES_DIR);
  const now = new Date();
  let removed = 0;

  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const filePath = path.join(SHARES_DIR, file);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const snapshot: ShareSnapshot = JSON.parse(content);
      if (new Date(snapshot.expiresAt) < now) {
        await fs.unlink(filePath);
        removed++;
      }
    } catch {
      // Ignore unreadable/corrupt files
    }
  }

  return removed;
}
