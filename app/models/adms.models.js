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
            serial_number: Sequelize.STRING,
            last_seen: Sequelize.DATE
        },
    );
    
    const ADMSUser = database.define('admsUser',
        {
            pin: Sequelize.INTEGER,
            name: Sequelize.STRING,
            primary: Sequelize.STRING,
            password: Sequelize.STRING,
            card: Sequelize.STRING,
            group: Sequelize.STRING,
            timezone: Sequelize.STRING,
            verify: Sequelize.STRING,
            vice_card: Sequelize.STRING,
        },
    );
    
    const ADMSFingerprint = database.define('admsFingerprint',
        {
            pin: Sequelize.INTEGER,
            fid: Sequelize.TINYINT,
            size: Sequelize.INTEGER,
            valid: Sequelize.STRING,
            template: Sequelize.TEXT('long'),
        },
    );
    
    const ADMSAttendance = database.define('admsAttendance',
        {
            pin: Sequelize.INTEGER,
            date: Sequelize.DATE,
            status: Sequelize.STRING,
            verify: Sequelize.STRING,
            work_code: Sequelize.STRING,
            reserved_1: Sequelize.STRING,
            reserved_2: Sequelize.STRING,
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
    
    ADMSUser.SourceMachine = ADMSUser.belongsTo(ADMSMachine);
    ADMSFingerprint.SourceMachine = ADMSFingerprint.belongsTo(ADMSMachine);
    ADMSAttendance.SourceMachine = ADMSAttendance.belongsTo(ADMSMachine);
    return {
        ADMSMachine,
        ADMSUser,
        ADMSFingerprint,
        ADMSAttendance,
        ADMSCommandBuffer
    };
}

export default ADMSModels;