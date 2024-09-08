import db from '../models/index.js';

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */


const { Op } = db.Sequelize;
const ADMSModels = db.models.adms;

const ADMSLogsController = {
    /**
     * Get all logs
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     */
    getAll: async (req, res) => {
        try {
            const { after, before, serial_number } = req.query;
            const whereCondition = {};
            if (after) {
                whereCondition.createdAt = { [Op.gte]: new Date(after) };
            }
            if (before) {
                whereCondition.createdAt = { ...whereCondition.createdAt, [Op.lte]: new Date(before) };
            }
            if (serial_number) {
                whereCondition.serial_number = serial_number;
            }
            const logs = await ADMSModels.ADMSLogs.findAll({ where: whereCondition });
            res.status(200).json({ error: false, message: "Logs retrieved successfully", data: logs });
        } catch (error) {
            return res.status(500).send(
                {
                    error: true,
                    message: "An error occured: " + error.toString(),
                    data: null,
                }
            );
        }
    },

    getOne: async (req, res) => {
        try {
            const logId = req.params.id;
            const log = await ADMSModels.ADMSLogs.findByPk(logId);
            if (log) {
                res.status(200).json({ error: false, message: "Log retrieved successfully", data: log });
            } else {
                res.status(404).json({ error: true, message: "Log not found", data: null });
            }
        } catch (error) {
            return res.status(500).send(
                {
                    error: true,
                    message: "An error occured: " + error.toString(),
                    data: null,
                }
            );
        }
    },

    delete: async (req, res) => {
        try {
            const logId = req.params.id;
            const deletedLog = await ADMSModels.ADMSLogs.destroy({ where: { id: logId } });
            if (deletedLog) {
                res.status(200).json({ error: false, message: "Log deleted successfully", data: null });
            } else {
                res.status(404).json({ error: true, message: "Log not found", data: null });
            }
        } catch (error) {
            return res.status(500).send(
                {
                    error: true,
                    message: "An error occured: " + error.toString(),
                    data: null,
                }
            );
        }
    },

    bulkDelete: async (req, res) => {
        try {
            const { after, before, serial_number } = req.query;
            const whereCondition = {};
            if (after) {
                whereCondition.createdAt = { [Op.gte]: new Date(after) };
            }
            if (before) {
                whereCondition.createdAt = { ...whereCondition.createdAt, [Op.lte]: new Date(before) };
            }
            if (serial_number) {
                whereCondition.serial_number = serial_number;
            }
            const deletedLogs = await ADMSModels.ADMSLogs.destroy({ where: whereCondition });
            res.status(200).json({ error: false, message: "Logs deleted successfully", data: { count: deletedLogs } });
        } catch (error) {
            return res.status(500).send(
                {
                    error: true,
                    message: "An error occured: " + error.toString(),
                    data: null,
                }
            );
        }
    }
};

export default ADMSLogsController;