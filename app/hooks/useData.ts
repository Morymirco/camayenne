import useSWR from 'swr'
import { getLocations } from '@/app/services/firebase/locations'
import type { Location } from '@/app/types/location'

// Définition du fetcher qui utilise notre fonction getLocations
const fetcher = async (): Promise<Location[]> => {
  return await getLocations()
}

export function useLocations() {
  const { data, error } = useSWR<Location[]>('locations', fetcher, {
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