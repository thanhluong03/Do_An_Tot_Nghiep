import axios from 'axios';
import { SendOrderMailDto } from '../../types/order-mail';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const api = axios.create({ baseURL: API_BASE_URL, headers: { 'Content-Type': 'application/json' } });

export const mailApi = {
    async sendOrderMail(payload: SendOrderMailDto) {
        const res = await api.post('/mail/order-confirmation', payload);
        return res.data;
    },
};
