-- Abonnement premium (page Premium). Une ligne par compte abonné : pas de ligne = formule gratuite.
-- Démonstration : aucun paiement réel. Plus tard, cette table sera mise à jour par le webhook
-- du prestataire de paiement (Stripe), qui confirme chaque paiement et chaque résiliation.
CREATE TABLE IF NOT EXISTS abonnement (
    utilisateur_id INT         PRIMARY KEY REFERENCES utilisateur(id) ON DELETE CASCADE,
    formule        VARCHAR(20) NOT NULL DEFAULT 'premium' CHECK (formule IN ('premium')),
    periodicite    VARCHAR(10) NOT NULL CHECK (periodicite IN ('mensuel', 'annuel')),
    debut          TIMESTAMP   NOT NULL DEFAULT now(),
    renouvellement TIMESTAMP   NOT NULL, -- fin de la période payée
    resilie        BOOLEAN     NOT NULL DEFAULT false -- vrai : accès jusqu'au renouvellement, puis fin
);
