package com.datafit.backend.contact;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

// Le formulaire de contact : le message est enregistré en base, l'équipe le lit ensuite
@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private final MessageContactRepository messageContactRepository;

    public ContactController(MessageContactRepository messageContactRepository) {
        this.messageContactRepository = messageContactRepository;
    }

    @PostMapping
    public ResponseEntity<?> envoyer(@Valid @RequestBody ContactRequest request) {
        MessageContact enregistre = messageContactRepository.save(new MessageContact(
            request.nom().trim(),
            request.email().trim(),
            request.sujet(),
            request.message().trim()
        ));

        return ResponseEntity.status(HttpStatus.CREATED).body(
            Map.of("message", "Message envoyé", "id", enregistre.getId())
        );
    }
}
