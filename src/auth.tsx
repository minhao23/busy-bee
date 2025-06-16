import supabase from "./utils/supabase";
import window from "@twa-dev/sdk";
import { v5 as uuidv5 } from "uuid";

const initializeTelegramUser = async () => {
  // 1. Handle both production and development environments
  let userData: {
    user_uuid: string; // UUID
    username: string;
  };

  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;

  if (import.meta.env.DEV && !tgUser) {
    // Development fallback - create mock user
    userData = {
      user_uuid: uuidv5(
        "DEV_USER_ID", // Fixed seed value
        "00000000-0000-0000-0000-000000000000"
      ),
      username: "dev_user",
    };
    console.log("Using development mock user:", userData);
  } else if (!tgUser) {
    throw new Error("Telegram user data missing in production");
  } else {
    // Production - use real Telegram user
    userData = {
      user_uuid: uuidv5(
        tgUser.id.toString(),
        "00000000-0000-0000-0000-000000000000"
      ),
      username: tgUser.username || `user_${tgUser.id.toString().slice(0, 8)}`,
    };
  }

  // 2. Check if user exists
  const { data: existingUser, error: lookupError } = await supabase
    .from("User")
    .select("user_uuid, username")
    .eq("user_uuid", userData.user_uuid)
    .single();

  if (lookupError && lookupError.code !== "PGRST116") {
    // Ignore "not found" error
    throw lookupError;
  }

  // 3. Create new user if doesn't exist
  if (!existingUser) {
    const { data: newUser, error: createError } = await supabase
      .from("User")
      .insert([
        {
          ...userData,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (createError) throw createError;
    return newUser;
  }

  return existingUser;
};

export { initializeTelegramUser };
