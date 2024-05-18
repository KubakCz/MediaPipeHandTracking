// Functions for easy communication with the backend REST API.

import axios, { AxiosResponse } from "axios";
import { ConnectionSettings } from "./models";

const BASE_URL = "http://localhost:5184"; // Base URL of the backend REST API
const TIMEOUT = 1000; // Default timeout in milliseconds

/**
 * Send a GET request to the specified URL.
 * @param {string} url - The URL to send the request to.
 * @param {number} [timeout=0] - The request timeout in milliseconds. (0 means no timeout)
 * @returns A Promise that resolves to the response of the request.
 */
function getRequest(url: string, timeout: number = 0): Promise<any> {
  return axios({
    baseURL: BASE_URL,
    url: url,
    method: "get",
    timeout: timeout,
  });
}

/**
 * Send a POST request to the specified URL.
 * @param {string} url - The URL to send the request to.
 * @param {any} data - The data to send in the request.
 * @param {number} [timeout=0] - The request timeout in milliseconds. (0 means no timeout)
 * @returns A Promise that resolves to the response of the request.
 */
function postRequest(url: string, data: any, timeout: number = 0): Promise<any> {
  return axios({
    baseURL: BASE_URL,
    url: url,
    method: "post",
    data: data,
    timeout: timeout,
  });
}

/**
 * Get the current NatNet connection settings.
 * @returns A Promise that resolves to the connection settings if connected to a NatNetServer, null if not connected to NatNet server, or undefined if an error occurs.
 */
export async function getConnectionSettings(): Promise<ConnectionSettings | undefined | null> {
  try {
    const response = await getRequest("/api/NatNetConnectionSettings", TIMEOUT);
    return response.data as ConnectionSettings;
  } catch (error: any) {
    if (error.response && error.response.status === 404) return null;
    return undefined;
  }
}

/**
 * Get the default NatNet connection settings.
 * @returns A Promise that resolves to the default connection settings, or undefined if an error occurs.
 */
export async function getDefaultConnectionSettings(): Promise<ConnectionSettings | undefined> {
  try {
    const response = await getRequest("/api/NatNetConnectionSettings/Default", TIMEOUT);
    return response.data as ConnectionSettings;
  } catch (error) {
    return undefined;
  }
}

/**
 * Set the NatNet connection settings and try to connect to the NatNet server.
 * @param settings - The connection settings to set.
 * @returns A Promise that resolves to the response of the request. Throws an error if the request fails.
 */
export async function setConnectionSettings(
  settings: ConnectionSettings
): Promise<AxiosResponse<any, any>> {
  return await postRequest("/api/NatNetConnectionSettings", settings, 10000); // 10 seconds timeout, because it may take a while to connect
}

/**
 * Get recording status.
 * @returns A Promise that resolves to the recording status, or undefined if an error occurs.
 */
export async function isRecording(): Promise<boolean | undefined> {
  try {
    const response = await getRequest("/api/Recording", TIMEOUT);
    return response.data as boolean;
  } catch (error: any) {
    return undefined;
  }
}

/**
 * Set recording status.
 * @param recording - The recording status to set.
 * @returns A Promise that resolves to the response of the request. Throws an error if the request fails.
 */
export async function setRecording(recording: boolean): Promise<AxiosResponse<any, any>> {
  return await postRequest(`/api/Recording?recording=${recording}`, undefined, TIMEOUT);
}
