export type Message = {
  id: string;
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
