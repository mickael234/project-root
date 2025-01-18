const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/formation_db', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connexion à MongoDB établie avec succès');
    } catch (err) {
        console.error('Erreur de connexion à MongoDB:', err);
        process.exit(1);
    }
};

module.exports = connectDB;

