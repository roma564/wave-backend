export interface User {
  id: number;
  name: string;
  lastname: string;
  email: string;
  password?: string | null;
  avatar?: string | null;
}