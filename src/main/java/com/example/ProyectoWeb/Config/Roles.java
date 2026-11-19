package com.example.ProyectoWeb.Config;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

// Ayuda para saber el rol de quien hizo la peticion
public class Roles {

    // true si el usuario que inicio sesion tiene el rol ADMIN
    public static boolean esAdmin(Authentication authentication) {
        for (GrantedAuthority permiso : authentication.getAuthorities()) {
            if (permiso.getAuthority().equals("ROLE_ADMIN")) {
                return true;
            }
        }
        return false;
    }
}
