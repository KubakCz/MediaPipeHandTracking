import axios from "axios";
import { ConnectionSettings } from "./models";

const BASE_URL = "https://localhost:7095";
const TIMEOUT = 1000;

/**
 * Sends a GET request to the specified URL.
 * @param {string} url - The URL to send the request to.
 * @param {number} [timeout=0] - The request timeout in milliseconds.
 * @returns {Promise} - A Promise that resolves to the response of the request.
 */
function getRequest(url: string, timeout: number = 0) {
  return axios({
    baseURL: BASE_URL,
    url: url,
    method: "get",
    timeout: timeout,
  });
}

/**
 * Sends a POST request to the specified URL.
 * @param {string} url - The URL to send the request to.
 * @param {any} data - The data to send in the request.
 * @param {number} [timeout=0] - The request timeout in milliseconds.
 * @returns {Promise} - A Promise that resolves to the response of the request.
 */
function postRequest(url: string, data: any, timeout: number = 0) {
  return axios({
    baseURL: BASE_URL,
    url: url,
    method: "post",
    data: data,
    timeout: timeout,
  });
}

/**
 * Gets the current NatNet connection settings.
 * @returns {Promise<ConnectionSettings | undefined | null>} - A Promise that resolves to the connection settings if connected to a NatNetServer, null if not connected to NatNet server, or undefined if an error occurs.
 */
export async function getConnectionSettings() {
  try {
    const response = await getRequest("/api/NatNetConnectionSettings", TIMEOUT);
    return response.data as ConnectionSettings;
  } catch (error: any) {
    if (error.response && error.response.status === 404) return null;
    return undefined;
  }
}

/**
 * Gets the default NatNet connection settings.
 * @returns {Promise<ConnectionSettings | undefined>} - A Promise that resolves to the default connection settings, or undefined if an error occurs.
 */
export async function getDefaultConnectionSettings() {
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
 * @returns {Promise<AxiosResponse<any, any>>} - A Promise that resolves to the response of the request. Throws an error if the request fails.
 */
export async function setConnectionSettings(settings: ConnectionSettings) {
  return await postRequest("/api/NatNetConnectionSettings", settings, 10000); // 10 seconds timeout, because it may take a while to connect
}
