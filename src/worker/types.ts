export interface Bindings {
  DB: D1Database;
  OPENAI_API_KEY?: string;
  JWT_SECRET?: string;
}

export interface SessionUser {
  id: number;
  email: string;
  role: string;
  first_name: string;
  last_name: string;
  school_id?: number;
}
