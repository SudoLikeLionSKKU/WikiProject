import { Database } from "../../types/database.types";
import { createClient } from "@supabase/supabase-js";

const url: string = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const anon_key: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
export const supabase = createClient<Database>(url, anon_key);
