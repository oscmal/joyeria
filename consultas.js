const { Pool } = require("pg");
const format = require ("pg-format");

const pool = new Pool ({
    user: "postgres",
    host: "localhost",
    password: "postgres",
    database: "joyas",
    port: 5432,
    allowExitOnIdle: true,
});

const obtenerJoyas = async ({ limits = 6, order_by = "id_ASC", page = 1 }) => {
    const [campo, direccion] = order_by.split('_');
    const offset = (page - 1) * limits;
  
    const formattedQuery = format(
      'SELECT * FROM inventario ORDER BY %s %s LIMIT %s OFFSET %s',
      campo,
      direccion,
      limits,
      offset
    );
  
    const { rows: joyas } = await pool.query(formattedQuery);
  
    return joyas;
  };
  
  const obtenerJoyasFiltradas = async ({ precio_max, precio_min, categoria, metal }) => {
    const filtros = [];
    const values = [];
    const agregarFiltro = (campo, comparador, valor) => {
      values.push(valor);
      filtros.push(`${campo} ${comparador} $${values.length}`);
    };
  
    if (precio_max) agregarFiltro('precio', '<=', precio_max);
    if (precio_min) agregarFiltro('precio', '>=', precio_min);
    if (categoria) agregarFiltro('categoria', '=', categoria);
    if (metal) agregarFiltro('metal', '=', metal);
  
    let consulta = 'SELECT * FROM inventario';
  
    if (filtros.length > 0) {
      const whereClause = filtros.join(' AND ');
      consulta += ` WHERE ${whereClause}`;
    }
  
    const { rows: joyas } = await pool.query(consulta, values);
  
    return joyas;
  };
  
  const prepararHATEOAS = (joyas) => {
    const results = joyas
      .map((j) => {
        return {
          name: j.nombre,
          href: `/joyas/joya/${j.id}`,
        };
      })
      .slice(0, 6);
    const total = joyas.length;
    const stockTotal = joyas.reduce((total, i) => total + i.stock, 0);
    const HATEOAS = {
      total,
      results,
      stockTotal,
    };
    return HATEOAS;
  };
  
  module.exports = {
    obtenerJoyas,
    obtenerJoyasFiltradas,
    prepararHATEOAS
  };