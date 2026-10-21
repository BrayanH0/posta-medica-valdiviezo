package com.centro_valdiviezo.backend;

import static org.junit.jupiter.api.Assertions.*;

import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.Repository;

import com.centro_valdiviezo.backend.controller.CitaConsultaController;
import com.centro_valdiviezo.backend.controller.CitaController;
import com.centro_valdiviezo.backend.controller.EspecialidadController;
import com.centro_valdiviezo.backend.controller.MedicoController;
import com.centro_valdiviezo.backend.controller.PacienteController;
import com.centro_valdiviezo.backend.controller.ReporteController;
import com.centro_valdiviezo.backend.controller.UsuarioController;
import com.centro_valdiviezo.backend.controller.AuthController;
import com.centro_valdiviezo.backend.seguridad.UserDetailServiceImpl;
import com.centro_valdiviezo.backend.services.CitaService;
import com.centro_valdiviezo.backend.services.MedicoService;
import com.centro_valdiviezo.backend.services.PacienteService;
import com.centro_valdiviezo.backend.services.UsuarioService;

// RFC-008 (LB-8), U84. Revisa por reflexión las clases del alcance de R4 (H-015, H-020).
class InyeccionPorConstructorTest {

    private static final List<Class<?>> CONTROLADORES = List.of(AuthController.class, CitaController.class,
            CitaConsultaController.class, EspecialidadController.class, MedicoController.class,
            PacienteController.class, ReporteController.class, UsuarioController.class);

    private static final List<Class<?>> SERVICIOS = List.of(CitaService.class, MedicoService.class,
            PacienteService.class, UsuarioService.class, UserDetailServiceImpl.class);

    private static List<Field> atributosDeInstancia(Class<?> c) {
        List<Field> r = new ArrayList<>();
        for (Field f : c.getDeclaredFields()) {
            if (!Modifier.isStatic(f.getModifiers()) && !f.isSynthetic()) {
                r.add(f);
            }
        }
        return r;
    }

    @Test
    void sinAutowiredEnAtributosYTodosFinal() {
        List<Class<?>> todas = new ArrayList<>(CONTROLADORES);
        todas.addAll(SERVICIOS);
        for (Class<?> c : todas) {
            for (Field f : atributosDeInstancia(c)) {
                assertFalse(f.isAnnotationPresent(Autowired.class), c.getSimpleName() + "." + f.getName() + " tiene @Autowired");
                assertTrue(Modifier.isFinal(f.getModifiers()), c.getSimpleName() + "." + f.getName() + " no es final");
            }
        }
    }

    @Test
    void losControladoresDependenDeInterfacesDeServicio() {
        for (Class<?> c : CONTROLADORES) {
            for (Field f : atributosDeInstancia(c)) {
                assertFalse(SERVICIOS.contains(f.getType()), c.getSimpleName() + "." + f.getName() + " depende de una clase concreta");
            }
        }
    }

    @Test
    void citaControllerYCitaConsultaControllerNoUsanRepositorios() {
        for (Class<?> c : List.of(CitaController.class, CitaConsultaController.class)) {
            for (Field f : atributosDeInstancia(c)) {
                assertFalse(Repository.class.isAssignableFrom(f.getType()), c.getSimpleName() + "." + f.getName() + " es un repositorio");
            }
        }
    }
}
