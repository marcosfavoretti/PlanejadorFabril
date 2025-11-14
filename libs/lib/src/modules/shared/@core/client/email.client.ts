import * as axios from 'axios';
import { config } from 'dotenv';
config();
export const EmailClient = axios.create({
  baseURL: process.env.HTTPEMAIL,
});
