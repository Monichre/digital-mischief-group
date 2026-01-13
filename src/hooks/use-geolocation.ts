"use client"

import { useCallback, useState } from "react"
import useSWR from "swr"

export interface GeolocationData {
  city: string | null
  region: string | null
  country: string | null
  countryCode: string | null
  latitude: number | null
  longitude: number | null
  timezone: string | null
  updatedAt: string | null
}



const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.error || "Failed to fetch geolocation")
  }
  return res.json()
}

export function useGeolocation() {
  const [isFetching, setIsFetching] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const { data, error, isLoading, mutate } = useSWR<{ geolocation: GeolocationData }>(
    "/api/user/geolocation",
    fetcher
  )

  const updateGeolocation = useCallback(
    async (geoData: Partial<GeolocationData>) => {
      try {
        const res = await fetch("/api/user/geolocation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(geoData),
        })

        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || "Failed to update geolocation")
        }

        await mutate()
        return true
      } catch (err) {
        console.error("[useGeolocation] Update error:", err)
        return false
      }
    },
    [mutate]
  )

  const fetchBrowserGeolocation = useCallback(async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      setFetchError("Geolocation is not supported by your browser")
      return false
    }

    setIsFetching(true)
    setFetchError(null)

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        })
      })

      const { latitude, longitude } = position.coords
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

      // Reverse geocode using free API (BigDataCloud)
      let city: string | undefined
      let region: string | undefined
      let country: string | undefined
      let countryCode: string | undefined

      try {
        const geoRes = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        )
        if (geoRes.ok) {
          const geoData = await geoRes.json()
          city = geoData.city || geoData.locality
          region = geoData.principalSubdivision
          country = geoData.countryName
          countryCode = geoData.countryCode
        }
      } catch (geoErr) {
        console.warn("[useGeolocation] Reverse geocode failed:", geoErr)
        // Continue with just lat/lng if reverse geocode fails
      }

      const success = await updateGeolocation({
        latitude,
        longitude,
        timezone,
        city,
        region,
        country,
        countryCode,
      })

      setIsFetching(false)
      return success
    } catch (err) {
      setIsFetching(false)
      if (err instanceof GeolocationPositionError) {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setFetchError("Location permission denied")
            break
          case err.POSITION_UNAVAILABLE:
            setFetchError("Location unavailable")
            break
          case err.TIMEOUT:
            setFetchError("Location request timed out")
            break
          default:
            setFetchError("Failed to get location")
        }
      } else {
        setFetchError("Failed to get location")
      }
      return false
    }
  }, [updateGeolocation])

  return {
    geolocation: data?.geolocation ?? null,
    isLoading,
    error: error?.message || fetchError,
    isFetching,
    fetchBrowserGeolocation,
    updateGeolocation,
    refresh: mutate,
  }
}

