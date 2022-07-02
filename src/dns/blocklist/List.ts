export enum EItemCategory {
    ADS = "ADS",
    ANALYTICS = "ANALYTICS",
    ERRORTRACKER = "ERRORTRACKER",
    SOCIALTRACKER = "SOCIALTRACKER",
    MIXED = "MIXED",
    OEM = "OEM"
}

export interface IListItem {
    title?: string;
    domains: string | string[];
    category: EItemCategory
}

export interface IList {
    blocklist?: IListItem[];
    whitelist?: IListItem[];
}

export class List {
    constructor(
        protected list: IList
    ) {
        this.init();
    }

    public init() {
        if (this.hasBlocklist()) {
            this.list.blocklist?.map((list) => this.parseDomainList(list));
        }

        if (this.hasWhitelist()) {
            this.list.whitelist?.map((list) => this.parseDomainList(list));
        }
    }

    private parseDomainList(list: IListItem) {
        if (!Array.isArray(list.domains)) {
            list.domains = list.domains.split(",");
        }

        return list;
    }

    /**
     * If this list has a white list.
     * @returns 
     */
    public hasWhitelist() {
        return "whitelist" in this.list;
    }

    /**
     * If this list has a block list.
     * @returns 
     */
    public hasBlocklist() {
        return "blockList" in this.list;
    }

    /**
     * Retrieves a list of blocked domains.
     * @returns 
     */
    public getBlockedDomains() {
        return this.list.blocklist
        .map((list) => list.domains)
        .flat();
    }

    /**
     * Retrieves a list of whitelisted domains.
     * @returns 
     */
    public getWhitelistedDomains() {
        return this.list.whitelist
        .map((list) => list.domains)
        .flat();
    }

    public getBlocklist() {
        return this.list.blocklist;
    }

    public getWhitelist() {
        return this.list.whitelist;
    }
}

export function defineList(list: IList) {
    return new List(list);
}