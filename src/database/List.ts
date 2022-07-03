import { Column, DataType, Default, Model, PrimaryKey, Table } from "sequelize-typescript";
import { EItemType, EItemCategory } from "../dns/blocklist/List";

@Table({
    indexes: [
        {
            name: "unique-domain-type",
            unique: true,
            fields: ["domain", "type"]
        },
        {
            name: "common-domain-type-active",
            fields: ["domain", "type", "active"]
        }
    ]
})
export class List extends Model {
    @PrimaryKey
    @Column(DataType.INTEGER)
    declare public id: number;

    @Column(DataType.STRING)
    declare public domain: string;

    @Column(DataType.ENUM(...Object.values(EItemType)))
    declare public type: EItemType;

    @Column(DataType.ENUM(...Object.values(EItemCategory)))
    declare public category: EItemCategory;

    @Default(true)
    @Column(DataType.BOOLEAN)
    declare public active: boolean;

    /**
     * Checks if a given domain is actively blocked.
     * @param domain The domain to be checked.
     * @returns 
     */
    public static async isDomainBlocked(domain: string) {
        return (await List.count({
            where: {
                domain,
                active: true,
                type: EItemType.BLOCK
            }
        })) > 0;
    }
}