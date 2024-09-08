import db from '../models/index.js';
import { sendCommmand } from '../services/adms.services.js';

/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */


const { Op } = db.Sequelize;
const ADMSModels = db.models.adms;

const ADMSFingerprint = {
    /**
     * Get one fingerprint
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     */
    getOne: async (req, res) => {
        try {
            const {pin, fid} = req.params;
            const fingerprint = await ADMSModels.ADMSFingerprint.findOne({ where: {pin, fid} });
            if (fingerprint) {
                return res.status(200).send(
                    {
                        error: false,
                        message: "Fingerprint retrieved successfully",
                        data: fingerprint,
                    }
                )
            } else {
                return res.status(404).send(
                    {
                        error: true,
                        message: "Fingerprint not found",
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
     * Get all fingerprints
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     */
    getAll: async (req, res) => {
        try {
            const { pin } = req.query;
            let fingerprints;
            
            fingerprints = await ADMSModels.ADMSFingerprint.findAll({ where: pin ? { pin } : {} });
            
            return res.status(200).send({
                error: false,
                message: "Fingerprints retrieved successfully",
                data: fingerprints,
            });
        } catch (err) {
            return res.status(500).send({
                error: true,
                message: "An error occurred: " + err.toString(),
                data: null,
            });
        }
    },

    /**
     * Delete fingerprint
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     */
    delete: async (req, res) => {
        try {
            const { pin, fid } = req.params;

            const deletedFingerprint = await ADMSModels.ADMSFingerprint.destroy({ where: fid == "-1" ? { pin } : { pin, fid } });

            if (deletedFingerprint) {
                return res.status(200).send({
                    error: false,
                    message: "Fingerprint deleted successfully",
                    data: null,
                });
            } else {
                return res.status(404).send({
                    error: true,
                    message: "Fingerprint not found",
                    data: null,
                });
            }
        } catch (err) {
            return res.status(500).send({
                error: true,
                message: "An error occurred: " + err.toString(),
                data: null,
            });
        }
    },

    /**
     * Delete fingerprint
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     */
    sync: async (req, res) => {
        
        try {
            const {include, exclude, pin, fid} = req.query;
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

            const fingerprintWhere = {};
            if (pin) {
                fingerprintWhere.pin = {
                    [Op.In]: pin.split(",")
                };
            }
            if (fid) {
                fingerprintWhere.fid = {
                    [Op.In]: fid.split(",")
                };
            }

            const fingerprints = await ADMSModels.ADMSFingerprint.findAll({where: fingerprintWhere})
            const commands = fingerprints.map(v => ({
                header: [
                    "DATA",
                    "UPDATE",
                    "FINGERTMP"
                ],
                body: v.data
            }))
            const commandCalls = await sendCommmand(serialNumbers, commands, exclude, req.user.id)
            return res.status(201).send(
                {
                    error: false,
                    message: "Fingerprint sync broadcast created successfully",
                    data: {
                        count: commandCalls.length
                    },
                }
            )
        } catch (err) {
            return res.status(500).send({
                error: true,
                message: "An error occurred: " + err.toString(),
                data: null,
            });
        }
    }
}


export default ADMSFingerprint;