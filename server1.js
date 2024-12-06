// Importation des modules nécessaires
const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 3000;

// Configuration de la connexion MySQL
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "gestion_users",
});

// Connexion à la base de données
db.connect((err) => {
    if (err) throw err;
    console.log("Connecté à la base de données MySQL");
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // Pour servir les fichiers statiques (HTML, CSS, JS)

// Routes API

// Inscription
app.post("/api/register", (req, res) => {
    const { prenom, nom, username, email, password } = req.body;

    if (!prenom || !nom || !username || !email || !password) {
        return res.status(400).json({ message: "Tous les champs sont requis" });
    }

    const sql = "INSERT INTO users (prenom, nom, username, email, password) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [prenom, nom, username, email, password], (error) => {
        if (error) {
            console.error("Erreur lors de l'enregistrement :", error);
            return res.status(500).send("Erreur du serveur");
        }
        res.status(201).send("Utilisateur enregistré avec succès");
    });
});


// Connexion
app.post("/api/login", (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], (error, results) => {
        if (error) return res.status(500).json({ message: "Erreur du serveur" });

        if (results.length === 0) return res.status(401).json({ message: "Email non reconnu" });

        const user = results[0];
        if (password !== user.password) {
            return res.status(401).json({ message: "Mot de passe incorrect" });
        }

        res.status(200).json({ message: "Connexion réussie" });
    });
});

// Liste des utilisateurs
app.get("/api/users", (req, res) => {
    const sql = "SELECT prenom, nom, username, email FROM users";
    db.query(sql, (error, results) => {
        if (error) return res.status(500).json({ message: "Erreur du serveur" });
        res.status(200).json(results);
    });
});

// Suppression d'un utilisateur
app.delete("/api/users", (req, res) => {
    const { email } = req.body;

    const sql = "DELETE FROM users WHERE email = ?";
    db.query(sql, [email], (error, results) => {
        if (error) return res.status(500).json({ message: "Erreur du serveur" });

        if (results.affectedRows === 0) return res.status(404).json({ message: "Utilisateur non trouvé" });

        res.status(200).json({ message: "Utilisateur supprimé avec succès" });
    });
});

// Route principale pour afficher le fichier HTML de connexion
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "login.html")); // Servir la page de connexion
});

// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
