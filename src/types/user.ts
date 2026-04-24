export interface User {
  id: number;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  created_at?: string;
}
