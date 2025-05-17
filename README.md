
# cosas pendientes por hacer 

1.obtener el token para notifiaciones (y asi envia notificacione spersonalizadas por ejemplo para la racha de cada usuario si no la ha hecho ese dia)
2.implementar pagos en la app para remover ads
3. mover la key que esta en app.json para el .env 

 


# cosas hecha 

1. aumentamos la vida a 3



# ERRORES
1. en eas.json olvide poner en development simulator: false porque si esta true solo funciona en el simulador y no en el dispositivo fisico.


# recuerda
1. aumentar la version para ios siempre
2. cuando subi la el login con google la primera ves a l app store una re las rasones por el rechazo fueron: - La opción de inicio de sesión limita la recopilación de datos al nombre y la dirección de correo electrónico del usuario.

- La opción de inicio de sesión permite a los usuarios mantener su dirección de correo electrónico privada de todas las partes como parte de la configuración de su cuenta.

- La opción de inicio de sesión no recopila interacciones con la aplicación con fines publicitarios sin consentimiento. 

y tube que hacer cambios y añadir los scopes con [profile y email]