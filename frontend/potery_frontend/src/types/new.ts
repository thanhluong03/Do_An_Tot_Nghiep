export interface New {
    id: string;
    title: string;
    content: string;
    published_at: number;
    is_published?: number;
    user: {
      id: string;
      name: string;
      logo?: string;
    };
    createdAt: Date;
    updatedAt: Date;
  }