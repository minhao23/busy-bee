// src/services/telegramAuth.ts
// Update the import path if the file is located elsewhere, for example:
import supabase from "./utils/supabase";
import window from "@twa-dev/sdk";

export async function initializeTelegramUser() {
  // 1. Get Telegram user data

  const tgUser = window.Telegram.WebApp.initDataUnsafe.user;

  // 2. Check if user exists in your database
  const { data: existingUser } = await supabase
    .from("User")
    .select("id")
    .eq("username", tgUser.username)
    .single();

  // 3. Create new user if doesn't exist
  if (!existingUser) {
    const { data: newUser } = await supabase
      .from("User")
      .insert([
        {
          id: tgUser.id,
          username: tgUser.username,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    return newUser;
  }

  return existingUser;
}
