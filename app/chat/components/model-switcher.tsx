export function ModelSwitcher({
  model,
  setModel,
}: {
  model: "deepseek-chat" | "deepseek-reasoner";
  setModel: (model: "deepseek-chat" | "deepseek-reasoner") => void;
}) {
  return (
    <div>
      <select
        value={model}
        onChange={(e) =>
          setModel(e.target.value as "deepseek-chat" | "deepseek-reasoner")
        }
      >
        <option value="deepseek-chat">DeepSeek Chat</option>
        <option value="deepseek-reasoner">DeepSeek Reasoner</option>
      </select>
    </div>
  );
}
