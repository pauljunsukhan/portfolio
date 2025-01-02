const fs = require('fs');
const path = require('path');

// Read the original config
const configPath = path.join(__dirname, '../config/socials.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// Process each social entry
Object.entries(config).forEach(([key, social]) => {
    if (social.type === 'dialog' && social.encrypt) {
        // Base64 encode the value
        social.value = Buffer.from(social.value).toString('base64');
    }
});

// Write the processed config
fs.writeFileSync(configPath, JSON.stringify(config, null, 4)); 