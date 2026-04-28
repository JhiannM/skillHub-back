import express from "express";
import { swaggerDocs } from "./config/swagger.js";

const app = express();


//Documentación de la APi con Swagger 

app.use("/api/docs", ...swaggerDocs);


app.listen(3000 , () => {
    console.log("Servidor corriendo en el puerto 3000");
    
})


export default app;
