-- Abonnement premium (page Premium). Une ligne par compte abonné : pas de ligne = formule gratuite.
-- La table est tenue à jour par le webhook Stripe (paiement confirmé, renouvellement, résiliation) :
-- le navigateur ne peut jamais s'activer un abonnement lui-même.
CREATE TABLE IF NOT EXISTS abonnement (
    utilisateur_id         INT          PRIMARY KEY REFERENCES utilisateur(id) ON DELETE CASCADE,
    formule                VARCHAR(20)  NOT NULL DEFAULT 'premium' CHECK (formule IN ('premium')),
    periodicite            VARCHAR(10)  NOT NULL CHECK (periodicite IN ('mensuel', 'annuel')),
    debut                  TIMESTAMP    NOT NULL DEFAULT now(),
    renouvellement         TIMESTAMP    NOT NULL, -- fin de la période payée
    resilie                BOOLEAN      NOT NULL DEFAULT false, -- vrai : accès jusqu'au renouvellement, puis fin
    stripe_customer_id     VARCHAR(255),          -- client Stripe (cus_...)
    stripe_subscription_id VARCHAR(255) UNIQUE    -- abonnement Stripe (sub_...)
);
-- bases créées avant le paiement Stripe
ALTER TABLE abonnement ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);
ALTER TABLE abonnement ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255) UNIQUE;
