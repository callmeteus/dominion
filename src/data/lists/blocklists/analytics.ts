import { defineList, EItemCategory } from "../../../dns/blocklist/List";

export default defineList({
    blocklist: [
        {
            title: "Google Analytics",
            domains: ["google-analytics.com", "ssl.google-analytics.com"],
            category: EItemCategory.ANALYTICS
        },
        {
            title: "Hotjar",
            domains: ["hotjar.com", "static.hotjar.com", "api-hotjar.com", "hotjar-analytics.com"],
            category: EItemCategory.ANALYTICS
        },
        {
            title: "Mouseflow",
            domains: ["mouseflow.com", "a.mouseflow.com"],
            category: EItemCategory.ANALYTICS
        }
    ]
});