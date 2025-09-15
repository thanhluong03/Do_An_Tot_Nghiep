export class ICreateFlashSale {
    name?: string;
    start_time?: string;
    end_time?: string;
    is_active?: boolean;
    effective_period_begins?: Date;
    effective_period_ends?: Date;
    flash_sale_price?: number;
}
export interface IUpdateFlashSale {
    name?: string;
    start_time?: string;
    end_time?: string;
    is_active?: boolean;
    effective_period_begins?: Date;
    effective_period_ends?: Date;
    flash_sale_price?: number;
}
export interface IListFlashSale {
    page?: number
    size?: number
    key?: string
}