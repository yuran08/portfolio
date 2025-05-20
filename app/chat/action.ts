"use server";

export const addMessage = async (formData: FormData) => {
  console.log(formData.get("message"));
};

export const startConversation = async (formData: FormData) => {
  const message = (formData.get("message") as string).trim();
  if (!message) {
    return;
  }
  console.log(message);
};
