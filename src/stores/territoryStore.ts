import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { City } from '../types/territory'
import { WORLD_CITIES, EMPIRES_TOP3 } from '../types/territory'
import { addGrowthPoints } from '../db/database'

// Growth points for territory actions
const TERRITORY_GROWTH_POINTS = {
  city_added: 15,
  city_removed: -5,
}

interface TerritoryState {
  cities: City[]
  deleteMode: boolean
  nextId: number

  // Actions
  addCity: (city: Omit<City, 'id'>) => Promise<boolean>
  removeCity: (id: number) => void
  toggleDeleteMode: () => void
  resetAll: () => void
  getTotalArea: () => number
  getTotalPopulation: () => number
  getPercentageOfEmpire: (empireKey: string) => number
  searchCities: (query: string) => Omit<City, 'id'>[]
  findNearestCity: (lat: number, lng: number) => Omit<City, 'id'> | null
}

export const useTerritoryStore = create<TerritoryState>()(
  persist(
    (set, get) => ({
      cities: [],
      deleteMode: false,
      nextId: 1,

      addCity: async (cityData) => {
        const { cities, nextId } = get()

        // Check for duplicates
        const isDuplicate = cities.some(
          c => c.nameEn === cityData.nameEn ||
          (Math.abs(c.lat - cityData.lat) < 0.1 && Math.abs(c.lng - cityData.lng) < 0.1)
        )

        if (isDuplicate) {
          return false
        }

        const newCity: City = {
          ...cityData,
          id: nextId,
        }

        set({
          cities: [...cities, newCity],
          nextId: nextId + 1,
        })

        // Add growth points for baobab
        try {
          await addGrowthPoints(TERRITORY_GROWTH_POINTS.city_added)
        } catch (e) {
          console.error('Failed to add growth points:', e)
        }

        return true
      },

      removeCity: (id) => {
        set(state => ({
          cities: state.cities.filter(c => c.id !== id),
        }))
      },

      toggleDeleteMode: () => {
        set(state => ({ deleteMode: !state.deleteMode }))
      },

      resetAll: () => {
        set({ cities: [], nextId: 1 })
      },

      getTotalArea: () => {
        const { cities } = get()
        return cities.reduce((sum, city) => sum + city.metroArea, 0)
      },

      getTotalPopulation: () => {
        const { cities } = get()
        return cities.reduce((sum, city) => sum + (city.population || 0), 0)
      },

      getPercentageOfEmpire: (empireKey) => {
        const empire = EMPIRES_TOP3[empireKey]
        if (!empire) return 0
        const totalArea = get().getTotalArea()
        return (totalArea / empire.area) * 100
      },

      searchCities: (query) => {
        if (!query || query.length < 1) return []
        const lowerQuery = query.toLowerCase()
        return WORLD_CITIES.filter(
          city =>
            city.nameEn.toLowerCase().includes(lowerQuery) ||
            city.nameJa.includes(query) ||
            city.countryEn.toLowerCase().includes(lowerQuery) ||
            city.countryJa.includes(query)
        ).slice(0, 5)
      },

      findNearestCity: (lat, lng) => {
        let nearest: Omit<City, 'id'> | null = null
        let minDistance = Infinity

        WORLD_CITIES.forEach(city => {
          const distance = Math.sqrt(
            Math.pow(city.lat - lat, 2) + Math.pow(city.lng - lng, 2)
          )
          if (distance < minDistance) {
            minDistance = distance
            nearest = city
          }
        })

        // Only return if within ~1000km (~9 degrees)
        return minDistance < 9 ? nearest : null
      },
    }),
    {
      name: 'territory-storage',
    }
  )
)

// Geocoding utilities
export async function reverseGeocode(lat: number, lng: number): Promise<Omit<City, 'id'> | null> {
  try {
    // Fetch both Japanese and English names
    const [jaResponse, enResponse] = await Promise.all([
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'ja',
            'User-Agent': 'AdamaWorldTerritoryVision/1.0',
          },
        }
      ),
      fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
            'User-Agent': 'AdamaWorldTerritoryVision/1.0',
          },
        }
      ),
    ])

    if (!jaResponse.ok || !enResponse.ok) throw new Error('Geocoding API error')

    const jaData = await jaResponse.json()
    const enData = await enResponse.json()

    if (jaData?.address && enData?.address) {
      const jaAddress = jaData.address
      const enAddress = enData.address

      const nameJa =
        jaAddress.city || jaAddress.town || jaAddress.village ||
        jaAddress.municipality || jaAddress.county || jaAddress.state ||
        jaAddress.region || jaData.name || '不明な場所'

      const nameEn =
        enAddress.city || enAddress.town || enAddress.village ||
        enAddress.municipality || enAddress.county || enAddress.state ||
        enAddress.region || enData.name || 'Unknown'

      const countryJa = jaAddress.country || ''
      const countryEn = enAddress.country || ''

      let estimatedArea = 500
      if (jaData.type === 'city') estimatedArea = 2000
      else if (jaData.type === 'town') estimatedArea = 500
      else if (jaData.type === 'village') estimatedArea = 100

      return {
        nameEn,
        nameJa,
        countryEn,
        countryJa,
        lat: parseFloat(String(lat)),
        lng: parseFloat(String(lng)),
        metroArea: estimatedArea,
        isFromApi: true,
      }
    }

    return null
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return null
  }
}

export async function forwardGeocode(query: string): Promise<Omit<City, 'id'>[]> {
  try {
    // Fetch results in Japanese
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'ja,en',
          'User-Agent': 'AdamaWorldTerritoryVision/1.0',
        },
      }
    )

    if (!response.ok) throw new Error('Geocoding API error')

    const data = await response.json()

    return data.map((item: { name?: string; address?: Record<string, string>; type?: string; lat: string; lon: string; display_name?: string }) => {
      const address = item.address || {}
      const nameJa = item.name || address.city || address.town || address.village || query
      // Use display_name parts or fallback
      const nameEn = item.name || query
      const countryJa = address.country || ''
      const countryEn = address.country || ''

      let estimatedArea = 500
      if (item.type === 'city' || item.type === 'administrative') estimatedArea = 2000
      else if (item.type === 'town') estimatedArea = 500
      else if (item.type === 'village') estimatedArea = 100

      return {
        nameEn,
        nameJa,
        countryEn,
        countryJa,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        metroArea: estimatedArea,
        isFromApi: true,
      }
    })
  } catch (error) {
    console.error('Forward geocoding error:', error)
    return []
  }
}

export function formatArea(area: number): string {
  return Math.round(area).toLocaleString()
}
