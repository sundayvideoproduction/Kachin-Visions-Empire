import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://apmhwagvmjajitsagruk.supabase.co';
const supabaseAnonKey = 'sb_publishable_OSovGbln41HG96yLOuxwAA_fIKU73gQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});