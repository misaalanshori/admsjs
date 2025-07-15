/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from '../models/index.js';
import { authenticateToken } from "../middlewares/authenticatedRoute.middlewares.js";

const APIModels = db.models.api;

const APIAuthControllers = {
    /**
     * Login controller [GET /login]
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     */
    login: async (req, res) => {
        try {
            const { username, password } = req.body;
            const user = await APIModels.APIUser.findOne({ where: { username } });
            if (!user || !await bcrypt.compare(password, user.password_hash)) {
                return res.status(401).send(
                    {
                        error: true,
                        message: "Invalid username or password",
                        data: null
                    }
                );
            }
            const token = jwt.sign({ id: user.id, dateSigned: new Date() }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY });
            res.send(
                {
                    error: false,
                    message: "Logged in successfully",
                    data: {
                        token,
                    }
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
     * Register controller [GET /register], auth not required for first user
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     */
    register: async (req, res) => {
        const userCount = await APIModels.APIUser.count();
        if (userCount > 0) {
            const authHeader = req.headers['authorization'];
            if (!authHeader) return res.status(403).send({
                error: true,
                message: 'No token provided',
                data: null
            });

            const token = authHeader.split(' ')[1];
            if (!token) return res.status(403).send({
                error: true,
                message: 'No token provided',
                data: null
            });

            const user = await authenticateToken(token);
            if (!user) return res.status(500).send({
                error: true,
                message: 'Failed to authenticate token',
                data: null
            });
        }
        
        try {
            const { username, password } = req.body;
            const hashedPassword = await bcrypt.hash(password, 8);
            const user = await APIModels.APIUser.create({ username, password_hash: hashedPassword, hash_valid: new Date() });
            res.status(201).send({
                error: false,
                message: "User registered successfully",
                data: {
                    ...user.dataValues,
                    password_hash: null
                }
            });
        } catch (error) {
            res.status(400).send({
                error: true,
                message: "Username already exists",
                data: null
            });
        }
    },

    /**
     * Get User controller [GET /user]
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     */
    getUser: async (req, res) => {
        try {
            res.status(200).send({
                error: false,
                message: "User retrieved successfully",
                data: {
                    ...req.user.dataValues,
                    password_hash: null
                }
            });
        } catch {
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
     * Update User controller [PUT /user]
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     */
    updateUser: async (req, res) => {
        try {
            const { username, password } = req.body;
            if (username) {
                req.user.username = username;
            }
            if (password) {
                req.user.password_hash = await bcrypt.hash(password, 8);
            }
            res.status(200).send({
                error: false,
                message: "User updated successfully",
                data: {
                    ...req.user.dataValues,
                    password_hash: null
                }
            });
        } catch {
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
     * Logout controller [GET /logout]
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     */
    logout: async (req, res) => {
        try {
            req.user.hash_valid = new Date();
            req.user.save();
            res.status(200).send({
                error: false,
                message: "User logged out successfully",
                data: null
            });
        } catch (err) {
            res.status(500).send({
                error: true,
                message: `Something went wrong while logging out (${err.toString()}) ${req.user}`,
                data: null
            })
        }
    }
}

export default APIAuthControllers;
