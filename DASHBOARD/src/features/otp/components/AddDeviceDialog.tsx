import { useState } from 'react'
import { Key, Loader } from 'lucide-react'
import { Button } from '@/component/ui/button'
import { Input } from '@/component/ui/input'
import { Label } from '@/component/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/component/ui/dialog'
import type { UseDeviceAddReturn } from '@/hooks/otp'

interface AddDeviceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deviceAdd: UseDeviceAddReturn
}

/**
 * AddDeviceDialog - Dialog for adding devices by code
 */
export function AddDeviceDialog({ open, onOpenChange, deviceAdd }: AddDeviceDialogProps) {
  const [otpCode, setOtpCode] = useState(() => {
    const saved = localStorage.getItem('otpCode')
    return saved || ''
  })

  const handleAddDevice = async () => {
    const success = await deviceAdd.addDevice(otpCode)
    if (success) {
      setOtpCode('')
      localStorage.removeItem('otpCode')
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Device Code
          </DialogTitle>
          <DialogDescription>Enter device code to add to your device list</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="otpCode">Device Code</Label>
            <Input
              id="otpCode"
              type="text"
              placeholder="Enter device code"
              value={otpCode}
              onChange={e => {
                setOtpCode(e.target.value)
                localStorage.setItem('otpCode', e.target.value)
              }}
              className="w-full"
              disabled={deviceAdd.isAdding}
              onKeyDown={e => {
                if (e.key === 'Enter' && !deviceAdd.isAdding && otpCode.trim()) {
                  handleAddDevice()
                }
              }}
            />
            <p className="text-sm text-muted-foreground">
              Enter the device code to add it to your device list
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deviceAdd.isAdding}
          >
            Close
          </Button>
          <Button onClick={handleAddDevice} disabled={deviceAdd.isAdding || !otpCode.trim()}>
            {deviceAdd.isAdding ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Device'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
