import "reflect-metadata";
import { DataSource } from "typeorm";

import DBCat from "./entity/Cat";

const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: true,
    logging: true,
    entities: [DBCat],
    subscribers: [],
    migrations: [],
});

export async function getDataSource() {
    if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
    }

    return AppDataSource;
}
