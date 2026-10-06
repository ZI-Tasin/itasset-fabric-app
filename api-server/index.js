'use strict';

const express = require('express');
const cors = require('cors');
const query = require('./query');
const createAsset = require('./createAsset');
const updateAsset = require('./updateAsset');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function sendError(res, error) {
    const message = error && error.message ? error.message : 'Unexpected server error';
    const lowerMessage = message.toLowerCase();
    let status = 500;
    if (lowerMessage.includes('does not exist')) {
        status = 404;
    } else if (lowerMessage.includes('required') || lowerMessage.includes('four-digit') || lowerMessage.includes('already exists')) {
        status = 400;
    }
    console.error(error);
    return res.status(status).json({ error: message });
}

function requiredFields(body, fields) {
    return fields.find(field => typeof body[field] !== 'string' || !body[field].trim());
}

app.get('/assets', async (req, res) => {
    try {
        const raw = await query.main({ department: req.query.department, device_type: req.query.device_type });
        return res.json(JSON.parse(raw.toString()));
    } catch (error) {
        return sendError(res, error);
    }
});

app.get('/assets/:id', async (req, res) => {
    try {
        const raw = await query.main({ id: req.params.id });
        return res.json([{ Key: req.params.id, Record: JSON.parse(raw.toString()) }]);
    } catch (error) {
        return sendError(res, error);
    }
});

app.post('/assets', async (req, res) => {
    const fields = ['key', 'device_type', 'brand', 'purchase_year', 'department', 'assigned_to'];
    const missing = requiredFields(req.body || {}, fields);
    if (missing) {
        return res.status(400).json({ error: `${missing} is required` });
    }
    if (!/^\d{4}$/.test(req.body.purchase_year)) {
        return res.status(400).json({ error: 'purchase_year must be a four-digit year' });
    }
    try {
        await createAsset.main(req.body);
        return res.status(201).json({ message: 'Asset created successfully' });
    } catch (error) {
        return sendError(res, error);
    }
});

app.put('/assets/:id', async (req, res) => {
    const assignedTo = req.body && req.body.assigned_to;
    if (typeof assignedTo !== 'string' || !assignedTo.trim()) {
        return res.status(400).json({ error: 'assigned_to is required' });
    }
    try {
        await updateAsset.main(req.params.id, assignedTo.trim());
        return res.json({ message: 'Asset updated successfully' });
    } catch (error) {
        return sendError(res, error);
    }
});

app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400) {
        return res.status(400).json({ error: 'Request body must be valid JSON' });
    }
    return sendError(res, error);
});

const port = Number.parseInt(process.env.PORT, 10) || 3000;
app.listen(port, () => console.log(`IT asset API is listening on port ${port}`));
