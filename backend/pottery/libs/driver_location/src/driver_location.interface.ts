import { DriverStatus } from '@app/database/entities';

export interface IAssignDriver {
    order_id: number;
    driver_id: number;
}

export interface IUpdateDriverLocation {
    order_id: number;
    driver_id: number;
    driver_status: DriverStatus;
    latitude?: number;
    longitude?: number;
}

export interface IAcceptOrder {
    order_id: number;
    latitude: number;
    longitude: number;
}

export interface IRejectOrder {
    order_id: number;
}

export interface IUpdateLocation {
    order_id: number;
    latitude: number;
    longitude: number;
}

export interface IGetOrdersForDriver {
    status?: DriverStatus;
    driver_id?: number;
}
