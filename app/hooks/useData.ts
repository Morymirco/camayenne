import useSWR from 'swr'

export function useLocations() {
  const { data, error } = useSWR('/api/locations', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000
  })

  return {
    locations: data,
    isLoading: !error && !data,
    isError: error
  }
} 