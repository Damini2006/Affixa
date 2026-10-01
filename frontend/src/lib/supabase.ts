import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Recovery links (`?code=` PKCE or `#…&type=recovery`) must be detected
    // on whatever route Supabase falls back to (often `/` when
    // Redirect URLs are incomplete), so the global catcher in App.tsx
    // can forward them to `/reset-password`.
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
    flowType: 'pkce',
  },
});
