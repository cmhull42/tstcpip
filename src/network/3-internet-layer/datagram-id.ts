import LRU from "lru-cache";
import { IPV4Address, toString } from "../../models/3-internet-layer/ip";

const MAXIMUM_DATAGRAM_LIFETIME_MS = 1000 * 60 * 2;

const cache = new LRU<string, number>({
    maxAge: MAXIMUM_DATAGRAM_LIFETIME_MS
});

export function getDatagramId(sender: IPV4Address, destination: IPV4Address, protocol: number) {
    const cacheKey = `${toString(sender)}-${toString(destination)}-${protocol}`;
    const id = cache.get(cacheKey) ?? 0;

    cache.set(cacheKey, id + 1);
    return id;
}