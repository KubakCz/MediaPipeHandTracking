// Definition of the models used in requests.

export enum ConnectionType {
  Unicast = "Unicast",
  Multicast = "Multicast",
}

export interface ConnectionSettings {
  localIP: string;
  serverIP: string;
  commandPort: number;
  dataPort: number;
  connectionType: ConnectionType;
}
