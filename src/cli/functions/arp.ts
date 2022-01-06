import { CliFunction } from ".";

export const arp: CliFunction = (device) => {
  return async (args) => {
    console.table(device.arp_cache(), ["ip", "hwaddr"]);
  }
}