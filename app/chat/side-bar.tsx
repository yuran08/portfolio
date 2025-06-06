import { getConversationList } from "./action";
import { DeleteConversationButton } from "./delete-conversation-button";
import { NavigationButton } from "./navigation-button";
import dayjs from "dayjs";
// 时间分组类型
type TimeGroup = {
  title: string;
  conversations: Array<{
    id: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
};

// 获取时间组标题
const getTimeGroupTitle = (date: Date): string => {
  const now = dayjs();
  const targetDate = dayjs(date);
  const diffDays = now.diff(targetDate, "day");

  if (diffDays === 0) {
    return "今天";
  } else if (diffDays <= 7) {
    return "七天内";
  } else if (diffDays <= 30) {
    return "三十天内";
  } else {
    // 返回年月格式，如 "2025-03"
    return targetDate.format("YYYY-MM");
  }
};

// 根据时间分组对话
const groupConversationsByTime = (
  conversations: Array<{
    id: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
  }>
): TimeGroup[] => {
  const groups = new Map<string, TimeGroup>();

  conversations.forEach((conversation) => {
    const groupTitle = getTimeGroupTitle(conversation.updatedAt);

    if (!groups.has(groupTitle)) {
      groups.set(groupTitle, {
        title: groupTitle,
        conversations: [],
      });
    }

    groups.get(groupTitle)!.conversations.push(conversation);
  });

  // 按时间顺序排序分组
  const sortedGroups = Array.from(groups.values()).sort((a, b) => {
    const order = ["今天", "七天内", "三十天内"];
    const aIndex = order.indexOf(a.title);
    const bIndex = order.indexOf(b.title);

    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    } else if (aIndex !== -1) {
      return -1;
    } else if (bIndex !== -1) {
      return 1;
    } else {
      // 都是月份格式，按时间倒序
      return b.title.localeCompare(a.title);
    }
  });

  return sortedGroups;
};

export default async function ServerSideBar({
  currentConversationId,
}: {
  currentConversationId?: string;
}) {
  const conversations = await getConversationList();
  const groupedConversations = groupConversationsByTime(conversations);

  return (
    <aside className="flex w-72 flex-col space-y-4 border-r border-gray-200 bg-white p-4 dark:border-slate-700/50 dark:bg-slate-900/95">
      <NavigationButton
        className="flex w-full cursor-pointer items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-left font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
      >
        <span>&#x270E;</span>
        <span>开启新对话</span>
      </NavigationButton>

      <div className="flex-1 overflow-y-auto">
        {groupedConversations.map((group, groupIndex) => (
          <div key={group.title} className={groupIndex > 0 ? "mt-6" : ""}>
            {/* 时间组标题 */}
            <div className="mb-2 px-2 text-xs font-medium text-gray-500 dark:text-slate-400">
              {group.title}
            </div>

            {/* 该组的对话列表 */}
            <div className="space-y-1">
              {group.conversations.map((conversation) => (
                <div key={conversation.id} className="group relative">
                  <NavigationButton
                    conversationId={conversation.id}
                    className={`flex h-12 w-full cursor-pointer items-center rounded px-3 py-2 text-left text-sm text-gray-900 transition-all duration-300 hover:bg-gray-200 dark:text-slate-200 dark:hover:bg-slate-800/70 ${conversation.id === currentConversationId
                      ? "bg-gray-200 dark:bg-slate-800/90"
                      : ""
                      }`}
                  >
                    <span className="truncate">{conversation.title}</span>
                  </NavigationButton>

                  <DeleteConversationButton conversationId={conversation.id} />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* 当没有对话时的提示 */}
        {groupedConversations.length === 0 && (
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-gray-500 dark:text-slate-400">
              暂无对话记录
            </p>
          </div>
        )}
      </div>
    </aside>
  );
}
