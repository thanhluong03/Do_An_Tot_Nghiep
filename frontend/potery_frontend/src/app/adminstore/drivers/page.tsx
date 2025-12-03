"use client";
import { useEffect, useState, useMemo } from "react";
import { User } from "@/api/services/userService";
import { getAvailableDrivers } from "@/api/services/deliveryService";
import { getOrdersForDriver } from "@/api/services/deliveryService";
import { DriverLocation, DriverStatus } from "@/api/services/deliveryService";
import { Truck, Package, CheckCircle, Clock } from 'lucide-react';
import { getOrderDetail, Order } from "@/api/services/orderService";
//import { OrderDetailModal } from "@/components/adminOrders/OrderDetailModal";
import OrderDetailModal from "@/components/adminStore/OrderDetailModal";
// --- Interface mở rộng cho việc thống kê ---
interface DriverStats {
    driver: User;
    totalAssigned: number;
    totalDelivering: number;
    totalCompleted: number;
}

// --- Hiển thị Badge Trạng thái ---
export const DriverStatusBadge = ({ status }: { status?: string }) => {
    if (!status) status = "UNKNOWN";

    let text = "";
    let color = "";

    switch (status) {
        case DriverStatus.ACCEPTED:
            text = "Tài xế đang giao";
            color = "bg-blue-100 text-blue-800";
            break;

        case DriverStatus.WAITING_ACCEPT:
            text = "Chờ tài xế nhận";
            color = "bg-yellow-100 text-yellow-800";
            break;

        case "COMPLETED":
            text = "Tài xế hoàn tất";
            color = "bg-green-100 text-green-800";
            break;

        default:
            text = "Không rõ";
            color = "bg-gray-200 text-gray-800";
    }

    return (
        <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${color}`}>
            {text}
        </span>
    );
};
export const OrderStatusBadge = ({ status }: { status?: string }) => {
    if (!status) status = "UNKNOWN";

    let text = "";
    let color = "";

    switch (status) {
        case "PENDING":
            text = "Chờ xử lý";
            color = "bg-gray-100 text-gray-700";
            break;

        case "CONFIRMED":
            text = "Đã xác nhận";
            color = "bg-purple-100 text-purple-800";
            break;

        case "SHIPPING":
            text = "Đang giao";
            color = "bg-blue-100 text-blue-800";
            break;

        case "DELIVERED":
            text = "Đã giao";
            color = "bg-green-100 text-green-800";
            break;

        case "CANCELED":
            text = "Đã hủy";
            color = "bg-red-100 text-red-800";
            break;

        default:
            text = "Không rõ";
            color = "bg-gray-200 text-gray-800";
    }

    return (
        <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${color}`}>
            {text}
        </span>
    );
};
export default function DriverOrdersPage() {
    const [drivers, setDrivers] = useState<User[]>([]);
    const [selectedDriver, setSelectedDriver] = useState<number | null>(null);
    const [orders, setOrders] = useState<DriverLocation[]>([]);
    const [loadingDrivers, setLoadingDrivers] = useState(true);
    const [loadingOrders, setLoadingOrders] = useState(false);

    // Filters
    const [filterStatus, setFilterStatus] = useState<string>("ALL");
    const [searchName, setSearchName] = useState("");
    const [dateFilter, setDateFilter] = useState("");

    const [fullOrderDetails, setFullOrderDetails] = useState<Order | null>(null);
    const [loadingModal, setLoadingModal] = useState(false);
    // --- Load Drivers ---
    useEffect(() => {
        const loadDrivers = async () => {
            setLoadingDrivers(true);
            const res = await getAvailableDrivers();
            setDrivers(res);
            setLoadingDrivers(false);
        };
        loadDrivers();
    }, []);

    // --- Load Orders for Selected Driver ---
    const loadDriverOrders = async (driverId: number) => {
        setLoadingOrders(true);
        const res = await getOrdersForDriver(driverId);
        setOrders(res);
        setLoadingOrders(false);
    };

    const handleSelectDriver = (id: number) => {
        setSelectedDriver(id);
        loadDriverOrders(id);
    };

    // --- Tính toán Thống kê cho tất cả Tài xế ---
    const driverStats = useMemo(() => {
        // Dùng Map để lưu trữ DriverLocation[] theo Driver ID
        const allDriverOrders = new Map<number, DriverLocation[]>();
        drivers.forEach(driver => {
            // Giả định bạn cần fetch tất cả orders của tất cả drivers nếu muốn tính stats tổng thể
            // Hiện tại, do API chỉ có loadOrders cho 1 driver, ta sẽ phải tính riêng lẻ 
            // hoặc giả định hàm getOrdersForDriverAdmin (từ câu trước) được sử dụng để lấy orders tổng thể.
            // Để đơn giản hóa, ta chỉ tính stats cho driver đang được chọn (selectedDriver)
        });

        // Nếu bạn muốn tính stats cho TẤT CẢ driver, bạn cần một API chung (như getOrdersForDriverAdmin)
        // Hiện tại, ta tính tổng số đơn hàng đã được gán (assigned orders) cho mỗi driver từ API getAvailableDrivers
        // Giả định getAvailableDrivers đã trả về số liệu thống kê. Nếu không, ta phải thực hiện request riêng lẻ.

        // Ta sẽ tính stats chi tiết CHỈ cho driver đang được chọn
        const stats: DriverStats[] = drivers.map(driver => {
            if (driver.id === selectedDriver) {
                const totalDelivering = orders.filter(o => o.driver_status === DriverStatus.ACCEPTED).length;
                // Giả định order.order_status là trường có sẵn khi Order đã hoàn thành giao
                const totalCompleted = orders.filter(o => o.order?.status === "DELIVERED").length;
                const totalAssigned = orders.length;

                return {
                    driver,
                    totalAssigned,
                    totalDelivering,
                    totalCompleted,
                };
            }
            // Stats cơ bản cho driver chưa chọn (nếu cần hiển thị trên bảng driver)
            return {
                driver,
                totalAssigned: 0,
                totalDelivering: 0,
                totalCompleted: 0,
            };
        });

        return stats;
    }, [drivers, selectedDriver, orders]);


    // --- Lọc Tài xế ---
    const filteredDrivers = drivers.filter(d =>
        d.full_name?.toLowerCase().includes(searchName.toLowerCase()) ||
        d.username?.toLowerCase().includes(searchName.toLowerCase())
    );

    // --- Lọc Đơn hàng ---
    const filteredOrders = orders.filter(o => {
        // Lọc theo trạng thái Driver Status
        if (filterStatus !== "ALL") {
            // Lọc theo Đã giao: Lấy từ order status (COMPLETED)
            if (filterStatus === "DELIVERED") {
                if (o.order?.status !== "DELIVERED") return false;
            } else {
                // Lọc theo ACCEPTED/WAITING_ACCEPT (từ driver_status)
                if (o.driver_status !== filterStatus) return false;
            }
        }

        // Lọc theo Ngày tạo
        if (dateFilter) {
            const day = o.created_at.split("T")[0];
            if (day !== dateFilter) return false;
        }
        return true;
    });

    const currentDriverStats = driverStats.find(s => s.driver.id === selectedDriver);
const handleShowDetails = async (orderLocation: DriverLocation) => {
    const orderId = orderLocation.order_id;

    if (!orderId) {
        console.error("Không tìm thấy Order ID!");
        return;
    }

    setFullOrderDetails(null); // Đảm bảo đóng modal cũ và reset data
    setLoadingModal(true); // Bắt đầu loading cho Modal

    try {
        // Gọi API lấy chi tiết Order
        const detailedOrder = await getOrderDetail(orderId);

        if (detailedOrder) {
            setFullOrderDetails(detailedOrder); // Cập nhật dữ liệu để mở modal
        } else {
            console.error("API getOrderDetail không trả về dữ liệu đơn hàng chi tiết.");
        }
    } catch (error) {
        console.error("Lỗi khi tải chi tiết đơn hàng:", error);
    } finally {
        setLoadingModal(false); // Kết thúc loading
    }
};



    // Hàm đóng modal
    const handleCloseModal = () => {
        setFullOrderDetails(null);
    };


    return (
        <div className="p-6 bg-white min-h-screen">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-6 border-b border-gray-200 pb-2 text-center">Quản Lý Tài Xế Đơn Giao Hàng</h1>

            {/* --- 1. Filter Section --- */}
            <div className="bg-white p-4 rounded-xl shadow-md flex gap-4 mb-8 items-center">
                <input
                    type="text"
                    placeholder="Tìm tên tài xế..."
                    className="input border border-gray-300 rounded p-1 w-full max-w-xs transition duration-150 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    onChange={(e) => setSearchName(e.target.value)}
                    value={searchName}
                />

                <h3 className="text-gray-500 font-medium ml-4">Lọc Đơn Hàng Chi Tiết:</h3>

                <select
                    title="status"
                    className="select select-bordered transition duration-150"
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value={DriverStatus.ACCEPTED}>Đang giao</option>
                    <option value={DriverStatus.WAITING_ACCEPT}>Chờ nhận</option>
                    <option value="COMPLETED">Đã giao</option>
                </select>

                <input
                    title="date"
                    type="date"
                    className="input input-bordered transition duration-150"
                    onChange={(e) => setDateFilter(e.target.value)}
                />
            </div>

            {/* --- 2. Main Content Grid (Drivers List + Orders/Stats) --- */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* A. Driver List (Side Table) */}
                <div className="md:col-span-4 bg-white p-4 rounded-xl shadow-lg h-fit">
                    <h2 className="text-xl font-bold mb-4 text-gray-700">Danh Sách Tài Xế</h2>
                    {loadingDrivers ? (
                        <div className="text-center py-4 text-gray-500">Đang tải tài xế...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr className="bg-gray-50 text-xs text-gray-600 uppercase">
                                        <th className="py-3 px-2">ID</th>
                                        <th className="py-3 px-2">Tên Tài Xế</th>
                                        {/* <th className="py-3 px-2">ĐH Đã Gán</th> */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDrivers.map(driver => (
                                        <tr
                                            key={driver.id}
                                            className={`cursor-pointer hover:bg-gray-100 transition duration-150 ${selectedDriver === driver.id ? "bg-blue-50 border-l-4 border-blue-600" : ""}`}
                                            onClick={() => handleSelectDriver(driver.id!)}
                                        >
                                            <td className="py-3 px-2 text-sm font-medium">{driver.id}</td>
                                            <td className="py-3 px-2 text-sm">{driver.full_name || driver.username}</td>
                                            {/* Hiển thị Total Assigned (Cần fetch dữ liệu tổng hợp nếu muốn con số chính xác)
                                            <td className="py-2 px-2 text-sm text-center">
                                                <span className="font-semibold text-gray-700">
                                                    {driverStats.find(s => s.driver.id === driver.id)?.totalAssigned || 0}
                                                </span>
                                            </td> */}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* B. Stats & Orders List (Main Panel) */}
                <div className="md:col-span-8 space-y-6">
                    {!selectedDriver ? (
                        <div className="bg-white p-10 rounded-xl shadow-lg text-center text-gray-500">
                            Vui lòng chọn một tài xế để xem chi tiết đơn hàng và thống kê.
                        </div>
                    ) : (
                        <>
                            {/* --- Stats Cards --- */}
                            <div className="grid grid-cols-3 gap-4">
                                {/* Thẻ 1: Tổng đơn đã gán */}
                                <div className="bg-orange-50 p-5 rounded-xl shadow-md border border-orange-200 flex items-center">
                                    <Package className="w-8 h-8 text-orange-600 mr-4" />
                                    <div>
                                        <p className="text-sm text-gray-600">Tổng Đơn Đã Gán</p>
                                        <p className="text-2xl font-bold text-orange-800">{currentDriverStats?.totalAssigned ?? 0}</p>
                                    </div>
                                </div>
                                {/* Thẻ 2: Đơn đang giao */}
                                <div className="bg-blue-50 p-5 rounded-xl shadow-md border border-blue-200 flex items-center">
                                    <Truck className="w-8 h-8 text-blue-600 mr-4" />
                                    <div>
                                        <p className="text-sm text-gray-600">Đơn Đang Giao</p>
                                        <p className="text-2xl font-bold text-blue-800">{currentDriverStats?.totalDelivering ?? 0}</p>
                                    </div>
                                </div>
                                {/* Thẻ 3: Đơn đã giao */}
                                <div className="bg-green-50 p-5 rounded-xl shadow-md border border-green-200 flex items-center">
                                    <CheckCircle className="w-8 h-8 text-green-600 mr-4" />
                                    <div>
                                        <p className="text-sm text-gray-600">Đơn Đã Giao</p>
                                        <p className="text-2xl font-bold text-green-800">{currentDriverStats?.totalCompleted ?? 0}</p>
                                    </div>
                                </div>
                            </div>

                            {/* --- Orders Table --- */}
                            <div className="bg-white p-6 rounded-xl shadow-lg">
                                <h2 className="text-xl font-bold mb-4 text-gray-700">Đơn Hàng Giao Vận ({filteredOrders.length})</h2>
                                {loadingOrders ? (
                                    <div className="text-center py-6 text-gray-500">Đang tải đơn hàng...</div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="table w-full">
                                            <thead>
                                                <tr className="text-left text-xs text-gray-600 uppercase tracking-wider bg-gray-50">
                                                    <th className="py-3 px-4">Mã đơn</th>
                                                    <th className="py-3 px-4">Trạng thái Giao</th>
                                                    <th className="py-3 px-4">Trạng thái ĐH</th>
                                                    <th className="py-3 px-4">Ngày Gán</th>
                                                    <th className="py-3 px-4">Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredOrders.map(o => (
                                                    <tr key={o.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                                                        <td className="py-3 px-4 text-sm font-medium text-gray-800">#{o.order_id}</td>
                                                        <td>
                                                            <DriverStatusBadge status={o.driver_status} />

                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <OrderStatusBadge status={o.order?.status} />
                                                        </td>
                                                        <td className="py-3 px-4 text-sm text-gray-500">
                                                            {new Date(o.created_at).toLocaleDateString()}
                                                        </td>
                                                       <td className="py-3 px-4 text-sm">
    <button
        onClick={() => handleShowDetails(o)}
        className="text-blue-500 hover:text-blue-700 font-medium transition duration-150"
        disabled={!o.order || loadingModal}
    >
        {/* Chỉ hiển thị Loading khi modal đang cố gắng mở */}
        {loadingModal && fullOrderDetails === null ? "Đang tải..." : (o.order ? "Chi tiết" : "Không có data")}
    </button>
</td>
                                                    </tr>
                                                ))}
                                                {filteredOrders.length === 0 && (
                                                    <tr>
                                                        <td colSpan={5} className="text-center py-4 text-gray-500">
                                                            Không có đơn hàng nào phù hợp.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                {fullOrderDetails && (
                                    <OrderDetailModal
                                        order={fullOrderDetails} // TRUYỀN DỮ LIỆU ĐẦY ĐỦ
                                        onClose={handleCloseModal} // Sử dụng hàm đóng mới
                                    />
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}