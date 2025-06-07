# Browser Pooling Service

A service that provides a pool of Playwright-compatible Chromium browsers with REST API endpoints to create, checkout, and release browser instances.

## Features

- Maintains a pool of Playwright Chromium browsers
- REST API endpoints to create/checkout browser instances
- Returns WebSocket connection strings for connecting to browser instances
- Endpoints to release/destroy browser instances when done
- Status endpoint to monitor the browser pool

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/browser-pooler.git
cd browser-pooler

# Install dependencies
npm install
```

## Usage

### Starting the Server

```bash
npm start
```

The server will start on port 3000 by default.

### API Endpoints

#### Create/Checkout a Browser Instance

```
POST /browsers
```

**Response:**

```json
{
  "id": "browser-1234567890",
  "wsEndpoint": "ws://localhost:12345/devtools/browser/1234567890"
}
```

Use the `wsEndpoint` to connect to the browser instance using Playwright or other compatible tools.

#### Get Browser Pool Status

```
GET /browsers/status
```

**Response:**

```json
{
  "status": {
    "size": 5,
    "available": 3,
    "borrowed": 2,
    "pending": 0,
    "max": 10,
    "min": 2,
    "activeBrowsers": 2
  }
}
```

#### Release a Browser Instance

```
DELETE /browsers/:id/release
```

**Response:**

```json
{
  "success": true,
  "message": "Browser browser-1234567890 released successfully"
}
```

#### Destroy a Browser Instance

```
DELETE /browsers/:id
```

**Response:**

```json
{
  "success": true,
  "message": "Browser browser-1234567890 destroyed successfully"
}
```

## Testing

To run the test script:

```bash
npm test
```

Make sure the server is running before executing the test.

## Configuration

The browser pool can be configured by modifying the options in `services/browserPoolService.js`:

```javascript
const browserPoolService = new BrowserPoolService({
  min: 2,                    // Minimum number of browsers in the pool
  max: 10,                   // Maximum number of browsers in the pool
  idleTimeoutMillis: 30000   // How long a browser can be idle before being removed
});
```

## License

MIT