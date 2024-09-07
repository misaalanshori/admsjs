/**
 * @typedef {import('sequelize').Sequelize} Sequelize
 */

import Sequelize from "sequelize";

/**
     * Models for ADMS database tables
     * @param {Sequelize} database - Sequelize database object
     */
const ADMSModels = (database) => {
    const ADMSMachine = database.define('admsMachine',
        {
            serial_number: { 
                type: Sequelize.STRING,
                allowNull: false
            },
            last_seen: Sequelize.DATE
        },
    );

    const ADMSAttendance = database.define('admsAttendance',
        {
            pin: { 
                type: Sequelize.STRING,
                allowNull: false
            },
            date: { 
                type: Sequelize.DATE,
                allowNull: false
            },
            status: Sequelize.STRING,
            raw: Sequelize.TEXT('long'),
            serial_number: { 
                type: Sequelize.STRING,
                allowNull: false
            },
        }
    );
    
    const ADMSCommandBuffer = database.define('admsCommandBuffer',
        {
            serial_number: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            command: {
                type: Sequelize.JSON,
                allowNull: false,
            },
            status: {
                type: Sequelize.ENUM("SUBMITTED", "EXECUTING", "SUCCESS", "FAILURE"),
                allowNull: false,
            },
            execution_time: Sequelize.DATE,
            result_time: Sequelize.DATE,
            results: Sequelize.JSON,     
        }
    );
    return {
        ADMSMachine,
        ADMSAttendance,
        ADMSCommandBuffer
    };
}

export default ADMSModels;