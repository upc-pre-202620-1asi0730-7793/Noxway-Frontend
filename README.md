# NoxwayFrontend

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.8.

## Prueba local de Noxway

Desde la carpeta que contiene `package.json`, con Node.js 24 instalado:

```powershell
npm ci
npm run server
```

Deja esa terminal abierta. En otra terminal, en la misma carpeta:

```powershell
npm start
```

Abre [http://localhost:4200](http://localhost:4200). Pulsa **Crear una cuenta** y
registra un nombre, correo de prueba, tipo de turno y una contraseña exclusiva para
la entrevista. Después inicia sesión. En **Mi Perfil** puedes editar y guardar tus
datos y preferencias. En **Mi Trayecto** puedes registrar una salida, confirmar la
llegada y ver tu historial. Pulsa **Salir** entre entrevistas.

El servidor temporal escucha en el puerto 3000. Guarda las cuentas y trayectos
en `server/accounts.local.json`, que se crea al arrancar y se excluye de Git.
Al reiniciar la API, los datos se conservan y es necesario iniciar sesión de nuevo.

La opción **Abrir demostración con datos de ejemplo** permite explorar las
pantallas anteriores. La prueba con cuenta propia abarca el perfil y el registro
manual de trayectos. El menú también permite abrir los otros módulos con datos
de ejemplo. Las
preferencias de privacidad se guardan como valores y la prueba local no activa
GPS, cifrado del historial ni avisos externos. La integración con Spring Boot
y MySQL queda pendiente.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
