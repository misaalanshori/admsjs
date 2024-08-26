/**
 * @typedef {import('sequelize').Sequelize} Sequelize
 */

import Sequelize from "sequelize";

/**
 * Models for API access
 * @param {Sequelize} database - Sequelize database object
 */
const APIModels = (database) => {
    const APIUser = database.define('apiUser',
        {
            username: { 
                type: Sequelize.STRING,
                unique: true,
                allowNull: false
            },
            password_hash: { 
                type: Sequelize.STRING,
                allowNull: false
            },
            hash_valid: Sequelize.DATE,
        },
    );

    const APIMachine = database.define('apiMachine',
        {
            serial_number: { 
                type: Sequelize.STRING,
                unique: true,
                allowNull: false
            },
            timezone: {
                type: Sequelize.TINYINT,
                allowNull: false,
            },
        },
    );

    const APIAttendanceHook = database.define('apiAttendanceHook',
        {
            url: { 
                type: Sequelize.STRING,
                allowNull: false
            },
            token: Sequelize.STRING,
            last_sync: {
                type: Sequelize.DATE,
                allowNull: false,
            },
        },
    );

    APIAttendanceHook.Creator = APIAttendanceHook.belongsTo(APIUser);
    APIMachine.Creator = APIMachine.belongsTo(APIUser);

    return {APIUser, APIMachine, APIAttendanceHook};
}

export default APIModels