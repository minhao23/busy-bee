import supabase from "../../utils/supabase";

const fetchQuote = async () => {
  try {
    const { data, error } = await supabase
      .from("Quotes")
      .select("quote, author")
      .order("created_at", { ascending: false })
      .limit(1);

    return data;
  } catch (error) {
    console.error("Error fetching quotes:", error);
  }
};

export default fetchQuote;
