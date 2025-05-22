export type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
  createAt: Date;
  updateAt: Date;
};

export type Conversation = {
  id: string;
  createAt: Date;
  updateAt: Date;
};
