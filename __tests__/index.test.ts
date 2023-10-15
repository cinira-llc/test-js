import {readJsonResource, readTextResources, sha256Hex} from "../src";

describe("index.ts", () => {
    describe("readJsonResource()", () => {
        test("Multiple matching resources", async () => {
            try {
                await readJsonResource(__dirname, "lorem-ipsum.txt*");
                expect(true).toBe(false);
            } catch (err) {
                if (!isError(err)) {
                    expect(true).toBe(false);
                } else {
                    const {message} = err;
                    expect(message).toContain("/lorem-ipsum.txt]");
                    expect(message).toContain("/lorem-ipsum.txt.br]");
                }
            }
        });
        test("No matching resource", async () => {
            try {
                await readJsonResource(__dirname, "does-not-exist-*.txt")
                expect(true).toBe(false);
            } catch (err) {
                if (!isError(err)) {
                    expect(true).toBe(false);
                } else {
                    const {message} = err;
                    expect(message).toContain("not found");
                }
            }
        });
        test("Single matching resource", async () => {
            const {paragraphs} = await readJsonResource<{
                paragraphs: string[]
            }>(__dirname, "lorem-ipsum-paragraphs.json");
            const hashes = paragraphs.map(sha256Hex);
            expect(paragraphs.map(sha256Hex)).toStrictEqual([
                "ef2c11ccf4de520e934b7c93437a37772f4edeb0807a5cdb15dbe13e27e184df",
                "bfc16bd8b55ff44d0432f680e606fd3250e0c680ae29dd8cc9f80597f4679f61",
                "9b1a07175fe01c015f79fe92dfb466094466831f75c2a0ad5dcb90ec124db04b",
                "760c32e36cec23a05099a90212e8561d2357b77bc1d3fa7e1eff20ecb9e4255b",
                "08620d279a1cc37f357f26a4d89c483afee1d08ed0987773ed5848cba3fc81ac"
            ]);
        });
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
    test("sha256Hex()", () => {
        expect(sha256Hex("this\nis\nonly\na\ntest"))
            .toBe("aea63b49b8ea3840befd957082b2b130f2a5a40e4e787763d9b061778299bf18");
    });
});

function isError(value: any): value is Error {
    return "object" === typeof value
        && "message" in value
        && "string" === typeof value.message
        && "stack" in value
        && "string" === typeof value.stack
}
