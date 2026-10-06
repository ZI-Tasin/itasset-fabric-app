'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

async function main(queryData = {}) {
    let gateway;
    try {
        const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        const wallet = await Wallets.newFileSystemWallet(path.join(__dirname, 'wallet'));
        if (!await wallet.get('appUser')) {
            throw new Error('An identity for appUser does not exist in the wallet');
        }

        gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });
        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('fabcar');

        if (queryData.id) {
            return await contract.evaluateTransaction('queryAsset', queryData.id);
        }
        if (queryData.department) {
            return await contract.evaluateTransaction('queryByDepartment', queryData.department);
        }
        if (queryData.device_type) {
            return await contract.evaluateTransaction('queryByDeviceType', queryData.device_type);
        }
        return await contract.evaluateTransaction('queryAllAssets');
    } finally {
        if (gateway) {
            gateway.disconnect();
        }
    }
}

module.exports = { main };
