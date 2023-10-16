const express = require("express");
const app = express ();
const PORT = 3000;

const { obtenerJoyas, obtenerJoyasFiltradas, prepararHATEOAS} = require ("./consultas");

 //app.use(express.json());

app.use((req, res, next) =>{
  middlewareFilter(req,res,next);
})
const middlewareFilter = (req, res, next) => {
  console.log("rut:"+ JSON.stringify(req.query.rut));
  console.log("nombre:"+ JSON.stringify(req.query.nombre));
    if (Object.keys(req.query).length == 0) {
      res.json({message: "Evaluación fallida, no se ingresaron filtros"});
    } else {
      next();
    }
  };
  
  app.get("/joyas", async (req, res) => {
    try {
      const queryStrings = req.query;
      const joyas = await obtenerJoyas(queryStrings);
      const hateoas = prepararHATEOAS(joyas);
      res.json(hateoas);
    } catch (error) {
      res.status(500).json({ error: "Ocurrió un error en el servidor." });
    }
  });
  
  app.get("/joyas/filtros", middlewareFilter, async (req, res) => {
    try {
      const { precio_max, precio_min, categoria, metal } = req.query;
      const joyasFiltradas = await obtenerJoyasFiltradas({
        precio_max,
        precio_min,
        categoria,
        metal,
      });
      res.json(joyasFiltradas);
    } catch (error) {
      res.status(500).json({ error: "Ocurrió un error en el servidor." });
    }
  });
  
  app.get("*", (req, res) => {
    res.status(404).send("Esta ruta no existe");
  });
  
  app.listen(PORT, () => {
    console.log(`Servidor up en el puerto ${PORT}`);
  });