import { createSocket, RemoteInfo } from "dgram";
import { createZeroedBuffer } from "./server/Utils";
import { BlockList } from "./BlockList";
import { DNSclient } from "./dns/DNSClient";
import * as winston from "winston";
import { Dominion as Dominion } from "./App";

export const QueryTypes = {
    1: "A",
    2: "NS",
    3: "MD",
    4: "MF",
    5: "CNAME",
    6: "SOA",
    7: "MB",
    8: "MG",
    9: "MR",
    10: "NULL",
    11: "WKS",
    12: "PTR",
    13: "HINFO",
    14: "MINFO",
    15: "MX",
    16: "TXT",
    255: "*"
} as const;

export class DNSServer {
    /**
     * The UDP socket.
     */
    private server = createSocket("udp4");

    /**
     * The DNS client that will respond to the requests.
     */
    public dnsClient: DNSclient;

    public logger = winston.createLogger({
        level: this.app.isDebug ? "debug" : "info",
        transports: new winston.transports.Console({
            format: winston.format.combine(
                winston.format.label({ label: "server" }),
                winston.format.colorize(),
                winston.format.timestamp(),
                winston.format.splat(),
                winston.format.simple()
            )
        })
    });

    constructor(
        protected app: Dominion
    ) {
        this.logger.info("server is initializing...");

        this.dnsClient = new DNSclient({
            servers: app.options.dns.resolvers
        });

        // Create an event listener for all received messages
        this.server.on("message", this.onMessage.bind(this));
    }

    /**
     * Binds the server to a given port.
     * @param port The port where the server will be listening.
     * @returns 
     */
    public listen(port: number) {
        return new Promise<void>((resolve, reject) => {
            this.server.once("error", reject);

            this.server.bind(port, "0.0.0.0", () => {
                this.server.removeListener("error", reject);
                resolve();
            });
        });
    }

    /**
     * Called when an UDP packet message is received.
     * @param message The message data.
     * @param rInfo The message remote information.
     * @returns 
     */
    public async onMessage(message: Buffer, rInfo: RemoteInfo) {
        // Split up the message into the dns request header info and the query
        const q = await this.processRequest(message);

        if (q === null) {
            return null;
        }

        this.server.send(
            q,
            0,
            q.length,
            rInfo.port,
            rInfo.address
        );
    }

    /**
     * Processes a request buffer.
     * @see https://www.freesoft.org/CIE/RFC//1035/40.htm
     * @see https://www.freesoft.org/CIE/RFC//1035/41.htm
     * @see https://www.freesoft.org/CIE/RFC//1035/42.htm
     * @param req The request buffer.
     * @returns 
     */
    private processRequest(req: Buffer) {
        const domainBuff = req.slice(12, req.length - 4);
        const domainName = this.queryNameToDomain(domainBuff);

        this.logger.debug("received request to domain %s", domainName);

        if (this.app.blockList.contains(domainName)) {
            this.logger.info("blocking domain %s", domainName);
            return this.makeRefusedResponse(req);
        }

        return this.dnsClient.sendAndWaitForResponse(req);
    }

    /**
     * Makes a REFUSED response from a original request.
     * @param buff The original request buffer.
     * @returns 
     */
    private makeRefusedResponse(buff: Buffer) {
        let final = createZeroedBuffer(buff.length);
        buff.copy(final, 0, 0, buff.length);

        final[3] = 0x00 | buff[3] << 7 | buff[3] << 4 | 5

        return final;
    }

    /**
     * Converts a query name buffer into a domain name.
     * @param qname The query name to be converted.
     * @returns 
     */
    private queryNameToDomain(qname: Buffer) {
        let domain = "";

        for(let i = 0; i < qname.length; i++) {
            if (qname[i] == 0) {
                // last char chop trailing .
                domain = domain.substring(0, domain.length - 1);
                break;
            }
            
            let tmpBuf = qname.slice(i + 1, i + qname[i] + 1);
            domain += tmpBuf.toString("binary", 0, tmpBuf.length);
            domain += ".";
            
            i = i + qname[i];
        }
        
        return domain;
    }
}