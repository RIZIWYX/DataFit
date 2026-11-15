package com.datafit.backend.securite;

import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.LongSupplier;

// Limite le nombre d'essais : sans lui, on peut tester des mots de passe en boucle sur la connexion,
// ou remplir la base de comptes et de messages. Chaque clé (« login:1.2.3.4 ») a droit à N essais
// par fenêtre de temps glissante. Les compteurs sont en mémoire : ils repartent à zéro au
// redémarrage du serveur, et chaque instance a les siens (largement suffisant ici).
@Component
public class LimiteurTentatives {

    // au-delà, on nettoie les clés dont plus aucun essai n'est récent (évite de grossir sans fin)
    private static final int CLES_MAX = 10_000;

    private final Map<String, Deque<Long>> essais = new ConcurrentHashMap<>();
    private final LongSupplier horloge;

    public LimiteurTentatives() {
        this(System::currentTimeMillis);
    }

    // l'horloge est injectable pour les tests
    LimiteurTentatives(LongSupplier horloge) {
        this.horloge = horloge;
    }

    // Compte un essai pour cette clé. Renvoie false si la limite est déjà atteinte (l'essai refusé
    // n'est pas compté : il ne prolonge pas le blocage).
    public boolean autoriser(String cle, int max, Duration fenetre) {
        long maintenant = horloge.getAsLong();
        nettoyerSiBesoin(maintenant, fenetre);
        Deque<Long> file = essais.computeIfAbsent(cle, k -> new ArrayDeque<>());
        synchronized (file) {
            retirerLesAnciens(file, maintenant, fenetre);
            if (file.size() >= max) return false;
            file.addLast(maintenant);
            return true;
        }
    }

    // Combien d'essais sont comptés pour cette clé dans la fenêtre.
    public int compter(String cle, Duration fenetre) {
        Deque<Long> file = essais.get(cle);
        if (file == null) return 0;
        synchronized (file) {
            retirerLesAnciens(file, horloge.getAsLong(), fenetre);
            return file.size();
        }
    }

    public void noter(String cle) {
        Deque<Long> file = essais.computeIfAbsent(cle, k -> new ArrayDeque<>());
        synchronized (file) {
            file.addLast(horloge.getAsLong());
        }
    }

    public void oublier(String cle) {
        essais.remove(cle);
    }

    private static void retirerLesAnciens(Deque<Long> file, long maintenant, Duration fenetre) {
        while (!file.isEmpty() && maintenant - file.peekFirst() >= fenetre.toMillis()) {
            file.removeFirst();
        }
    }

    private void nettoyerSiBesoin(long maintenant, Duration fenetre) {
        if (essais.size() < CLES_MAX) return;
        // une fenêtre plus longue que celle demandée peut exister pour d'autres clés : on garde
        // une marge (24 h) avant de supprimer une clé
        long limite = Math.max(fenetre.toMillis(), Duration.ofHours(24).toMillis());
        essais.entrySet().removeIf(e -> {
            synchronized (e.getValue()) {
                Long dernier = e.getValue().peekLast();
                return dernier == null || maintenant - dernier >= limite;
            }
        });
    }
}
