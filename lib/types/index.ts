export interface Chat extends Record<string, string | Date> {
  id: string;
  // title: string;
  createdAt: Date;
  // userId: string
  // path: string;
  // messages: ExtendedCoreMessage[] // Note: Changed from AIMessage to ExtendedCoreMessage
  // sharePath?: string
}
