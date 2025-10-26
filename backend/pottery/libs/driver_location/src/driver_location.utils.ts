import { Injectable } from '@nestjs/common';

@Injectable()
export class DriverLocationUtils {
    // Tính khoảng cách giữa 2 điểm theo công thức Haversine
    static calculateDistance(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number,
    ): number {
        const R = 6371; // Bán kính trái đất tính bằng km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) *
            Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Khoảng cách tính bằng km
        return distance;
    }

    private static deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }

    // Kiểm tra xem vị trí có hợp lệ không (trong phạm vi Việt Nam)
    static isValidLocation(latitude: number, longitude: number): boolean {
        // Phạm vi tọa độ Việt Nam
        const VN_LAT_MIN = 8.0;
        const VN_LAT_MAX = 23.5;
        const VN_LON_MIN = 102.0;
        const VN_LON_MAX = 110.0;

        return (
            latitude >= VN_LAT_MIN &&
            latitude <= VN_LAT_MAX &&
            longitude >= VN_LON_MIN &&
            longitude <= VN_LON_MAX
        );
    }

    // Tính thời gian ước tính giao hàng dựa trên khoảng cách
    static estimateDeliveryTime(distanceKm: number): number {
        const averageSpeed = 30; // Tốc độ trung bình 30km/h
        const timeInHours = distanceKm / averageSpeed;
        return Math.ceil(timeInHours * 60); // Trả về số phút
    }

    // Format location thành chuỗi dễ đọc
    static formatLocation(latitude: number, longitude: number): string {
        return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }

    // Kiểm tra xem nhân viên có đang trong phạm vi giao hàng hợp lý không
    static isWithinDeliveryRadius(
        driverLat: number,
        driverLon: number,
        destinationLat: number,
        destinationLon: number,
        radiusKm: number = 50,
    ): boolean {
        const distance = this.calculateDistance(
            driverLat,
            driverLon,
            destinationLat,
            destinationLon,
        );
        return distance <= radiusKm;
    }
}