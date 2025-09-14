import { StoreEntity, StoreRepository } from '@app/database';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ICreateStore, IListStore, IUpdateStore } from './store.interface';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from '@app/common';

@Injectable()
export class StoreService {
    constructor(
        private readonly storeRepository: StoreRepository,
    ) { }

    async create(data: ICreateStore): Promise<{ message: string, store: StoreEntity | null }> {
        try {
            const store = await this.storeRepository.create({
                store_name: data.store_name,
                address: data.address,
                phone: data.phone,
            });
            return {
                message: 'Store created successfully',
                store,
            };
        } catch (error) {
            return {
                message: 'Failed to create store',
                store: null,
            };
        }
    }

    async findAll(params: IListStore): Promise<{ message: string, stores: StoreEntity[] }> {
        const stores = await this.storeRepository.findAll({
            ...params,
            size: params.size || DEFAULT_PAGE_SIZE,
            page: params.page || DEFAULT_PAGE,
        });
        return {
            message: stores.length > 0 ? 'Stores fetched successfully' : 'No stores found',
            stores,
        };
    }

    async findOne(id: number): Promise<{ message: string, store: StoreEntity }> {
        const store = await this.storeRepository.findById(id);
        if (!store) throw new NotFoundException('Store not found');
        return {
            message: 'Store fetched successfully',
            store,
        };
    }

    async update(id: number, data: IUpdateStore): Promise<{ message: string, store: StoreEntity }> {
        await this.storeRepository.update(id, data);
        const store = await this.storeRepository.findById(id);
        if (!store) throw new NotFoundException('Store not found');
        return {
            message: 'Store updated successfully',
            store,
        };
    }

    async softDelete(id: number): Promise<{ message: string }> {
        const store = await this.storeRepository.findById(id);
        if (!store) throw new NotFoundException('Store not found');
        await this.storeRepository.softDelete(id);
        return { message: 'Store deleted successfully' };
    }
}
