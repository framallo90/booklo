import app from './app';
import pool from './config/database';

const PORT = process.env.PORT || 3000;

pool.getConnection()
  .then(connection => {
    console.log('Base de datos conectada correctamente');
    connection.release();      
    app.listen(PORT, () => {
      console.log(`booklo-api corriendo en http://localhost:${PORT}`);
  });
})

  .catch(error => {
    console.error('Error al conectar a la base de datos:', error.message);
    process.exit(1); 
    });