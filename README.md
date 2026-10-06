# University IT Asset Management System

A small web application for recording university IT equipment on a Hyperledger Fabric ledger. It adapts the CSE446 FabCar lab scaffold to track asset type, brand, purchase year, department, and assignee.

## Features

- Create an asset with a unique ID.
- View all assets or search by ID, department, or device type.
- Update the `assigned_to` field for an existing asset.

## Architecture

Browser UI → Express API → Fabric Gateway → ITAsset chaincode on the Fabric `test-network`.

The deployed chaincode package name remains `fabcar` to match the course network scripts and API contract lookup.

## Run locally

Place this repository at `fabric-samples/itasset-fabric-app`, beside the course's `test-network` directory. Start Docker and run the Fabric test network from the project directory:

```sh
./startFabric.sh
```

Enroll the admin identity and register the application identity:

```sh
cd api-server
npm install
node enrollAdmin.js
node registerUser.js
```

Start the API (default port `3000`; set `PORT` to use another port):

```sh
npm start
```

In a second terminal, from the project root, serve the browser UI and open <http://localhost:8080>:

```sh
python3 -m http.server 8080 --directory fabcar-client
```

To stop the network, run `./networkDown.sh` from the project root.

## API

All successful responses are JSON. Error responses use `{ "error": "..." }`.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/assets` | List assets; optional `department` or `device_type` query parameter filters the list. |
| `GET` | `/assets/:id` | Get an asset by ID. |
| `POST` | `/assets` | Create an asset. JSON body: `key`, `device_type`, `brand`, `purchase_year`, `department`, `assigned_to`. |
| `PUT` | `/assets/:id` | Change the assignee. JSON body: `assigned_to`. |

## Asset data model

The ledger key is the asset ID. The JSON record contains `docType` (`asset`), `device_type`, `brand`, `purchase_year` (a four-digit year), `department`, and `assigned_to`.

## Screenshots

TODO: Add a screenshot of the asset list.

TODO: Add a screenshot of the create and update forms.

## Credits & scope

Built on Hyperledger Fabric Samples (Apache-2.0) and the CSE446 (BRAC University) FabCar lab scaffold. `enrollAdmin.js`, `registerUser.js`, and the test-network configuration are course-provided and unchanged. The author implemented the ITAsset chaincode, API routes, and web UI.

## Known limitations

- Intended for the local Fabric `test-network` only.
- Department and device-type filters scan the whole ledger instead of using CouchDB rich queries.
- The API has no authentication.
