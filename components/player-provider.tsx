"use client";

import { DeviceSelection } from "@/components/ui/device-selection";
import { usePlayer } from "@/hooks/use-player";

export function PlayerProvider() {
  const {
    showDeviceSelection,
    setShowDeviceSelection,
    handleDeviceSelect,
    handlePlayWithoutDevice,
    isLoading,
  } = usePlayer();

  return (
    <DeviceSelection
      isOpen={showDeviceSelection}
      onClose={() => setShowDeviceSelection(false)}
      onDeviceSelect={handleDeviceSelect}
      onPlayWithoutDevice={handlePlayWithoutDevice}
      isLoading={isLoading}
    />
  );
}