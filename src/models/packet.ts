import { FieldDefinition, serialize, deserialize } from "../util/fixed-width-util";

export class Packet<T> {
    definition: FieldDefinition[];

    constructor(definition: FieldDefinition[]) {
        this.definition = definition;
    }

    toWireFormat(obj: T): Uint8Array {
        return serialize(obj, this.definition);
    }

    toModel(data: Uint8Array): T {
        return deserialize<T>(data, this.definition);
    }
}