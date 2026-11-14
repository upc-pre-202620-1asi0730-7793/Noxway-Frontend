export interface CommunityPostResource {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  title: string;
  content: string;
  district: string;
  category?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: string;
}

export interface CreateCommunityPostPayload {
  title: string;
  content: string;
  district: string;
  category?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface CommunityReportResource {
  id: string;
  reportedBy: string;
  reporterName: string;
  targetType: 'SERVICE' | 'RISK' | string;
  targetId: string;
  targetTitle: string;
  targetStatus: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | string;
  createdAt: string;
}

export interface ModerationActionResource {
  id: string;
  reportId: string;
  moderatorId: string;
  moderatorName: string;
  decision: 'APPROVE' | 'REJECT' | string;
  notes: string;
  createdAt: string;
}

export type CommunityPost = CommunityPostResource;
