import * as dgram from "dgram";

export class DNSclient {
    constructor(
        protected options: {
            servers: string[]
        }
    ) {
        
    }

    /**
     * Sends a DNS request and waits for the response.
     * @param requestBuf The request.
     * @returns 
     */
    public sendAndWaitForResponse(requestBuf: Buffer) {
        return new Promise<Buffer>((resolve, reject) => {
            const socket = dgram.createSocket("udp4");

            socket.on("message", (message) => {
                resolve(message);
            });

            socket.send(requestBuf, 53, this.options.servers[0], (err) => {
                if (err) {
                    return reject(err);
                }
            });
        });
    }
}