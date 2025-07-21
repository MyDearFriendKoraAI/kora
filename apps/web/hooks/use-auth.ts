// Mock hook per autenticazione - da sostituire con implementazione Supabase
export function useAuth() {
  return {
    user: {
      id: 'current-user-id',
      email: 'user@example.com',
      subscriptionTier: 'LEVEL1' as const
    },
    loading: false,
    signOut: () => {},
  }
}