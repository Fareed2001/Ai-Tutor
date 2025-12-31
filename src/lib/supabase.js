import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ixphkrsxltrcdotviftp.supabase.co'
const supabaseAnonKey = 'sb_publishable_MBKzbx-k-oXO0z1zGyl6lQ_Akbp8D1K'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)



