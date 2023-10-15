import {readTextResources, sha256Hex} from "../src";

describe("index.ts", () => {
    test("sha256Hex()", () => {
        expect(sha256Hex("this\nis\nonly\na\ntest"))
            .toBe("aea63b49b8ea3840befd957082b2b130f2a5a40e4e787763d9b061778299bf18");
    });
    describe("readTextResources()", () => {
        test("Brotli compressed file", async () => {
            const [[, content]] = await readTextResources(__dirname, "./lorem-ipsum.txt.br");
            expect(sha256Hex(content)).toBe("d8436a0f97dbbfa44fbe3d56eed1c4dcbf0a16e5d59928c6144b29d04b4c2956");
        });
        test("Uncompressed file", async () => {
            const [[, content]] = await readTextResources(__dirname, "./lorem-ipsum.txt");
            expect(sha256Hex(content)).toBe("d8436a0f97dbbfa44fbe3d56eed1c4dcbf0a16e5d59928c6144b29d04b4c2956");
        });
    });
});
