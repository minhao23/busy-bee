import supabase from "./utils/supabase";
import WebApp from "@twa-dev/sdk";
import { v5 as uuidv5 } from "uuid";

const initializeTelegramUser = async () => {
  try {
    let telegramId: number | null = null;
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
      const tgUser = WebApp.initDataUnsafe.user;
      if (!tgUser) throw new Error("Telegram authentication required");

      telegramId = tgUser.id;
      username = tgUser.username || `user_${tgUser.id.toString().slice(0, 8)}`;
      userId = uuidv5(
        tgUser.id.toString(),
        "00000000-0000-0000-0000-000000000000"
      );
      console.log("Telegram user ID:", telegramId);
      console.log("Telegram username:", username);
      console.log("Generated user ID:", userId);
      console.log("this is in auth");

      const email = `${userId}@telegram.com`;
      const password = userId;

      // Try sign-up first
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            telegram_id: telegramId,
          },
        },
      });

      if (signUpError) {
        // If already signed up, try sign-in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        console.log("signing in with password");
        if (signInError) throw signInError;
      }

      // Confirm session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("Telegram user auth session missing");
      else {
        const { access_token, refresh_token } = session;

        sessionStorage.setItem("sb-access-token", access_token);
        sessionStorage.setItem("sb-refresh-token", refresh_token);
      }

      const {
        data: { user },
      } = await supabase.auth.getUser(); // returns a supabase User
      if (!user) throw new Error("Telegram user missing from session");

      userId = user.id;
      console.log("Telegram user initialized:", user);
      console.log("session:", session);
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
        username: username || "no name found",
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
