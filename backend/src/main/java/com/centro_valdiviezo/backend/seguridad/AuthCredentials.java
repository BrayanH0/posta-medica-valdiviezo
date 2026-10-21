package com.centro_valdiviezo.backend.seguridad;

import lombok.Data;

@Data
public class AuthCredentials {
    private String dni;
    private String clave;
}
