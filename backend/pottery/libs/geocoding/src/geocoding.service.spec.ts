
import { Test, TestingModule } from '@nestjs/testing';
import { GeocodingService } from './geocoding.service';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('GeocodingService', () => {
    let service: GeocodingService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [GeocodingService],
        }).compile();
        service = module.get<GeocodingService>(GeocodingService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
        console.log('✅ Service defined thành công');
    });

    describe('geocode', () => {
        it('should return coordinates for valid address', async () => {
            try {
                mockedAxios.get.mockResolvedValue({ data: [{ lat: '10.1', lon: '106.2', display_name: 'Test Place', address: { city: 'HCM' } }] });
                const result = await service.geocode('Test Address');
                expect(result).toEqual({ latitude: 10.1, longitude: 106.2, display_name: 'Test Place', address: { city: 'HCM' } });
                console.log('✅ Geocode thành công');
            } catch (error) {
                console.error('❌ Geocode thất bại', error);
                throw error;
            }
        });

        it('should return null for no result', async () => {
            try {
                mockedAxios.get.mockResolvedValue({ data: [] });
                const result = await service.geocode('Unknown Address');
                expect(result).toBeNull();
                console.log('✅ Geocode không tìm thấy thành công');
            } catch (error) {
                console.error('❌ Geocode không tìm thấy thất bại', error);
                throw error;
            }
        });

        it('should throw error on axios failure', async () => {
            try {
                mockedAxios.get.mockRejectedValue(new Error('Network error'));
                await expect(service.geocode('Error Address')).rejects.toThrow('Failed to geocode address');
                console.log('✅ Geocode error handling thành công');
            } catch (error) {
                console.error('❌ Geocode error handling thất bại', error);
                throw error;
            }
        });
    });

    describe('reverseGeocode', () => {
        it('should return address for valid coordinates', async () => {
            try {
                mockedAxios.get.mockResolvedValue({ data: { display_name: 'Test Address' } });
                const result = await service.reverseGeocode(10.1, 106.2);
                expect(result).toBe('Test Address');
                console.log('✅ Reverse geocode thành công');
            } catch (error) {
                console.error('❌ Reverse geocode thất bại', error);
                throw error;
            }
        });

        it('should return null for no result', async () => {
            try {
                mockedAxios.get.mockResolvedValue({ data: {} });
                const result = await service.reverseGeocode(0, 0);
                expect(result).toBeNull();
                console.log('✅ Reverse geocode không tìm thấy thành công');
            } catch (error) {
                console.error('❌ Reverse geocode không tìm thấy thất bại', error);
                throw error;
            }
        });

        it('should throw error on axios failure', async () => {
            try {
                mockedAxios.get.mockRejectedValue(new Error('Network error'));
                await expect(service.reverseGeocode(1, 2)).rejects.toThrow('Failed to reverse geocode coordinates');
                console.log('✅ Reverse geocode error handling thành công');
            } catch (error) {
                console.error('❌ Reverse geocode error handling thất bại', error);
                throw error;
            }
        });
    });

    describe('getRoute', () => {
        it('should return route for valid coordinates', async () => {
            try {
                mockedAxios.get.mockResolvedValue({ data: { routes: [{ geometry: { coordinates: [[106.2, 10.1], [106.3, 10.2]] }, distance: 1000, duration: 600 }] } });
                const result = await service.getRoute(10.1, 106.2, 10.2, 106.3);
                expect(result).toEqual({ coordinates: [[10.1, 106.2], [10.2, 106.3]], distance: 1000, duration: 600 });
                console.log('✅ Get route thành công');
            } catch (error) {
                console.error('❌ Get route thất bại', error);
                throw error;
            }
        });

        it('should return null for no route', async () => {
            try {
                mockedAxios.get.mockResolvedValue({ data: { routes: [] } });
                const result = await service.getRoute(0, 0, 0, 0);
                expect(result).toBeNull();
                console.log('✅ Get route không tìm thấy thành công');
            } catch (error) {
                console.error('❌ Get route không tìm thấy thất bại', error);
                throw error;
            }
        });

        it('should return null on axios failure', async () => {
            try {
                mockedAxios.get.mockRejectedValue(new Error('Network error'));
                const result = await service.getRoute(1, 2, 3, 4);
                expect(result).toBeNull();
                console.log('✅ Get route error handling thành công');
            } catch (error) {
                console.error('❌ Get route error handling thất bại', error);
                throw error;
            }
        });
    });
});
