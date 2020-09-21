import * as fixedWidth from "../../src/util/fixed-width-util";
import {TextEncoder, TextDecoder} from "util";

interface Test1Interface {
    preamble: number;
    payload: string;
    padding: Uint8Array;
}

const INTERFACE_DEF: fixedWidth.FieldDefinition[] = [
    {
        name: "preamble",
        fieldType: fixedWidth.FieldType.UNSIGNED_NUMBER,
        widthBytes: 1
    },
    {
        name: "payload",
        fieldType: fixedWidth.FieldType.STRING,
        widthBytes: 2
    },
    {
        name: "padding",
        fieldType: fixedWidth.FieldType.BYTES,
        widthBytes: 1
    }
];

describe("Fixed width utility", () => {

    describe("Serialize", () => {
        it("Serializes correctly", () => {
            const data: Test1Interface = {
                preamble: 4,
                payload: "df",
                padding: new TextEncoder().encode("!")
            }

            const serialized = fixedWidth.serialize(data, INTERFACE_DEF);
            expect(serialized).toStrictEqual(new Uint8Array([
                0x04, 0x64, 0x66, 0x21
            ]));
        })
    });

    it("Deserializes a valid definition", () => {
        const bytes = new TextEncoder().encode("abcd");


        const model = fixedWidth.deserialize<Test1Interface>(bytes, INTERFACE_DEF);
        const decoder = new TextDecoder();

        expect(model.preamble).toBe(97);
        expect(model.payload).toBe("bc");
        expect(decoder.decode(model.padding)).toBe("d");
    });

    it("Throws when definition is longer than source", () => {
        const bytes = new TextEncoder().encode("abcd");

        const badFieldDef = [{
            name: "whoops",
            fieldType: fixedWidth.FieldType.BYTES,
            widthBytes: 5
        }];

        expect(() => fixedWidth.deserialize(bytes, badFieldDef)).toThrow();
    });

    it("Throws when widthField is omitted for calculated widths", () => {
        const bytes = new TextEncoder().encode("abcd");
        const badFieldDef: fixedWidth.FieldDefinition[] = [{
            name: "whoops",
            fieldType: fixedWidth.FieldType.BYTES,
            widthBytes: "calculated"
        }];

        expect(() => fixedWidth.deserialize(bytes, badFieldDef)).toThrow();
    });

    it("Throws when widthField doesn't exist for calculated widths", () => {
        const bytes = new TextEncoder().encode("abcd");
        const badFieldDef: fixedWidth.FieldDefinition[] = [{
            name: "whoops",
            fieldType: fixedWidth.FieldType.BYTES,
            widthBytes: "calculated",
            widthField: "notreal"
        }];

        expect(() => fixedWidth.deserialize(bytes, badFieldDef)).toThrow();
    });

    it("Throws when widthField doesn't have FieldType NUMBER", () => {
        const bytes = new TextEncoder().encode("abcd");
        const badFieldDef: fixedWidth.FieldDefinition[] = [
            {
                name: "wrongtype",
                fieldType: fixedWidth.FieldType.BYTES,
                widthBytes: 2,
            },
            {
                name: "calculatedField",
                fieldType: fixedWidth.FieldType.BYTES,
                widthBytes: "calculated",
                widthField: "wrongtype"
            }
        ];

        expect(() => fixedWidth.deserialize(bytes, badFieldDef)).toThrow();
    });

    it("Can calculate width from another field", () => {
        const data = new Uint8Array([
            0x00, 0x05, 0x48, 0x45, 0x4C, 0x4C, 0x4F
        ])
        const fieldDef: fixedWidth.FieldDefinition[] = [
            {
                name: "preamble",
                fieldType: fixedWidth.FieldType.UNSIGNED_NUMBER,
                widthBytes: 2,
            },
            {
                name: "payload",
                fieldType: fixedWidth.FieldType.STRING,
                widthBytes: "calculated",
                widthField: "preamble"
            }
        ];

        const res = fixedWidth.deserialize<Test1Interface>(
            data, fieldDef
        );

        expect(res.preamble).toBe(5);
        expect(res.payload).toBe("HELLO");
    });
});