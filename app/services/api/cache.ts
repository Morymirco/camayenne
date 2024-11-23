const CACHE_DURATION = 1000 * 60 * 5 // 5 minutes

export async function fetchWithCache(key: string, fetcher: () => Promise<any>) {
  const cached = localStorage.getItem(key)
  
  if (cached) {
    const { data, timestamp } = JSON.parse(cached)
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data
    }
  }

  const data = await fetcher()
  localStorage.setItem(key, JSON.stringify({
    data,
    timestamp: Date.now()
  }))
  
  return data
} 