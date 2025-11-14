import * as axios from 'axios';
import { config } from 'dotenv';
config();

export const clientAxios = axios.create({
  baseURL: process.env.ESTRUTURA_SERVICE,
});
