import {TextDecoder, TextEncoder} from "util";

export enum FieldType {
    BYTES,
    /** Supports up to 32 bit unsigned ints */
    UNSIGNED_NUMBER,
    SIGNED_NUMBER,
    STRING
}

export type WidthType = number | "calculated";

export interface FieldDefinition {
    name: string;
    /**  the width of the field in octets, or the string "calculated" to use the field specified in widthField */
    widthBytes: WidthType;
    /** when widthBytes is "calculated" a field whose value will be substituted for the width of this field. 
     * The field in question must occur prior to this field in the definition, and be of type number
     */
    widthField?: string;
    fieldType: FieldType;
}

export function deserialize<T>(data: Uint8Array, defs: FieldDefinition[]): T {
    const out: any = {};
    let offset = 0;
    defs.forEach((def) => {
        // TODO this only holds true for UInt8, fix
        const width = getFieldWidth(out, def, defs);

        if (offset + width > data.length) {
            throw new Error(`Field definition is longer than the data received (got ${data.byteLength} bytes)`);
        }

        const range = data.slice(offset, offset + width);
        out[def.name] = readField(range, def);
        offset += width;
    });

    return out as T;
}

export function serialize<T>(data: T, defs: FieldDefinition[]): Uint8Array {
    const finalWidth = calculateObjectWidth(data, defs);
    const out = new Uint8Array(finalWidth);
    let offset = 0;

    defs.forEach((def) => {
        const field = serializeField(data, def, defs);
        out.set(field, offset);

        offset += field.byteLength;
    })

    return out;
}

function calculateObjectWidth<T>(data: T, defs: FieldDefinition[]) {
    return defs.reduce((prev, curr) => {
        return prev + getFieldWidth(data, curr, defs)
    }, 0)
}

function getFieldWidth(partialPacket: any, field: FieldDefinition, defs: FieldDefinition[]): number {
    if (field.widthBytes == "calculated") {
        const errorContext = `while calculating width for ${field.name}`;

        if (!field.widthField) {
            throw new Error(`Field width is set to "calculated" but no "widthField" parameter was provided ${errorContext}`)
        }

        const res = defs
            .filter(def => def.name == field.widthField);
        
        if (res.length != 1) {
            throw new Error(`Expected a single field in the definition to match ${field.widthField} but there were ${res.length} ${errorContext}`)
        }

        const calculatedField = res[0];
        if (calculatedField.fieldType != FieldType.UNSIGNED_NUMBER) {
            throw new Error(`Can only calculate field width from a FieldType of UNSIGNED_NUMBER ${errorContext}`);
        }

        return partialPacket[calculatedField.name]; 
    }

    return field.widthBytes;
}

function readField(data: Uint8Array, def: FieldDefinition): any {
    // TODO implement more as needed
    switch(def.fieldType) {
        case FieldType.BYTES:
            return data;
        case FieldType.UNSIGNED_NUMBER:
            return bytesToUnsignedNumber(data);
        case FieldType.STRING:
            return new TextDecoder().decode(data);
        default:
            throw new Error(`Encountered a fieldtype ${def.fieldType} that is not implemented`)
    }
}

function serializeField(data: any, def: FieldDefinition, defs: FieldDefinition[]): Uint8Array {
    const width = getFieldWidth(data, def, defs);

    switch (def.fieldType) {
        case FieldType.BYTES:
            return data[def.name];
        case FieldType.UNSIGNED_NUMBER:
            return unsignedNumberToBytes(data[def.name], width);
        case FieldType.STRING:
            return new TextEncoder().encode(data[def.name]);
        default:
            throw new Error(`Encountered a fieldtype ${def.fieldType} that is not implemented`)
    }
}

function bytesToUnsignedNumber(data: Uint8Array): number {
    const buffer = Buffer.from(data);
    switch (data.byteLength) {
        case 1:
            return buffer.readUInt8();
        case 2:
            return buffer.readUInt16BE();
        case 4:
            return buffer.readUInt32BE();
    }
}

function unsignedNumberToBytes(num: number, width: number): Uint8Array {
    const buff = Buffer.alloc(width);

    switch (width) {
        case 1:
            buff.writeUInt8(num);
            return buff
        case 2:
            buff.writeUInt16BE(num);
            return buff;
        case 4:
            buff.writeUInt32BE(num);
            return buff;
    }
}

// Convenience
export class ByteField implements FieldDefinition {
    readonly name: string;
    readonly fieldType: FieldType;
    readonly widthBytes: WidthType;
    readonly widthField?: string;

    constructor(name: string, widthBytes: WidthType, widthField?: string) {
        this.name = name;
        this.fieldType = FieldType.BYTES,
        this.widthBytes = widthBytes;
        this.widthField = widthField;
    }
}