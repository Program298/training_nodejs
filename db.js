const mogoose = require('mongoose');

main().catch(err => console.log(err));

async function main() {
    await mogoose.connect(process.env.DB_host);
    console.log('Connected to MongoDB');
}