import * as fs from "fs";
import * as https from "https";
import * as path from "path";
import * as winston from "winston";

import { BlockList } from "./BlockList";
import { DNSServer } from "./Server";

interface IOptions {
    port: number;
    dns: {
        resolvers: string[]
    }
}

const defaultOptions: IOptions = {
    port: 53,
    dns: {
        resolvers: ["1.1.1.1"]
    }
};

export class Dominion {
    /**
     * The application root directory.
     */
    public rootDir = process.cwd();

    /**
     * The DNS server.
     */
    public server: DNSServer;

    /**
     * The block list handler.
     */
    public blockList: BlockList;

    /**
     * If the application is in debug mode.
     */
    public isDebug = process.env.NODE_ENV !== "production";

    public logger = winston.createLogger({
        level: this.isDebug ? "debug" : "info",
        transports: new winston.transports.Console({
            format: winston.format.combine(
                winston.format.label({ label: "app" }),
                winston.format.colorize(),
                winston.format.timestamp(),
                winston.format.splat(),
                winston.format.simple()
            )
        })
    });

    constructor(
        public options?: IOptions
    ) {
        if (!options) {
            this.options = defaultOptions;
        } else {
            this.options = Object.assign({}, defaultOptions, options);
        }

        this.blockList = new BlockList(this);
        this.server = new DNSServer(this);
    }

    /**
     * Starts the application
     * @returns 
     */
    public async start() {
        this.logger.info("dominion is starting up...");

        await this.updateExternalLists();

        this.blockList.load();

        await this.server.listen(this.options.port);

        this.logger.info("server is listening on port %d", this.options.port);
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
        this.logger.info("updating external lists...");

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

            this.logger.info("updating list \"%s\" from \"%s\"...", fileName, source);

            await this.downloadFile(source, path.resolve(this.rootDir, "lists", fileName));
        }
    }
}