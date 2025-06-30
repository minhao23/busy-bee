import supabase from "./utils/supabase";
import WebApp from "@twa-dev/sdk";
import { v5 as uuidv5 } from "uuid";

const initializeTelegramUser = async () => {
  try {
    let telegramId: bigint | null = null;
    let username: string;
    let userId: string;

    if (import.meta.env.DEV) {
      console.log("[DEV] Using mock authentication");
      const mockEmail = "dev_user@example.com";
      const password = "dev_passworD123";

      // Attempt sign in
      let { error } = await supabase.auth.signInWithPassword({
        email: mockEmail,
        password,
      });

      // If that fails, try sign up
      if (error) {
        const { error: signupError } = await supabase.auth.signUp({
          email: mockEmail,
          password,
        });
        if (signupError) throw signupError;
      }

      // Ensure session is available
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session)
        throw new Error("No active session after sign-in/signup");

      // Grab authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Failed to fetch authenticated user");
      userId = user.id;
      username = "dev_user";
    } else {
      // Production environment
      const tgUser = WebApp.initDataUnsafe.user;
      if (!tgUser) throw new Error("Telegram authentication required");

      telegramId = BigInt(tgUser.id);
      username = tgUser.username || `user_${tgUser.id.toString().slice(0, 8)}`;
      userId = uuidv5(
        tgUser.id.toString(),
        "00000000-0000-0000-0000-000000000000"
      );

      const email = `${userId}@telegram.com`;
      const password = userId;

      let { error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            telegram_id: 1234567890,
          },
        },
      });
      if (error) {
        const { error: signupError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signupError) throw signupError;

        // After sign-up, manually sign in again
        const retry = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (retry.error) throw retry.error;
      }

      // Confirm session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Telegram user auth session missing");

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Telegram user missing from session");
      userId = user.id; // Use authenticated Supabase ID
    }

    // Check for existing profile
    const { data: existingUser } = await supabase
      .from("User")
      .select()
      .eq("id", userId)
      .single();

    if (existingUser) {
      console.log("Existing profile found:", existingUser);
      return existingUser;
    }

    console.log("Creating new profile...");
    const { data: newUser, error: insertError } = await supabase
      .from("User")
      .insert({
        id: userId,
        username,
        telegram_id: telegramId,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) throw insertError;
    return newUser;
  } catch (error) {
    console.error("Initialization failed:", error);
    throw error;
  }
};

export { initializeTelegramUser };
