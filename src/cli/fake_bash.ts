import { Args, main } from ".";
import { IPConfigurationMap, Ipv4OverEthernet } from "../constructs/ipv4-device";
import { IPOIPClientLink } from "../network/4-link-layer/ipoip";
import * as readline from "readline";
import yargs from "yargs";
import { Functions } from "./functions";

async function notbash(args: Args) {
  const link1 = new IPOIPClientLink(args.port.toString());

  const config: IPConfigurationMap = {
    "0A:00:00:00:00:01": {
      ipAllocation: { 
        static: {
          ipv4Address: "10.0.0.2",
          cidr: {
            prefix: "10.0.0.0",
            mask: 24
          },
          defaultGateway: "10.0.0.1"
        } 
      },
      link: link1
    }
  }

  const device = new Ipv4OverEthernet(config);
  console.log(`Built device with hwaddr: <${args.mac}>, netaddr: <${args.ip}>`)

  link1.connect(args.endpoint);
  console.log(`IPOIP - Connected to ${args.endpoint}`);

  const commands = Functions.all();

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