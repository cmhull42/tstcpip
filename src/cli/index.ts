import yargs from "yargs";

export interface Args {
    port: number;
    mac: string;
    ip: string;
    endpoint: string;
}

export function main(callback: (args: Args) => any) {

    const argv = yargs
        .option("port", {
            alias: "p",
            type: "number",
            demandOption: true
        })
        .option("mac", {
            alias: "m",
            type: "string",
            description: "MAC Address to use (doesn't have to be real)",
            demandOption: true
        })
        .option("ip", {
            alias: "i",
            type: "string",
            description: "Static IP to assign",
            demandOption: true
        })
        .option("endpoint", {
            alias: "e",
            type: "string",
            description: "Remote address to connect link to",
            demandOption: true
        })
        .help()
        .alias("help", "h")
        .argv;

    callback(argv);
}