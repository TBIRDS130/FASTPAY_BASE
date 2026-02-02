import { useState, useCallback } from 'react'
import { get, set, ref } from 'firebase/database'
import { database } from '@/lib/firebase'
import { getDeviceListPath } from '@/lib/firebase-helpers'
import { getSession } from '@/lib/auth'
import { useToast } from '@/lib/use-toast'

export interface UseDeviceAddReturn {
  isAdding: boolean
  addDevice: (deviceCode: string) => Promise<boolean>
}

/**
 * Custom hook for adding devices by code
 * Handles device code validation and adding to user's device list
 */
export function useDeviceAdd(): UseDeviceAddReturn {
  const { toast } = useToast()
  const [isAdding, setIsAdding] = useState(false)

  const addDevice = useCallback(
    async (deviceCode: string): Promise<boolean> => {
      if (!deviceCode.trim()) {
        toast({
          title: 'Error',
          description: 'Please enter a device code',
          variant: 'destructive',
        })
        return false
      }

      const session = getSession()
      if (!session?.email) {
        toast({
          title: 'Error',
          description: 'Session not found. Please log in again.',
          variant: 'destructive',
        })
        return false
      }

      setIsAdding(true)
      try {
        // Check if device code exists in fastpay/device-list/{CODE}
        const deviceListRef = getDeviceListPath(deviceCode.trim())
        const deviceListSnapshot = await get(deviceListRef)

        if (!deviceListSnapshot.exists()) {
          toast({
            title: 'Device not found',
            description: `Device code "${deviceCode.trim()}" does not exist in device-list`,
            variant: 'destructive',
          })
          setIsAdding(false)
          return false
        }

        const deviceListData = deviceListSnapshot.val()
        const deviceId = deviceListData?.deviceId

        if (!deviceId) {
          toast({
            title: 'Error',
            description: 'Device code exists but no deviceId found',
            variant: 'destructive',
          })
          setIsAdding(false)
          return false
        }

        // Add device to current logged-in user's device list
        const emailPath = session.email.replace(/\./g, "'dot'")
        const userDevicePath = `users/${emailPath}/device/${deviceId}`
        const userDeviceRef = ref(database, userDevicePath)

        // Check if device already exists in user's device list
        const userDeviceSnapshot = await get(userDeviceRef)

        if (userDeviceSnapshot.exists()) {
          toast({
            title: 'Device already added',
            description: 'This device is already in your device list',
            variant: 'default',
          })
          setIsAdding(false)
          return false
        }

        // Add device ID to current logged-in user's device list
        await set(userDeviceRef, true)

        toast({
          title: 'Device added',
          description: `Device "${deviceId}" has been added to your device list`,
          variant: 'default',
        })

        return true
      } catch (error) {
        console.error('Error adding device:', error)
        toast({
          title: 'Error',
          description: 'Failed to add device. Please try again.',
          variant: 'destructive',
        })
        return false
      } finally {
        setIsAdding(false)
      }
    },
    [toast]
  )

  return { isAdding, addDevice }
}
