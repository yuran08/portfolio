"use client";

import ChatInput from './chat-input'; // Import the new component

export default function Chat() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-6">
      {/* Any other page content can go here */}
      <ChatInput /> {/* Use the new ChatInput component */}
      {/* Any other page content can go here */}
    </div>
  );
}
