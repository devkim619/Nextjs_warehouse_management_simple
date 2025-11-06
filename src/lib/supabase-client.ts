import { createClient } from '@supabase/supabase-js'

// Client-side Supabase client for browser usage
// Uses NEXT_PUBLIC_ prefix for environment variables to expose them to the browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
	throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
}

if (!supabaseAnonKey) {
	throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not set')
}

// Create client with realtime enabled
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
	realtime: {
		params: {
			eventsPerSecond: 10,
		},
	},
})
