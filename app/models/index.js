import { Sequelize } from "sequelize";
import ADMSModels from "./adms.models.js";
import APIModels from "./api.models.js";

const database = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD, 
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        operatorAlias: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        logging: +process.env.DEBUG_MODE ? console.log : false
    }
);

const models = {
    adms: ADMSModels(database),
    api: APIModels(database),
}

const db = {
    Sequelize,
    database,
    models,
}

export default db;