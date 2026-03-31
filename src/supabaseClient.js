import { createClient } from '@supabase/supabase-js';

// These are your unique "Keys to the Kingdom" 
const supabaseUrl = 'https://pirqtmtzearmugvzhmgl.supabase.co';
const supabaseKey = 'sb_publishable_Wn9i-ouR1VUqbaUrLzzNSw_913vjWVL';

export const supabase = createClient(supabaseUrl, supabaseKey);