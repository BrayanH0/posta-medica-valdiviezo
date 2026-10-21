package com.centro_valdiviezo.backend.services;

import java.util.Optional;

import com.centro_valdiviezo.backend.dto.CitaMedicoDTO;

// Resultado de cambiar el estado de una cita de un médico. El controlador decide la respuesta HTTP.
public record ResultadoCambioEstado(Tipo tipo, Optional<CitaMedicoDTO> cita) {

    public enum Tipo {
        CITA_NO_ENCONTRADA, // no existe o no es del médico
        ESTADO_INEXISTENTE, // el nombre no está en Estado_Cita
        CAMBIADO
    }
}
