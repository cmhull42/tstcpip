import got from "got";
import express from "express";
import bodyparser from "body-parser";
import { Link, LinkCallback } from "./link";

export class IPOIPClientLink implements Link {
    callback: LinkCallback;
    ipoip: IPOIPAccessor;
    port: string;

    constructor(port: string) {
        this.port = port;
    }

    async send(data: Uint8Array): Promise<void> {
        await this.ipoip.transmit(data);
    }

    register(callback: LinkCallback) {
        this.callback = callback;
    }

    async connect(endpoint: string) {
        const ipoip = new IPOIPAccessor(endpoint);
        this.ipoip = ipoip;

        this.ipoip.startListen(this.port, this.callback)
    }
}

export class IPOIPEthernetRouterLink implements Link {
    send: (data: Uint8Array) => void | Promise<void>;
    register: (callback: LinkCallback) => void;
    callback: LinkCallback;
}

class IPOIPAccessor {
    endpoint: string;
    
    constructor(endpoint: string) {
        this.endpoint = endpoint;
    }

    async healthCheck(): Promise<void> {
        const route = this.endpoint + "/health";

        await got.get(route);
    }

    async transmit(data: Uint8Array) {
        const route = this.endpoint + "/receive";

        await got.post(route, {
            json: {
                data: Buffer.from(data).toString("base64")
            }
        });
    }

    async startListen(port: string, receiveCallback: (data: Uint8Array) => any) {
        const app = express();

        app.use(bodyparser.json());

        app.get('/health', (req, res) => {
            res.status(204).send();
        });

        app.post('/receive', (req, res) => {
            receiveCallback(Buffer.from(req.body.data, 'base64'));
            res.status(204).send();
        });

        app.listen(port);
    }
}