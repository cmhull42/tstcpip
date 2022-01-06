import { Ipv4OverEthernet } from "../../constructs/ipv4-device"
import { arp } from "./arp";
import { help } from "./help";
import { ping } from "./ping";

export type FunctionCall = (args: string[]) => Promise<any> | any;

export type CliFunction = (device: Ipv4OverEthernet) => FunctionCall;

export const Functions = {
  all: () => ({
    "ping": ping, 
    "arp": arp,
    "help": help
  })
}