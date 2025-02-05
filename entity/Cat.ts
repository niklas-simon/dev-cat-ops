import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryColumn,
    UpdateDateColumn,
} from "typeorm";

@Entity()
export default class DBCat {
    @PrimaryColumn({ type: "varchar", length: 36 })
    id: string;

    @Column()
    title: string;

    @Column({ type: "text" })
    description: string;

    @Column()
    rating: number;

    @Column()
    filename: string;

    @Column()
    hash: string;

    @CreateDateColumn()
    created: Date;

    @UpdateDateColumn()
    updated: Date;

    constructor() {
        this.id = "";
        this.title = "";
        this.description = "";
        this.rating = 10;
        this.filename = "";
        this.hash = "";
        this.created = new Date();
        this.updated = new Date();
    }
}
