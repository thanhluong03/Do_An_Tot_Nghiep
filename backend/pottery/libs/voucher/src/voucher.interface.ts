export class ICreateVoucher {
    name?: string;
    start_time?: Date;
    end_time?: Date;
    is_active?: boolean;
    effective_period_begins?: Date;
    effective_period_ends?: Date;
    voucher_percentage?: number;
    quantity?: number;
    order_conditions?: number;
}
export interface IUpdateVoucher {
    name?: string;
    start_time?: Date;
    end_time?: Date;
    is_active?: boolean;
    effective_period_begins?: Date;
    effective_period_ends?: Date;
    voucher_percentage?: number;
    quantity?: number;
    order_conditions?: number;
}
export interface IListVoucher {
    page?: number
    size?: number
    key?: string
}