import { Ipv4OverEthernet } from "../constructs/ipv4-device";
import { IPOIPClientLink } from "../network/4-link-layer/ipoip";
import { Args, main } from ".";

async function ipoip(args: Args) {
    const link1 = new IPOIPClientLink(args.port.toString());

    const device1 = new Ipv4OverEthernet(link1, args.mac, args.ip);
    console.log(`Built device with hwaddr: <${args.mac}>, netaddr: <${args.ip}>`)

    device1.ipv4.register(0x17, (data) => {
        console.log(`Got data: ${data}`);
    });

    link1.connect(args.endpoint);
    console.log(`IPOIP - Connected to ${args.endpoint}`);

}

main(ipoip);