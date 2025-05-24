import { ReactNode } from "react";
import { useFormStatus } from "react-dom";

/**
 * 渲染表单提交状态
 * @param pendingNode 提交中节点
 * @param notPendingNode 未提交节点
 * @returns 
 */
export default function RenderFormPending({
  pendingNode,
  notPendingNode,
}: {
  pendingNode: ReactNode;
  notPendingNode: ReactNode;
}) {
  const { pending } = useFormStatus();

  return pending ? pendingNode : notPendingNode;
}
