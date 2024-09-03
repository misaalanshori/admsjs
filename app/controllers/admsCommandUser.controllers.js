/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */
import Papa from "papaparse";
import { sendCommmand } from "../services/adms.services.js";

const ADMSCommandUserControllers = {
    /**
     * Create via CSV
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     */
    createViaCSV: async (req, res) => {
        const parsed = Papa.parse(req.body, {header: true});
        if (parsed.errors.length > 0) {
            return res.status(400).send(
                {
                    error: true,
                    message: "Error occured while parsing the CSV",
                    data: parsed.errors,
                }
            )
        }
        if (!parsed.meta.fields.includes("PIN")) {
            return res.status(400).send(
                {
                    error: true,
                    message: "The column PIN (User ID) is required",
                    data: null,
                }
            )
        }
        const commands = parsed.data.map((v,i) => (
            {
                header: [
                    "DATA",
                    "UPDATE",
                    "USERINFO"
                ],
                body: v
            }
        ))
        const commandCall = await sendCommmand(null, commands, false, req.user.id)
        res.status(200).send({
            error: false,
            message: "User Creation requested",
            data: {
                count: commandCall.length
            },
        });
    }
} 

export default ADMSCommandUserControllers