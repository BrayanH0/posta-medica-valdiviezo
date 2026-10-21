package com.centro_valdiviezo.backend.autenticacion;

import java.util.Map;
import java.util.Optional;

// Autentica a los usuarios de un rol. Para agregar un rol se crea una clase que implemente
// esta interfaz (con @Component y @Order); AuthController no cambia (RFC-007, OCP).
public interface AutenticadorRol {

    // Devuelve el cuerpo de la respuesta de /login si el DNI y la clave son de un usuario
    // de este rol; vacío si no lo son.
    Optional<Map<String, Object>> autenticar(String dni, String clave);
}
