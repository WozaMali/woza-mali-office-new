
export function useBackgroundRefresh(key: string | undefined | null, callback?: () => Promise<void>) {
  return { forceRefresh: async () => {}, isRefreshing: false };
}
