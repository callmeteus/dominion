import { readdirSync, readFileSync } from "fs";
import path = require("path");
import { Server } from "./Server";

export class BlockList {
    private static list: string[] = [];

    constructor(protected server: Server) {

    }

    /**
     * Loads all lists inside the "lists" directory.
     */
    public load() {
        const dir = path.resolve(
            process.cwd(),
            "lists"
        );

        readdirSync(dir, {
            withFileTypes: true
        }).forEach((file) => {
            if (!file.isFile()) {
                return;
            }

            const fileName = path.resolve(dir, file.name);
            this.server.logger.debug("loading list file \"%s\"...", fileName);

            const lines = readFileSync(fileName, "utf8")?.split("\n");

            for(let line of lines) {
                if (BlockList.list.includes(line)) {
                    continue;
                }

                BlockList.list.push(line.trim());
            }
        });

        this.server.logger.info("block list has %d unique domain names", BlockList.list.length);
    }

    /**
     * Checks if a domain is included in the block list.
     * @param domain The domain name to be checked.
     * @returns 
     */
    public contains(domain: string) {
        return BlockList.list.includes(domain);
    }
}