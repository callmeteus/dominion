import * as fs from "fs";
import * as https from "https";
import { readdirSync, readFileSync } from "fs";
import * as path from "path";

import { Dominion } from "./App";
import AdsList from "./data/lists/blocklists/ads";
import AnalyticsList from "./data/lists/blocklists/analytics";
import { List } from "./database/List";
import { EItemType, InternalList } from "./dns/blocklist/List";

export class BlocklistUpdater {
    /**
     * Unsorted and unparsed lists.
     */
    private static list: string[] = [];

    /**
     * Parsed and sorted lists
     */
    private static parsedLists: InternalList[] = [
        AdsList,
        AnalyticsList
    ];
    listsDir: string;

    constructor(protected app: Dominion) {

    }

    /**
     * Loads all lists inside the "lists" directory.
     */
    public async load() {
        this.listsDir = path.resolve(
            this.app.rootDir,
            "data",
            "external-lists"
        );

        fs.mkdirSync(this.listsDir, { recursive: true });

        await this.updateExternalLists();
        
        this.app.logger.info("loading block lists from \"%s\"...", this.listsDir);

        readdirSync(this.listsDir, {
            withFileTypes: true
        }).forEach((file) => {
            if (!file.isFile()) {
                return;
            }

            const fileName = path.resolve(this.listsDir, file.name);
            this.app.logger.debug("loading list file \"%s\"...", fileName);

            let lines = readFileSync(fileName, "utf8")?.split("\n");

            for(let line of lines) {
                BlocklistUpdater.list.push(line.trim());
            }

            lines = null;

            gc();
        });

        // Filter only block lists
        BlocklistUpdater.parsedLists
            .filter((list) => list.hasBlocklist())
            .forEach((list) => {
                // Add them to the list
                BlocklistUpdater.list.push(...list.getBlockedDomains());
            });

        this.app.logger.info("block list has %d unique domain names", BlocklistUpdater.list.length);
        this.app.logger.info("updating the database...");

        await List.bulkCreate(
            BlocklistUpdater.list.map((domain) => {
                return {
                    domain,
                    active: true,
                    type: EItemType.BLOCK
                };
            }),
            {
                updateOnDuplicate: ["domain", "type"]
            }
        );

        this.app.logger.info(
            "database updated; %d existing domains, %d on the blocklist, %d on the whitelist.", 
            await List.count(),
            await List.count({ where: { type: EItemType.BLOCK }}),
            await List.count({ where: { type: EItemType.ALLOW }}),
        );

        // Clear the memory
        BlocklistUpdater.list = null;
        BlocklistUpdater.parsedLists = null;

        gc();
    }

    /**
     * Downloads a single file.
     * @param url The file URL.
     * @param targetFile The target file location.
     * @returns 
     */
    private downloadFile(url: string, targetFile: string) {
        return new Promise<void>((resolve, reject) => {
            https.get(url, response => {
                const code = response.statusCode ?? 0;

                if (code >= 400) {
                    return reject(new Error(response.statusMessage));
                }
    
                // handle redirects
                if (code > 300 && code < 400 && !!response.headers.location) {
                    return this.downloadFile(response.headers.location, targetFile);
                }

                // save the file to disk
                const fileWriter = fs
                    .createWriteStream(targetFile)
                    .on("finish", () => {
                        resolve()
                    });
            
                response.pipe(fileWriter);
            })
            .on("error", error => {
                reject(error)
            })
        })
    }

    /**
     * Updates all external lists.
     */
    public async updateExternalLists() {
        this.app.logger.info("updating external lists...");

        const externalLists = [
            "https://raw.githubusercontent.com/justdomains/blocklists/master/lists/nocoin-justdomains.txt",
            "https://raw.githubusercontent.com/justdomains/blocklists/master/lists/easyprivacy-justdomains.txt",
            "https://raw.githubusercontent.com/justdomains/blocklists/master/lists/easylist-justdomains.txt",
            "https://raw.githubusercontent.com/justdomains/blocklists/master/lists/adguarddns-justdomains.txt"
        ];

        // Iterate over all external lists
        for(let source of externalLists) {
            // Download it
            const fileName = path.basename(source);

            this.app.logger.info("updating list \"%s\" from \"%s\"...", fileName, source);

            await this.downloadFile(source, path.resolve(this.listsDir, fileName));
        }
    }
}