/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

import db from '../models/index.js';
import { sendCommmand } from '../services/adms.services.js';

const { Op } = db.Sequelize;
const ADMSModels = db.models.adms;


const ADMSCommandBufferController = {
    /**
     * Get all controller
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     */
    getAll: async (req, res) => {
        try {
            const { serial_number, status } = req.query;
            const where = {};

            if (serial_number) {
                where.serial_number = serial_number;
            }

            if (status) {
                where.status = status;
            }

            const machines = await ADMSModels.ADMSCommandBuffer.findAll({ where: where });
            return res.status(200).send(
                {
                    error: false,
                    message: "Command calls retrieved successfully",
                    data: machines,
                }
            )
        } catch (err) {
            return res.status(500).send(
                {
                    error: true,
                    message: "An error occured: " + err.toString(),
                    data: null,
                }
            );
        }
    },
    
    /**
     * Get one controller
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     */
    getOne: async (req, res) => {
        try {
            const {id} = req.params;
            const machine = await ADMSModels.ADMSCommandBuffer.findOne({ where: {id} });
            if (machine) {
                return res.status(200).send(
                    {
                        error: false,
                        message: "Command call retrieved successfully",
                        data: machine,
                    }
                )
            } else {
                return res.status(404).send(
                    {
                        error: true,
                        message: "Commmand call not found",
                        data: null,
                    }
                )
            }
            
        } catch (err) {
            return res.status(500).send(
                {
                    error: true,
                    message: "An error occured: " + err.toString(),
                    data: null,
                }
            );
        }
    },

    /**
     * Create Broadcast controller
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     */
    create: async (req, res) => {
        try {
            const {include, exclude} = req.query;
            const commands = [].concat(req.body)

            if (include && exclude) {
                return res.status(400).send(
                    {
                        error: true,
                        message: "Include and exclude cannot be used together",
                        data: null,
                    }
                )
            }

            let serialNumbers = null;
            if (include || exclude) {
                serialNumbers = []
                include && serialNumbers.push(include.split(","))
                exclude && serialNumbers.push(exclude.split(","))
            }
            try {
                const commandCalls = await sendCommmand(serialNumbers, commands, exclude, req.user.id)
                return res.status(201).send(
                    {
                        error: false,
                        message: "Commmand call broadcast created successfully",
                        data: commandCalls,
                    }
                )
            } catch (err) {
                return res.status(400).send(
                    {
                        error: false,
                        message: err,
                        data: null,
                    }
                )
            }
            
        } catch (err) {
            return res.status(500).send(
                {
                    error: true,
                    message: "An error occured: " + err.toString(),
                    data: null,
                }
            );
        }
    },

    
    /**
     * Update controller
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     */
    update: async (req, res) => {
        try {
            const {id} = req.params;
            const {commmand} = req.body;
            const machine = await APIModels.APIMachine.findOne({ where: {id} });
            if (machine) {
                if (machine.status != "SUBMITTED") {
                    return res.status(400).send(
                        {
                            error: true,
                            message: `Command call has been processed (Status: ${machine.status})`,
                            data: machine,
                        }
                    )
                }
                machine.commmand = commmand;
                await machine.save()
                return res.status(200).send(
                    {
                        error: false,
                        message: "Command call updated successfully",
                        data: machine,
                    }
                )
            } else {
                return res.status(404).send(
                    {
                        error: true,
                        message: "Data not found",
                        data: null,
                    }
                )
            }
            
        } catch (err) {
            return res.status(500).send(
                {
                    error: true,
                    message: "An error occured: " + err.toString(),
                    data: null,
                }
            );
        }
    },

    
    /**
     * Delete controller
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     */
    delete: async (req, res) => {
        try {
            const {id} = req.params;
            const machine = await APIModels.APIMachine.findOne({ where: {id} });
            if (machine) {
                if (machine.status == "EXECUTING") {
                    return res.status(400).send(
                        {
                            error: true,
                            message: "Cannot delete a call that is being executed!",
                            data: machine,
                        }
                    )
                }
                await machine.destroy();
                return res.status(200).send(
                    {
                        error: false,
                        message: "Command call deleted successfully",
                        data: id,
                    }
                )
            } else {
                return res.status(404).send(
                    {
                        error: true,
                        message: "Data not found",
                        data: null,
                    }
                )
            }
            
        } catch (err) {
            return res.status(500).send(
                {
                    error: true,
                    message: "An error occured: " + err.toString(),
                    data: null
                }
            );
        }
    },
    
}

export default ADMSCommandBufferController;