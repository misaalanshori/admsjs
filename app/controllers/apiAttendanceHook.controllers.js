/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

import db from '../models/index.js';

const APIModels = db.models.api;

const APIAttendanceHookController = {
    /**
     * Get all controller
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     */
    getAll: async (req, res) => {
        try {
            const attendanceHooks = await APIModels.APIAttendanceHook.findAll();
            return res.status(200).send(
                {
                    error: false,
                    message: "Attendance Hooks retrieved successfully",
                    data: attendanceHooks,
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
            const attendanceHook = await APIModels.APIAttendanceHook.findOne({ where: {id} });
            if (attendanceHook) {
                return res.status(200).send(
                    {
                        error: false,
                        message: "Attendance Hook retrieved successfully",
                        data: attendanceHook,
                    }
                )
            } else {
                return res.status(404).send(
                    {
                        error: true,
                        message: "Attendance Hook not found",
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
            const hooks = [].concat(req.body).map(v => ({
                url: v.url,
                token: v.token,
                last_sync: new Date(),
                apiUserId: req.user.id
            }))
            const attendanceHook = await APIModels.APIAttendanceHook.bulkCreate(hooks);
            return res.status(201).send(
                {
                    error: false,
                    message: "Attendance Hooks created successfully",
                    data: attendanceHook,
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
            const {url, token} = req.body;
            const attendanceHook = await APIModels.APIAttendanceHook.findOne({ where: {id} });
            if (attendanceHook) {
                attendanceHook.url = url;
                attendanceHook.token = token;
                await attendanceHook.save()
                return res.status(200).send(
                    {
                        error: false,
                        message: "Attendance Hook updated successfully",
                        data: attendanceHook,
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
            const attendanceHook = await APIModels.APIAttendanceHook.findOne({ where: {id} });
            if (attendanceHook) {
                await attendanceHook.destroy();
                return res.status(200).send(
                    {
                        error: false,
                        message: "Attendance Hook deleted successfully",
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

export default APIAttendanceHookController;