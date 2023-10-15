import {createHash} from "node:crypto";
import fs from "fs";
import path from "path";
import {Readable} from "stream";
import {glob} from "glob";
import {createBrotliDecompress} from "zlib";

/**
 * Read the contents of one or more UTF-8 text files.
 *
 * If the matched file(s) have any of the following filename extensions, they are transformed appropriately before they
 * are returned:
 *
 * * `.br` the file will be Brotli decompressed.
 *
 * @param base the base directory.
 * @param relative the glob, relative to the `base` directory, matching files to read.
 */
export async function readTextResources(base: string, relative: string) {
    const pattern = path.resolve(base, "./", relative),
        matches = await glob(pattern.replace(/\\/g, "/"));
    return Promise.all(matches.map(match =>
        new Promise<[path.ParsedPath, string]>((resolve, reject) => {

            /* Open a stream on the match. Pipe through a decompressor if necessary. */
            let input: Readable = fs.createReadStream(match);
            const parsedPath = path.parse(match);
            if (".br" === parsedPath.ext) {
                input = input.pipe(createBrotliDecompress());
            }

            /* Read the stream. */
            let content = "";
            input.on("end", () => {
                resolve([path.parse(match), content]);
            }).on("error", (err: Error) => {
                reject(err);
            }).on("data", (data: string) => {
                content += data;
            });
        })));
}

/**
 * Get the SHA-256 hex hash of the UTF-8 encoding of a string.
 *
 * @param content the string to hash.
 */
export function sha256Hex(content: string) {
    return createHash("sha256").update(content, "utf-8").digest().toString("hex");
}
