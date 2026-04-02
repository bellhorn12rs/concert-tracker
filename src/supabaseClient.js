import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pirqtmtzearmugvzhmgl.supabase.co';
const supabaseKey = 'sb_publishable_Wn9i-ouR1VUqbaUrLzzNSw_913vjWVL';

// This creates the connection to your database
export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * ADMIN LOGIN HELPER
 * Run this in your browser console to log in so you can save data.
 * Usage: adminLogin('your@email.com', 'yourpassword')
 */
export const adminLogin = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    alert("Login failed: " + error.message);
    console.error(error);
  } else {
    alert("Logged in successfully! You can now save edits.");
    console.log("Session started for:", data.user.email);
    // This reloads the page to ensure the app picks up the new 'logged in' status
    window.location.reload();
  }
};