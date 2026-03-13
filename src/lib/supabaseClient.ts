import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://drhcbzngkppsbleahxkg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyaGNiem5na3Bwc2JsZWFoeGtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNzU4NzEsImV4cCI6MjA4ODk1MTg3MX0.5GDe9gIs51FVmBzB5HtPl70XUqWlnnCmPOkLDNb7hcw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
