import { CoreMessage } from "ai";

export interface Message extends Omit<CoreMessage, "id"> {
  id: string;
  conversationId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type Conversation = {
  id: string;
  createAt: Date;
  updateAt: Date;
};
