/**
 * Slices a single byte into bits, assuming only single bytes.
 * @param b The byte to be sliced.
 * @param off The offset.
 * @param len The length.
 * @returns 
 */
export function sliceBits(b: number, off: number, len: number) {
    let s = 7 - (off + len - 1);

    b = b >>> s;
    return b & ~(0xff << len);
}

export function createZeroedBuffer(len: number) {
    const buf = Buffer.alloc(len);

    for(let i = 0; i < buf.length; i++) {
        buf[i] = 0;
    }

    return buf;
}

/**
 * Takes a number and makes sure it is written to the buffer
 * as the correct length of bytes with leading 0 padding where
 * necessary.
 */
export function writeNumberToBuffer(buf: Buffer, offset: number, num: number, len: number) {
    if (typeof num !== "number") {
        throw new Error("Num must be a number");
    }

    for(let i = offset; i < offset + len; i++) {
        const shift = 8*((len - 1) - (i - offset));
        const insert = (num >> shift) & 255;
        
        buf[i] = insert;
    }
    
    return buf;
};