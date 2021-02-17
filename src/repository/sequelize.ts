import { Sequelize } from 'sequelize';

export default new Sequelize(process.env.DB_URL as string, {
  dialectOptions: {
    charset: 'utf8mb4',
  },
  logging: process.env.NODE_ENV !== 'production' ? console.log : false,
});
