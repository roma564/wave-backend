import { MessageType } from "./MessageType";

export type Message = {
  id: number;
  type: MessageType; // ← нове поле
  content: string | null;
  fileUrl: string | null;
  fileName: string | null;
  savedFileName: string | null;
  fileSize: number | null;
  mimeType: string | null;
  chatId: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
};
