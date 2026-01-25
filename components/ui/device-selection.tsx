"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlayButton } from "@/components/ui/play-button";
import { Loader2, Smartphone, Laptop, Speaker, Radio } from "lucide-react";

interface Device {
  id: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number | null;
}

interface DeviceSelectionProps {
  isOpen: boolean;
  onClose: () => void;
  onDeviceSelect: (deviceId: string) => void;
  onPlayWithoutDevice: () => void;
  isLoading?: boolean;
}

const deviceIcons: Record<string, any> = {
  Computer: Laptop,
  Tablet: Laptop,
  Smartphone: Smartphone,
  Speaker: Speaker,
  Audio: Speaker,
  TV: Radio,
  AVR: Radio,
  STB: Radio,
  AudioDongle: Speaker,
  GameConsole: Radio,
  CastVideo: Radio,
  CastAudio: Speaker,
  Automobile: Radio,
  Unknown: Radio,
};

export function DeviceSelection({
  isOpen,
  onClose,
  onDeviceSelect,
  onPlayWithoutDevice,
  isLoading = false,
}: DeviceSelectionProps) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isFetchingDevices, setIsFetchingDevices] = useState(false);

  const fetchDevices = async () => {
    setIsFetchingDevices(true);
    try {
      const response = await fetch("/api/player/devices");
      if (response.ok) {
        const data = await response.json();
        setDevices(data.devices || []);
      }
    } catch (error) {
      console.error("Failed to fetch devices:", error);
    } finally {
      setIsFetchingDevices(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDevices();
    }
  }, [isOpen]);

  const handleDeviceSelect = (deviceId: string) => {
    onDeviceSelect(deviceId);
    onClose();
  };

  const getDeviceIcon = (type: string) => {
    const IconComponent = deviceIcons[type] || deviceIcons.Unknown;
    return IconComponent;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-border/50 bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-spotify bg-clip-text text-transparent">
            Select Device
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-2">
            Choose where you want to play your music
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {isFetchingDevices ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Finding devices...</span>
            </div>
          ) : devices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No Spotify devices found. Make sure Spotify is open on another device.
              </p>
              <Button
                onClick={onPlayWithoutDevice}
                className="bg-spotify hover:bg-spotify/90 text-white"
                disabled={isLoading}
              >
                Try Anyway
              </Button>
            </div>
          ) : (
            devices.map((device) => {
              const IconComponent = getDeviceIcon(device.type);
              return (
                <Button
                  key={device.id}
                  variant={device.is_active ? "default" : "outline"}
                  className={`
                    w-full justify-start gap-3 p-4 h-auto rounded-xl transition-all duration-300
                    ${device.is_active 
                      ? "bg-spotify hover:bg-spotify/90 text-white border-spotify" 
                      : "border-border/50 bg-card/50 hover:bg-accent/50"
                    }
                  `}
                  onClick={() => handleDeviceSelect(device.id)}
                  disabled={isLoading}
                >
                  <IconComponent className="w-5 h-5 flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{device.name}</div>
                    {device.is_active && (
                      <div className="text-xs opacity-80">Currently active</div>
                    )}
                  </div>
                  {device.is_active && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  )}
                </Button>
              );
            })
          )}
        </div>

        <div className="flex justify-between pt-4 border-t border-border/50">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={fetchDevices} disabled={isFetchingDevices} variant="ghost">
            {isFetchingDevices ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Refresh"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}