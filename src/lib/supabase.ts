import { Database } from "../../types/database.types";
import { createClient } from "@supabase/supabase-js";

const url: string = process.env.SUPABASE_URL as string;
const anon_key: string = process.env.SUPABASE_ANON_KEY as string;
export const supabase = createClient<Database>(url, anon_key);
