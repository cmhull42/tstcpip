import yargs from "yargs";
import { CliFunction } from ".";

export const ping: CliFunction = (device) => {
  return async (args) => {
    const parsed = yargs(args)
      .describe("p", "Payload to send with the echo request. If absent a payload of length 1024 will be generated")
      .alias("p", "payload")
      .describe("t", "Ttl of the echo request")
      .alias("t", "ttl")
      .usage("ping <addr>")
      .demandCommand(1)
      .exitProcess(false)
      .argv;

    const pingAddr = parsed._[0].toString();
    const payload = parsed.p as string;
    console.log(`Pinging device at <${pingAddr}> with payload ${payload}`);

    try {
      await device.ping(pingAddr, payload);
    }
    catch (err) {
      console.log(err.message)
    }
  }
}