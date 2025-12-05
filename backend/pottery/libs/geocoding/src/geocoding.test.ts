import { GeocodingService } from './geocoding.service';

async function testGeocoding() {
    const service = new GeocodingService();

    console.log('\n=== TESTING GEOCODING SERVICE ===\n');

    // Test 1: Store address
    console.log('Test 1: Geocoding store address');
    const storeResult = await service.geocode('Nam Từ Liêm, Hà Nội, Vietnam');
    console.log('Store result:', storeResult);

    // Wait to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Test 2: Delivery addresses
    const testAddresses = [
        '1295 Giải Phóng, Hoàng Liệt, Hoàng Mai, Hà Nội, Vietnam',
        '19 Nguyễn Thị Định, Trung Hòa, Cầu Giấy, Hà Nội, Vietnam',
        '96 Định Công, Phương Liệt, Thanh Xuân, Hà Nội, Vietnam',
    ];

    for (const address of testAddresses) {
        console.log(`\nTest: Geocoding ${address}`);
        const result = await service.geocode(address);
        console.log('Result:', result);
        await new Promise(resolve => setTimeout(resolve, 1500));
    }

    // Test 3: Calculate shipping fee
    console.log('\n=== TESTING SHIPPING FEE CALCULATION ===\n');

    const shippingTests = [
        {
            store: 'Nam Từ Liêm, Hà Nội',
            delivery: '1295 Giải Phóng, Hoàng Liệt, Hoàng Mai',
            city: 'Hà Nội',
        },
        {
            store: 'Nam Từ Liêm, Hà Nội',
            delivery: '19 Nguyễn Thị Định, Trung Hòa, Cầu Giấy',
            city: 'Hà Nội',
        },
        {
            store: 'Nam Từ Liêm, Hà Nội',
            delivery: '96 Định Công, Phương Liệt, Thanh Xuân',
            city: 'Hà Nội',
        },
    ];

    for (const test of shippingTests) {
        console.log(`\nCalculating shipping: ${test.delivery}`);
        const result = await service.calculateShippingFee(
            test.store,
            test.delivery,
            test.city
        );
        console.log('Shipping result:', result);
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
}

// Run tests if executed directly
if (require.main === module) {
    testGeocoding().catch(console.error);
}

export { testGeocoding };
