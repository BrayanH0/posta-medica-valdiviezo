package com.centro_valdiviezo.backend.config;

import java.util.List;
import java.util.function.BiConsumer;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.SmartInitializingSingleton;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.centro_valdiviezo.backend.repository.MedicoRepository;
import com.centro_valdiviezo.backend.repository.PacienteRepository;
import com.centro_valdiviezo.backend.repository.UsuarioRepository;

// RFC-010: al arrancar, convierte a BCrypt las claves que todavía están en texto plano en las
// tablas Paciente, medico y Administrador. Es idempotente: una clave que ya es un hash BCrypt no
// se toca, así que desde el segundo arranque no cambia nada. El log solo dice cuántas filas
// cambió por tabla; nunca muestra una clave.
// Es SmartInitializingSingleton (y no ApplicationRunner) para que corra cuando ya están listos los
// repositorios pero ANTES de que el servidor web acepte peticiones: así ningún login llega a
// comparar contra una clave todavía sin migrar.
@Component
public class MigracionClaves implements SmartInitializingSingleton {

    private static final Logger log = LoggerFactory.getLogger(MigracionClaves.class);

    // Mismo formato que reconoce BCryptPasswordEncoder: $2a$, $2b$ o $2y$, costo de 2 dígitos,
    // y 53 caracteres de sal + hash. Más estricto que "empieza con $2": una clave en texto plano
    // que por casualidad empiece con "$2" también se migra.
    private static final Pattern BCRYPT = Pattern.compile("^\\$2[aby]\\$\\d{2}\\$[./0-9A-Za-z]{53}$");

    private final PacienteRepository pacienteRepository;
    private final MedicoRepository medicoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public MigracionClaves(PacienteRepository pacienteRepository, MedicoRepository medicoRepository,
            UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.pacienteRepository = pacienteRepository;
        this.medicoRepository = medicoRepository;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    static boolean esBCrypt(String clave) {
        return clave != null && BCRYPT.matcher(clave).matches();
    }

    @Override
    public void afterSingletonsInstantiated() {
        int pacientes = migrar(pacienteRepository.findAll(), p -> p.getClave(), (p, c) -> p.setClave(c),
                pacienteRepository::saveAll);
        int medicos = migrar(medicoRepository.findAll(), m -> m.getClave(), (m, c) -> m.setClave(c),
                medicoRepository::saveAll);
        int administradores = migrar(usuarioRepository.findAll(), u -> u.getClave(), (u, c) -> u.setClave(c),
                usuarioRepository::saveAll);
        log.info("Migración de claves a BCrypt: {} paciente(s), {} médico(s), {} administrador(es) convertidos",
                pacientes, medicos, administradores);
    }

    // Devuelve cuántas filas convirtió
    private <T> int migrar(List<T> filas, Function<T, String> leer, BiConsumer<T, String> escribir,
            Consumer<List<T>> guardar) {
        List<T> pendientes = filas.stream()
                .filter(f -> leer.apply(f) != null && !esBCrypt(leer.apply(f)))
                .toList();
        if (pendientes.isEmpty()) {
            return 0;
        }
        pendientes.forEach(f -> escribir.accept(f, passwordEncoder.encode(leer.apply(f))));
        guardar.accept(pendientes);
        return pendientes.size();
    }
}
