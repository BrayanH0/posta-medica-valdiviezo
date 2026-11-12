package com.centro_valdiviezo.backend.dto;

import com.centro_valdiviezo.backend.model.Cita;
import com.fasterxml.jackson.annotation.JsonProperty;

// RFC-011 (tarea 26): lo único que recibe un paciente de las citas de un médico en una fecha.
// Basta para calcular las horas libres (horarios-cita.ts usa hora_cita y estado_cita); no lleva
// paciente, motivo ni ids de otras personas (AUD-PRI-04). Los nombres JSON son los de la entidad Cita.
public record HoraOcupadaDTO(
        @JsonProperty("hora_cita") String horaCita,
        @JsonProperty("estado_cita") Integer estadoCita) {

    public static HoraOcupadaDTO de(Cita cita) {
        return new HoraOcupadaDTO(cita.getHora_cita(), cita.getEstado_cita());
    }
}
