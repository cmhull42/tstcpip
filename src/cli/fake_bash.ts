import { Args, main } from ".";
import { Ipv4OverEthernet } from "../constructs/ipv4-device";
import { IPOIPLink } from "../network/link-layer/ipoip";
import * as readline from "readline";
import yargs from "yargs";

async function notbash(args: Args) {
  const link1 = new IPOIPLink(args.port.toString());

  const device = new Ipv4OverEthernet(link1, args.mac, args.ip);
  console.log(`Built device with hwaddr: <${args.mac}>, netaddr: <${args.ip}>`)

  link1.connect(args.endpoint);
  console.log(`IPOIP - Connected to ${args.endpoint}`);

  const ping = async (args) => {
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

  const commands = {
    "help": (args) => console.log(`commands: ${Object.keys(commands).join(",")}`),
    "ping": ping
  }

  while (true) {
    const line = await prompt();
    const bits = line.split(" ");
    if (line.trim() == "") {
      continue;
    }

    if (commands[bits[0]]) {
      const args = line.replace(new RegExp(`^${bits[0]} ?`), "");
      try {
        await commands[bits[0]](args);
      } catch (err) {
        continue;
      }
    }
    else {
      console.log(`Command not found: ${bits[0]}`);
    }
  }
}

async function prompt(): Promise<string> {
  return new Promise((resolve, _) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  
    rl.setPrompt("> ");
    rl.prompt();
  
    rl.on("line", (line) => {
      rl.close();
      resolve(line);
    })
  });
}

main(notbash);