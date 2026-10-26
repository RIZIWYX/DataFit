
CREATE TABLE sommeil (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    utilisateur_id BIGINT NOT NULL,
    date DATE NOT NULL,
    duree DECIMAL(5, 2) NOT NULL,
    qualite ENUM('Mauvaise', 'Moyenne', 'Bonne') NOT NULL,
    FOREIGN KEY (utilisateur_id) REFERENCES utilisateur(id)
);