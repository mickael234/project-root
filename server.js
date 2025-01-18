const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const path = require('path');
const connectDB = require('./config/database');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const authMiddleware = require('./middleware/auth');

// Import models
const Participant = require('./models/participant');
const Formateur = require('./models/formateur');
const Formation = require('./models/formation');
const Domaine = require('./models/domaine');

const app = express();

const SESSION_SECRET = process.env.SESSION_SECRET || 'votre_clé_secrète';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/formation_db';

// Connect to MongoDB
connectDB().then(() => {
    // Middleware setup
    app.use(helmet());
    app.use(morgan('dev'));
    app.use(cookieParser());

    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100
    });
    app.use(limiter);

    app.use(session({
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ 
            mongoUrl: MONGODB_URI,
            ttl: 14 * 24 * 60 * 60
        }),
        cookie: { 
            maxAge: 1000 * 60 * 60 * 24,
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            sameSite: 'lax'
        }
    }));

    app.use(flash());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Setup CSRF protection after session middleware
    app.use(csrf({ cookie: true }));

    app.use((req, res, next) => {
        res.locals.csrfToken = req.csrfToken();
        res.locals.user = req.session.userId ? { id: req.session.userId, login: req.session.userLogin } : null;
        res.locals.success = req.flash('success');
        res.locals.error = req.flash('error');
        next();
    });

    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));

    app.use(express.static(path.join(__dirname, 'public')));

    // Routes setup
    const authRoutes = require('./routes/auth');
    const dashboardRoutes = require('./routes/dashboard');
    const participantsRoutes = require('./routes/participants');
    const formateursRoutes = require('./routes/formateurs');
    const formationsRoutes = require('./routes/formations');
    const domainesRoutes = require('./routes/domaines');
    const profilsRoutes = require('./routes/profils');
    const searchRoutes = require('./routes/search'); // Added route

    app.use('/auth', authRoutes);
    app.use('/dashboard', authMiddleware, dashboardRoutes);
    app.use('/participants', authMiddleware, participantsRoutes);
    app.use('/formateurs', authMiddleware, formateursRoutes);
    app.use('/formations', authMiddleware, formationsRoutes);
    app.use('/domaines', authMiddleware, domainesRoutes);
    app.use('/profils', authMiddleware, profilsRoutes);
    app.use('/search', authMiddleware, searchRoutes); // Added route

    // Admin dashboard route
    app.get('/admin-dashboard', authMiddleware, async (req, res, next) => {
        if (req.session.userRole !== 'admin') {
            return res.status(403).render('error', { message: 'Accès non autorisé' });
        }

        try {
            const [totalParticipants, totalFormateurs, activeFormations, completionRate, formations] = await Promise.all([
                Participant.countDocuments(),
                Formateur.countDocuments(),
                Formation.countDocuments({ status: 'active' }),
                Formation.aggregate([
                    { $group: { _id: null, avgCompletion: { $avg: "$tauxCompletion" } } }
                ]).then(result => Math.round(result[0]?.avgCompletion || 0)),
                Formation.find().limit(5).lean()
            ]);

            res.render('admin-dashboard', {
                title: 'Tableau de bord administrateur',
                userLogin: req.session.userLogin,
                totalParticipants,
                totalFormateurs,
                activeFormations,
                completionRate,
                formations: formations.map(f => ({
                    nom: f.nom,
                    participants: f.participants.length,
                    tauxCompletion: f.tauxCompletion,
                    tauxReussite: f.tauxReussite
                }))
            });
        } catch (error) {
            next(error);
        }
    });

    // Search route
    app.get('/search', authMiddleware, async (req, res) => {
        const searchTerm = req.query.term;
        try {
            const [participants, formateurs, formations, domaines] = await Promise.all([
                Participant.find({ 
                    $or: [
                        { nom: new RegExp(searchTerm, 'i') },
                        { prenom: new RegExp(searchTerm, 'i') },
                        { matricule: new RegExp(searchTerm, 'i') }
                    ]
                }).limit(5),
                Formateur.find({ 
                    $or: [
                        { nom: new RegExp(searchTerm, 'i') },
                        { prenom: new RegExp(searchTerm, 'i') },
                        { code_formateur: new RegExp(searchTerm, 'i') },
                        { email: new RegExp(searchTerm, 'i') }
                    ]
                }).limit(5),
                Formation.find({ 
                    $or: [
                        { titre: new RegExp(searchTerm, 'i') },
                        { description: new RegExp(searchTerm, 'i') }
                    ]
                }).limit(5),
                Domaine.find({ nom: new RegExp(searchTerm, 'i') }).limit(5)
            ]);

            res.json({ participants, formateurs, formations, domaines });
        } catch (error) {
            res.status(500).json({ error: 'Une erreur est survenue lors de la recherche' });
        }
    });

    // Calendar event routes
    app.get('/api/formateur-events', authMiddleware, async (req, res) => {
        try {
            const events = await Formation.find().populate('formateur');
            if (!events) {
                return res.status(404).json({ error: 'Aucun événement trouvé' });
            }
            const formattedEvents = events.map(event => ({
                title: `${event.titre} - ${event.formateur ? event.formateur.nom : 'Formateur non assigné'}`,
                start: event.dateDebut,
                end: event.dateFin
            }));
            res.json(formattedEvents);
        } catch (error) {
            console.error('Erreur lors de la récupération des événements formateurs:', error);
            res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des événements' });
        }
    });

    app.get('/api/participant-events', authMiddleware, async (req, res) => {
        try {
            const events = await Formation.find().populate('participants');
            if (!events) {
                return res.status(404).json({ error: 'Aucun événement trouvé' });
            }
            const formattedEvents = events.flatMap(event => 
                event.participants.map(participant => ({
                    title: `${event.titre} - ${participant ? participant.nom : 'Participant non assigné'}`,
                    start: event.dateDebut,
                    end: event.dateFin
                }))
            );
            res.json(formattedEvents);
        } catch (error) {
            console.error('Erreur lors de la récupération des événements participants:', error);
            res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des événements' });
        }
    });

    app.get('/', (req, res) => {
        res.render('index', { title: 'Accueil' });
    });

    // Error handlers
    app.use((req, res, next) => {
        res.status(404).render('error', { message: 'Page non trouvée' });
    });

    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(err.status || 500).render('error', { 
            message: 'Une erreur est survenue', 
            error: process.env.NODE_ENV === 'development' ? err : {}
        });
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));

}).catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
});