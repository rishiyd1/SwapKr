const { sequelize, User, Item } = require('./models');

async function test() {
    try {
        console.log('Authenticating...');
        await sequelize.authenticate();
        console.log('Connection OK.');
        
        console.log('Syncing...');
        await sequelize.sync({ force: false }); // Just try to sync
        console.log('Sync OK.');
        
        const user = User.build({
            email: 'test@nitj.ac.in',
            name: 'Test',
            phoneNumber: '1234567890'
        });
        console.log('User build OK.');
        
        const item = Item.build({
            title: 'Test Item',
            description: 'Test Desc',
            price: 100,
            type: 'Sell',
            status: 'Available'
        });
        console.log('Item build OK.');

        // Test associations
        if (Item.associations.seller) {
            console.log('Item -> Seller association OK.');
        } else {
            console.error('Item -> Seller association MISSING.');
        }
        
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

test();
