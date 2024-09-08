/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

import db from '../models/index.js';

const APIModels = db.models.api;

const APIMachinesController = {
    /**
     * Get all controller
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     */
    getAll: async (req, res) => {
        try {
            const machines = await APIModels.APIMachine.findAll();
            return res.status(200).send(
                {
                    error: false,
                    message: "Machines retrieved successfully",
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
            const machine = await APIModels.APIMachine.findOne({ where: {id} });
            if (machine) {
                return res.status(200).send(
                    {
                        error: false,
                        message: "Machine retrieved successfully",
                        data: machine,
                    }
                )
            } else {
                return res.status(404).send(
                    {
                        error: true,
                        message: "Machine not found",
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
     * Create controller
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     */
    create: async (req, res) => {
        try {
            const machines = [].concat(req.body).map(v => ({
                serial_number: v.serial_number,
                timezone: v.timezone,
                apiUserId: req.user.id
            }))
            const machine = await APIModels.APIMachine.bulkCreate(machines);
            return res.status(201).send(
                {
                    error: false,
                    message: "Machines created successfully",
                    data: machine,
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
     * Update controller
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     */
    update: async (req, res) => {
        try {
            const {id} = req.params;
            const {serial_number, timezone} = req.body;
            const machine = await APIModels.APIMachine.findOne({ where: {id} });
            if (machine) {
                machine.serial_number = serial_number;
                machine.timezone = timezone;
                await machine.save()
                return res.status(200).send(
                    {
                        error: false,
                        message: "Machine updated successfully",
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
                await machine.destroy();
                return res.status(200).send(
                    {
                        error: false,
                        message: "Machine deleted successfully",
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

export default APIMachinesController;