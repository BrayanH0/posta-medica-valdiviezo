package com.centro_valdiviezo.backend.autenticacion;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;

import com.centro_valdiviezo.backend.controller.AuthController;
import com.centro_valdiviezo.backend.repository.MedicoRepository;
import com.centro_valdiviezo.backend.repository.PacienteRepository;
import com.centro_valdiviezo.backend.repository.UsuarioRepository;

// RFC-007 (LB-7). Comprueba que Spring entrega a AuthController los autenticadores en el orden
// caracterizado por U40 (paciente -> médico -> administrador), usando @Order. Contexto mínimo:
// solo los autenticadores, el controlador y repositorios simulados; no usa la base de datos.
class AutenticadorRolOrdenTest {

    // U80
    @Test
    void springEntregaLosAutenticadoresEnOrdenPacienteMedicoAdministrador() {
        try (AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext()) {
            // Se registran en orden inverso para que el orden no dependa del registro
            ctx.registerBean(UsuarioRepository.class, () -> mock(UsuarioRepository.class));
            ctx.registerBean(MedicoRepository.class, () -> mock(MedicoRepository.class));
            ctx.registerBean(PacienteRepository.class, () -> mock(PacienteRepository.class));
            ctx.register(AutenticadorAdministrador.class, AutenticadorMedico.class, AutenticadorPaciente.class,
                    ListaInyectada.class);
            ctx.refresh();

            List<AutenticadorRol> lista = ctx.getBean(ListaInyectada.class).autenticadores;

            assertEquals(3, lista.size());
            assertInstanceOf(AutenticadorPaciente.class, lista.get(0));
            assertInstanceOf(AutenticadorMedico.class, lista.get(1));
            assertInstanceOf(AutenticadorAdministrador.class, lista.get(2));
            assertNotNull(new AuthController(lista));
        }
    }

    // Recibe la lista igual que AuthController (inyección por constructor de List<AutenticadorRol>)
    static class ListaInyectada {
        final List<AutenticadorRol> autenticadores;

        ListaInyectada(List<AutenticadorRol> autenticadores) {
            this.autenticadores = autenticadores;
        }
    }
}
