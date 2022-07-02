export interface IQueryRequest {
    header: {
        id?: Buffer;
        qr?: number;
        opcode?: number;

        /**
         * Authorative answer.
         */
        aa?: number;

        /**
         * If it's truncated.
         */
        tc?: number;

        /**
         * Recursion desired.
         */
        rd?: number;

        /**
         * Recursion available.
         */
        ra?: number;

        /**
         * Reserved 3 bits
         */
        z?: number;

        rcode?: number;

        qdcount?: number;

        ancount?: number;

        nscount?: number;

        arcount?: number;
    },
    question: {
        id?: number;
        qname?: Buffer;
        qtype?: number;
        qclass?: number;
    },
    rr?: any
}