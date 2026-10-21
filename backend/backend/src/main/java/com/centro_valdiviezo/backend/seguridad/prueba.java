package com.centro_valdiviezo.backend.seguridad;

public class prueba {
    public static void main(String[] args){
        String x = TokenUtils.generarToken("grupo3","grupo3@gmail.com");
        System.out.println(x);
    }
}
