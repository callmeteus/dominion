import { readdirSync, readFileSync } from "fs";
import path = require("path");
import { Dominion } from "./App";
import AdsList from "./data/lists/blocklists/ads";
import AnalyticsList from "./data/lists/blocklists/analytics";
import { IList, List } from "./dns/blocklist/List";

export class BlockList {
    /**
     * Unsorted and unparsed lists.
     */
    private static list: string[] = [];

    /**
     * Parsed and sorted lists
     */
    private static parsedLists: List[] = [
        AdsList,
        AnalyticsList
    ];

    constructor(protected app: Dominion) {

    }

    /**
     * Loads all lists inside the "lists" directory.
     */
    public load() {
        const dir = path.resolve(
            this.app.rootDir,
            "lists"
        );
        
        this.app.logger.info("loading block lists from \"%s\"...", dir);

        readdirSync(dir, {
            withFileTypes: true
        }).forEach((file) => {
            if (!file.isFile()) {
                return;
            }

            const fileName = path.resolve(dir, file.name);
            this.app.logger.debug("loading list file \"%s\"...", fileName);

            const lines = readFileSync(fileName, "utf8")?.split("\n");

            for(let line of lines) {
                BlockList.list.push(line.trim());
            }
        });

        // Filter only block lists
        BlockList.parsedLists
            .filter((list) => list.hasBlocklist())
            .forEach((list) => {
                // Add them to the list
                BlockList.list.push(...list.getBlockedDomains());
            });

        // Filter out duplicated
        BlockList.list = BlockList.list.filter((item, index) => BlockList.list.indexOf(item) === index);

        this.app.logger.info("block list has %d unique domain names", BlockList.list.length);
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