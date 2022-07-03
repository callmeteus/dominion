import * as path from "path";
import * as winston from "winston";

import { Sequelize } from "sequelize-typescript";

import { BlocklistUpdater } from "./BlocklistUpdater";
import { DNSServer } from "./Server";
import { List } from "./database/List";
import { Dashboard } from "./dashboard/Dashboard";

interface IOptions {
    port: number;
    dashboardPort?: number;
    dns: {
        resolvers: string[]
    }
}

const defaultOptions: IOptions = {
    port: 53,
    dashboardPort: 18000,
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
                winston.format.simple(),
                winston.format.printf(({ level, message, label, timestamp }) => {
                    return `[${timestamp}] ${label} ${level}: ${message}`;
                })
            )
        })
    });

    public database: Sequelize;

    constructor(
        public options?: IOptions
    ) {
        if (!options) {
            this.options = defaultOptions;
        } else {
            this.options = Object.assign({}, defaultOptions, options);
        }

        this.server = new DNSServer(this);
    }

    /**
     * Starts the application
     * @returns 
     */
    public async start() {
        this.logger.info("dominion is starting up...");

        await this.initDatabase();
        await this.server.listen(this.options.port);

        this.logger.info("server is listening on port %d", this.options.port);

        // Initialize the dashboard
        Dashboard(this);

        // Update the blocklist
        new BlocklistUpdater(this).load();
    }

    /**
     * Initializes the database
     */
    public async initDatabase() {
        this.logger.info("starting up the database...");

        this.database = new Sequelize({
            dialect: "sqlite",
            storage: path.resolve(this.rootDir, "data", "database.data"),
            logging: false,
            models: [
                List
            ]
        });

        this.logger.info("upgrading the database...");

        try {
            await this.database.sync({
                alter: this.isDebug,
                logging: (log) => this.logger.debug(log)
            });
        } catch(e) {
            this.logger.error("an exception ocurred while upgrading the database:\n%O", e);
        }

        this.logger.info("database has been started");
    }
}