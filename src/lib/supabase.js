import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = "https://szptdgmdktxowgokpeye.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6cHRkZ21ka3R4b3dnb2twZXllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4MDUwNjAsImV4cCI6MjEwNDM4MTA2MH0.tSbLM2tCgWxfpnNRMg0qCVgQm63psYlD3_cbLW6qKyo";

export const MUX_ENV_KEY = "kk0c2blkv34tchrb68f41uar5";
export const MUX_SERVICE_URL = "https://szptdgmdktxowgokpeye.supabase.co/functions/v1/mux-service";
export const PAYPAL_HOSTED_BUTTON_ID = "BK7PTKT23ZQFW";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
