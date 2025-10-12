export class ICreateDeliveryProof {
    order_id?: number
    driver_id?: number
    image_proof?: Buffer
    captured_at?: Date
}
export interface IUpdateDeliveryProof {
    order_id?: number
    driver_id?: number
    image_proof?: Buffer
    captured_at?: Date
}
export interface IListDeliveryProof {
    page?: number
    size?: number
    key?: string
}