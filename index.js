require('dotenv').config(); //Cargar variables de entorno desde .env


const express = require('express');
const admin = require('firebase-admin');
const fs = require('fs');
const csvWriter = require('csv-write-stream');
const path = require('path');
const cron = require('node-cron');

//Inicializar Firebase Admin SDK
const serviceAccount = require(path.join(__dirname, process.env.SERVICE_ACCOUNT_KEY));
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL
});

const db = admin.firestore();
const app = express();
const PORT = process.env.PORT || 3000;

//Función para exportar productos a CSV
const exportProducts = async () => {
  const fileName = 'productos.csv';
  const filePath = path.join(__dirname, fileName);
  const writer = csvWriter({ headers: ["trabajador", "fecha", "cantidad", "nombre"] });

  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(filePath);
    writer.pipe(stream);

    db.collection('productos').get()
      .then(snapshot => {
        if (snapshot.empty) {
          console.log('No matching documents.');
          writer.end();
          return resolve();
        }

        snapshot.forEach(doc => {
          const data = doc.data();
          console.log('Writing data to CSV:', data);//Verifica los datos
          writer.write({
            trabajador: data.trabajador || '',
            fecha: data.fecha || '',
            cantidad: data.cantidad || '',
            nombre: data.nombre || ''
          });
        });

        writer.end();
        stream.on('finish', () => {
          console.log('Exported data to', filePath);
          resolve();
        });

        stream.on('error', error => {
          console.error('Error writing to CSV file:', error);
          reject(error);
        });
      })
      .catch(error => {
        console.error('Error exporting data: ', error);
        writer.end();
        reject(error);
      });
  });
};

//Endpoint para exportar datos manualmente
app.get('/export-products', async (req, res) => {
  try {
    await exportProducts();
    const filePath = path.join(__dirname, 'productos.csv');
    if (fs.existsSync(filePath)) {
      res.download(filePath, 'productos.csv');
    } else {
      res.status(500).send('Error exporting data: CSV file not found');
    }
  } catch (error) {
    res.status(500).send('Error exporting data');
  }
});

//Automatizar la exportación diaria a la medianoche
cron.schedule('0 0 * * *', () => {
  console.log('Scheduled task started');
  exportProducts()
    .then(() => console.log('Scheduled task completed successfully'))
    .catch(error => console.error('Scheduled task failed:', error));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
