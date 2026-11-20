export interface ShareSnapshot {
  shareId: string;
  tab: string;
  title: string;
  data: Record<string, unknown>;
  createdAt: string;
  expiresAt: string;
}

export interface ShareResponse {
  shareId: string;
  shareUrl: string;
}
