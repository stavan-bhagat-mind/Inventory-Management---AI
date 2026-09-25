const { Sequelize } = require('sequelize');
const env = require('./env');

const sequelize = new Sequelize(env.DB.NAME, env.DB.USER, env.DB.PASSWORD, {
  host: env.DB.HOST,
  port: env.DB.PORT,
  dialect: 'postgres',
  logging: env.DB.LOGGING ? (msg) => console.log(`[SQL] ${msg}`) : false,
  pool: {
    max: env.DB.POOL.max,
    min: env.DB.POOL.min,
    acquire: env.DB.POOL.acquire,
    idle: env.DB.POOL.idle
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
});

module.exports = sequelize;
