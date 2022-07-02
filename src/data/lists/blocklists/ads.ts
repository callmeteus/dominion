import { defineList, EItemCategory } from "../../../dns/blocklist/List";

export default defineList({
    blocklist: [
        {
            title: "Google Ads",
            domains: [
                "pagead2.googlesyndication.com",
                "ads.google.com",
                "adservice.google.com",
                "pagead2.googleadservices.com"
            ],
            category: EItemCategory.ADS
        },
        {
            title: "Media.net",
            domains: [
                "static.media.net",
                "media.net",
                "adservetx.media.net"
            ],
            category: EItemCategory.ADS
        },
        {
            title: "Doubleclick.net",
            domains: [
                "doubleclick.net",
                "ad.doubleclick.net",
                "static.doubleclick.net",
                "m.doubleclick.net",
                "mediavisor.doubleclick.net"
            ],
            category: EItemCategory.ADS
        },
        {
            title: "FastClick",
            domains: [
                "fastclick.com",
                "fastclick.net",
                "media.fastclick.net",
                "cdn.fastclick.net"
            ],
            category: EItemCategory.ADS
        },
        {
            title: "Amazon",
            domains: [
                "adtago.s3.amazonaws.com",
                "analyticsengine.s2.amazonaws.com",
                "advice-ads.s3.amazonaws.com",
                "affiliationjs.s3.amazonaws.com",
                "advertising-api-eu.amazon.com",
                "amazonaax.com",
                "amazonclick.com",
                "assoc-amazon.com"
            ],
            category: EItemCategory.ADS
        },
        {
            title: "YouTube",
            domains: [
                "ads.youtube.com"
            ],
            category: EItemCategory.ADS
        },
        {
            title: "TikTok",
            domains: [
                "ads.tiktok.com"
            ],
            category: EItemCategory.ADS
        }
    ]
});