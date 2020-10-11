import { Ipv4OverEthernet } from "../constructs/ipv4-device";
import { IPOIPLink } from "../network/link-layer/ipoip";
import { Args, main } from ".";

async function ipoip(args: Args) {
    const link1 = new IPOIPLink(args.port.toString());

    const device1 = new Ipv4OverEthernet(link1, args.mac, args.ip);

    device1.ipv4.register(0x17, (data) => {
        console.log(`Got data: ${data}`);
    });

    link1.connect(args.endpoint);
}

main(ipoip);