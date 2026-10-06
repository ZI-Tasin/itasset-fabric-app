'use strict';

const { Contract } = require('fabric-contract-api');

async function queryAssets(ctx, matches) {
    const allResults = [];
    for await (const { key, value } of ctx.stub.getStateByRange('', '')) {
        const strValue = Buffer.from(value).toString('utf8');
        let record;
        try {
            record = JSON.parse(strValue);
        } catch (err) {
            continue;
        }
        if (matches(record)) {
            allResults.push({ Key: key, Record: record });
        }
    }
    return JSON.stringify(allResults);
}

/** Smart contract for university IT assets. */
class ITAsset extends Contract {
    /** Add the sample assets used by the course test network. */
    async initLedger(ctx) {
        const assets = [
            { device_type: 'Laptop', brand: 'Dell', purchase_year: '2021', department: 'CSE', assigned_to: 'Dr. Rahman' },
            { device_type: 'Projector', brand: 'Epson', purchase_year: '2020', department: 'EEE', assigned_to: 'Dr. Karim' },
            { device_type: 'Monitor', brand: 'Samsung', purchase_year: '2022', department: 'CSE', assigned_to: 'Dr. Hasan' },
            { device_type: 'Laptop', brand: 'HP', purchase_year: '2019', department: 'BBA', assigned_to: 'Prof. Akter' },
            { device_type: 'Projector', brand: 'Sony', purchase_year: '2021', department: 'CSE', assigned_to: 'Dr. Islam' }
        ];

        for (let i = 0; i < assets.length; i++) {
            assets[i].docType = 'asset';
            await ctx.stub.putState('ASSET00' + i, Buffer.from(JSON.stringify(assets[i])));
            console.info('Added asset:', assets[i]);
        }
    }

    /** Create an asset after validating its ID and required fields. */
    async createAsset(ctx, assetId, device_type, brand, purchase_year, department, assigned_to) {
        if (!assetId || !assetId.trim()) {
            throw new Error('assetId is required');
        }
        const fields = { device_type, brand, purchase_year, department, assigned_to };
        for (const [name, value] of Object.entries(fields)) {
            if (typeof value !== 'string' || !value.trim()) {
                throw new Error(`${name} is required`);
            }
        }
        if (!/^\d{4}$/.test(purchase_year)) {
            throw new Error('purchase_year must be a four-digit year');
        }
        const existing = await ctx.stub.getState(assetId);
        if (existing && existing.length > 0) {
            throw new Error(`Asset ${assetId} already exists`);
        }

        const asset = { docType: 'asset', ...fields };
        await ctx.stub.putState(assetId, Buffer.from(JSON.stringify(asset)));
    }

    /** Return one asset by its ledger key. */
    async queryAsset(ctx, assetId) {
        const assetAsBytes = await ctx.stub.getState(assetId);
        if (!assetAsBytes || assetAsBytes.length === 0) {
            throw new Error(`${assetId} does not exist`);
        }
        return assetAsBytes.toString();
    }

    /** Return all assets in the ledger. */
    async queryAllAssets(ctx) {
        return queryAssets(ctx, () => true);
    }

    /** Update the assignee for an existing asset. */
    async updateAssignedTo(ctx, assetId, newAssignee) {
        if (typeof newAssignee !== 'string' || !newAssignee.trim()) {
            throw new Error('newAssignee is required');
        }
        const assetAsBytes = await ctx.stub.getState(assetId);
        if (!assetAsBytes || assetAsBytes.length === 0) {
            throw new Error(`${assetId} does not exist`);
        }
        const asset = JSON.parse(assetAsBytes.toString());
        asset.assigned_to = newAssignee.trim();
        await ctx.stub.putState(assetId, Buffer.from(JSON.stringify(asset)));
    }

    /** Return assets in the named department (case-insensitive). */
    async queryByDepartment(ctx, department) {
        return queryAssets(ctx, record => record.department && record.department.toLowerCase() === department.toLowerCase());
    }

    /** Return assets with the named device type (case-insensitive). */
    async queryByDeviceType(ctx, device_type) {
        return queryAssets(ctx, record => record.device_type && record.device_type.toLowerCase() === device_type.toLowerCase());
    }
}

module.exports = ITAsset;
