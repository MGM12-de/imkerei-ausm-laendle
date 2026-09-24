import type { SupabaseClient } from '@supabase/supabase-js'

/** Supabase-Client ohne generierte DB-Typen (Typen liegen in ~/types/models.ts) */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useDb = () => useSupabaseClient() as unknown as SupabaseClient<any, 'public', any>
