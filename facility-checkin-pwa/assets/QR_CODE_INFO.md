# Sample QR Code for Testing

For testing the check-in functionality, you'll need a QR code that contains a facility ID.

## Facility ID for Testing

Use this facility ID: **facility-001**

This corresponds to "City Fitness Central" in the facilities.json file.

## Generating a QR Code

You can generate a test QR code using any of these methods:

### Option 1: Online QR Code Generator
1. Visit https://www.qr-code-generator.com/ or similar
2. Enter the text: `facility-001`
3. Download the image as `sample-qr-code.png`
4. Place it in this assets folder

### Option 2: Command Line (requires qrencode)
```bash
# Install qrencode (macOS)
brew install qrencode

# Generate QR code
qrencode -o sample-qr-code.png "facility-001"
```

### Option 3: Node.js Script
```bash
npm install qrcode
node -e "const QRCode = require('qrcode'); QRCode.toFile('sample-qr-code.png', 'facility-001');"
```

## QR Code Content Format

The QR code should contain just the facility ID as plain text: `facility-001`

Candidates can choose to support more complex formats if they wish, such as:
- JSON: `{"facilityId": "facility-001", "type": "checkin"}`
- URL: `https://app.example.com/checkin?facility=facility-001`

## Other Test Facility IDs

Feel free to generate QR codes for any facility ID from the facilities.json file:
- facility-001 to facility-100
