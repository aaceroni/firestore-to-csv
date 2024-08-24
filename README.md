# Aplicación Node.js para exportación de datos desde Firestore a CSV:

# Objetivo: 
Extraer datos de una base de datos Cloud Firestore y permitir la descarga de esos datos en un archivo CSV a través de un endpoint HTTP.
# Tecnologías utilizadas:
Node.js: Entorno de ejecución para el servidor.
Express: Framework para crear el servidor y gestionar las rutas.
Firebase Admin SDK: Para interactuar con la base de datos Cloud Firestore.
csv-write-stream: Para generar archivos CSV.
node-cron: Para automatizar tareas (como la exportación diaria).
Funcionalidad Principal:
Extraer datos desde una colección en Firestore.
Exportar esos datos a un archivo CSV.
Exponer un endpoint HTTP (/export-products) para descargar el archivo CSV.
Automatizar la exportación diaria de datos a CSV.
Puerto: 3000
