import { useEffect, useState } from "react";
import IPInput from "./Components/IPInput";
import PortInput from "./Components/PortInput";
import { ConnectionType, ConnectionSettings } from "../requests/models";
import { Button, Text, Select, Spinner, VStack, useToast } from "@chakra-ui/react";
import * as requests from "../requests/requests";
import SettingsDropdown from "./Components/SettingsDropdown";

/**
 * Connection settings form component.
 * Used to connect to a NatNet server.
 */
export default function ConnectionSettings() {
  // State variables for the connection status
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectingInProgress, setConnectingInProgress] = useState<boolean>(false);

  // State variables for the connection settings
  const [localIP, setLocalIP] = useState<string | null>("127.0.0.1");
  const [serverIP, setServerIP] = useState<string | null>("127.0.0.1");
  const [commandPort, setCommandPort] = useState<number | null>(0);
  const [dataPort, setDataPort] = useState<number | null>(0);
  const [connectionType, setConnectionType] = useState<ConnectionType>(ConnectionType.Multicast);

  const toast = useToast();

  /**
   * Checks if all connection settings are valid.
   * @returns {boolean} - True if all connection settings are valid, false otherwise.
   */
  function allValid(): boolean {
    console.log(localIP, serverIP, commandPort, dataPort);
    return localIP !== null && serverIP !== null && commandPort !== null && dataPort !== null;
  }

  /**
   * Handles the connect action.
   */
  function handleConnect() {
    if (!allValid() || connectingInProgress) return;

    setConnectingInProgress(true);

    const connectionSettings: ConnectionSettings = {
      localIP: localIP!,
      serverIP: serverIP!,
      commandPort: commandPort!,
      dataPort: dataPort!,
      connectionType: connectionType,
    };

    requests
      .setConnectionSettings(connectionSettings)
      .then((response) => {
        if (response.status === 200) {
          setIsConnected(true);
          toast({
            title: "Connected to the NatNet server",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
        } else {
          setIsConnected(false);
          toast({
            title: "Failed to connect to the NatNet server",
            description: response.data,
            status: "error",
            duration: 10000,
            isClosable: true,
          });
        }
      })
      .catch((error) => {
        const message = error.response?.data || error.message;
        toast({
          title: "Connection failed",
          description: `Failed to connect to the server: ${message}`,
          status: "error",
          duration: 10000,
          isClosable: true,
        });
      })
      .finally(() => {
        setConnectingInProgress(false);
      });
  }

  /**
   * Effect hook to get the connection settings when the component mounts.
   */
  useEffect(() => {
    console.log("ConnectionSettings mounted");
    setConnectingInProgress(true);
    // Try to get the connection settings to currently connected NatNet server
    requests
      .getConnectionSettings()
      .then((settings) => {
        // Backend running...
        if (settings) {
          // Already connected => set the connection settings
          setIsConnected(true);
          setLocalIP(settings.localIP);
          setServerIP(settings.serverIP);
          setCommandPort(settings.commandPort);
          setDataPort(settings.dataPort);
          setConnectionType(settings.connectionType);
        } else {
          // Not connected => get the default connection settings
          setIsConnected(false);
          requests.getDefaultConnectionSettings().then((settings) => {
            if (settings) {
              setLocalIP(settings.localIP);
              setServerIP(settings.serverIP);
              setCommandPort(settings.commandPort);
              setDataPort(settings.dataPort);
              setConnectionType(settings.connectionType);
            }
          });
        }
      })
      .catch((error) => {
        // Failed to connect
        console.log(error);
      })
      .finally(() => {
        setConnectingInProgress(false);
        console.log("ConnectionSettings unmounted");
      });
  }, []);

  console.log("ConnectionSettings rendered", connectingInProgress, allValid());

  return (
    <VStack alignItems="stretch" textAlign="left" gap="2">
      <p>{isConnected ? "Connected to NatNet server" : "Not connected to NatNetServer"}</p>
      <IPInput label="Local IP" value={localIP} onChange={setLocalIP} />
      <IPInput label="Server IP" value={serverIP} onChange={setServerIP} />
      <PortInput label="Command Port" value={commandPort} onChange={setCommandPort} />
      <PortInput label="Data Port" value={dataPort} onChange={setDataPort} />
      <SettingsDropdown
        label="Connection Type"
        value={connectionType}
        options={Object.values(ConnectionType)}
        onChange={setConnectionType}
      />
      <Button
        onClick={handleConnect}
        isDisabled={connectingInProgress || !allValid()}
        maxWidth="120"
        size="md"
      >
        {connectingInProgress ? <Spinner /> : "Connect"}
      </Button>
    </VStack>
  );
}
