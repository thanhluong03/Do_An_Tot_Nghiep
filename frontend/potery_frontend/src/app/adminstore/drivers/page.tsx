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
import { getUserDetail } from "@/api/services/userService";
// --- Interface mở rộng cho việc thống kê ---
interface DriverStats {
    driver: User;
    totalAssigned: number;
    totalDelivering: number;
    totalCompleted: number;
}
const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    // Sử dụng toLocaleString() để hiển thị chi tiết ngày và giờ
    // 'vi-VN' là ngôn ngữ Việt Nam, options để hiển thị đầy đủ ngày/giờ/phút
    return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false // Dùng định dạng 24 giờ
    });
};
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

        case "PENDING_DELIVERY_RETURN":
            text = "Chờ giao hàng đổi trả";
            color = "bg-purple-100 text-purple-800";
            break;

        case "PENDING_DELIVERY":
            text = "Chờ giao hàng";
            color = "bg-orange-100 text-orange-800";
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
    const [adminStoreId, setAdminStoreId] = useState<number | undefined>(undefined);
    const [filterStatus, setFilterStatus] = useState<string>("ALL");
    const [searchName, setSearchName] = useState("");
    const [dateFilter, setDateFilter] = useState("");
    const [fullOrderDetails, setFullOrderDetails] = useState<Order | null>(null);
    const [loadingModal, setLoadingModal] = useState(false);
    // Pagination state
    const [page, setPage] = useState(1);
    const pageSize = 10;
    const getAdminStoreId = async () => {
        const adminId = Number(localStorage.getItem("adminID"));
        if (!adminId) return undefined;
        try {
            const user = await getUserDetail(adminId);
            return user.store_id ?? undefined;
        } catch (err) {
            console.error("Lỗi lấy thông tin admin:", err);
            return undefined;
        }
    };
    // --- Load Drivers ---
    useEffect(() => {
        const loadContextAndDrivers = async () => {
            setLoadingDrivers(true);
            const sId = await getAdminStoreId();
            setAdminStoreId(sId); // Lưu Store ID của Admin

            // 🛑 LẤY TẤT CẢ DRIVERS (Vì giả định không có API lọc)
            // Cần cập nhật lại getAvailableDrivers để nó không nhận tham số lọc
            const res = await getAvailableDrivers();
            setDrivers(res); // Lưu trữ danh sách TẤT CẢ DRIVERS
            setLoadingDrivers(false);
        };
        loadContextAndDrivers();
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
    const filteredDrivers = useMemo(() => {
        // 1. Lọc theo Store ID của admin (nếu admin có storeId)
        let result = drivers;

        if (adminStoreId) {
            result = drivers.filter(d =>
                // Tài xế phải có store_id khớp với adminStoreId
                d.store_id === adminStoreId
                // HOẶC: Nếu adminStoreId là của cửa hàng chính (0) và driver.store_id là null (tuỳ theo logic quản lý)
                // Cần điều chỉnh logic này tùy theo cách bạn gán tài xế cho store
            );
        }

        // 2. Lọc theo tên tìm kiếm
        if (searchName) {
            const lowerCaseSearch = searchName.toLowerCase();
            result = result.filter(d =>
                d.full_name?.toLowerCase().includes(lowerCaseSearch) ||
                d.username?.toLowerCase().includes(lowerCaseSearch)
            );
        }

        return result;
    }, [drivers, adminStoreId, searchName]);

    // --- Lọc Đơn hàng ---
    const filteredOrders = orders.filter(o => {
        if (filterStatus !== "ALL") {
            if (filterStatus === "DELIVERED") {
                if (o.order?.status !== "DELIVERED") return false;
            } else {
                if (o.driver_status !== filterStatus) return false;
            }
        }
        if (dateFilter) {
            const day = o.created_at.split("T")[0];
            if (day !== dateFilter) return false;
        }
        return true;
    });
    // Phân trang
    const totalPages = Math.ceil(filteredOrders.length / pageSize);
    const paginatedOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

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
            <h1 className="text-3xl font-extrabold text-gray-800 mb-6 border-b border-gray-200 pb-2 text-center">Quản lý tài xế giao hàng</h1>

            {/* --- 1. Filter Section --- */}
            <div className="bg-white p-4 rounded-xl shadow-md flex gap-4 mb-8 items-center">
                <input
                    type="text"
                    placeholder="Tìm tên tài xế..."
                    className="input border border-gray-300 rounded p-1 w-full max-w-xs transition duration-150 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    onChange={(e) => setSearchName(e.target.value)}
                    value={searchName}
                />

                <h3 className="text-gray-500 font-medium ml-4">Lọc đơn hàng:</h3>

                <select
                    title="status"
                    className="select select-bordered transition duration-150"
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value={DriverStatus.ACCEPTED}>Đang giao hàng</option>
                    <option value={DriverStatus.WAITING_ACCEPT}>Chờ tài xế nhận</option>
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
                    <h2 className="text-xl font-bold mb-4 text-gray-700">Danh sách tài xế</h2>
                    {loadingDrivers ? (
                        <div className="text-center py-4 text-gray-500">Đang tải tài xế...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr className="bg-gray-50 text-sm text-gray-600 text-left tracking-wider">
                                        <th className="py-3 px-2">STT</th>
                                        <th className="py-3 px-2">Tên Tài Xế</th>
                                        {/* <th className="py-3 px-2">ĐH Đã Gán</th> */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDrivers.map((driver, index) => (
                                        <tr
                                            key={driver.id}
                                            className={`cursor-pointer hover:bg-gray-100 transition duration-150 ${selectedDriver === driver.id ? "bg-blue-50 mr-2 border-l-4 border-blue-600" : ""}`}
                                            onClick={() => handleSelectDriver(driver.id!)}
                                        >
                                            <td className="py-3 px-2 text-sm">{index + 1}</td>
                                            <td className="py-3 px-2 text-sm ">{driver.full_name || driver.username}</td>
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
                                                <tr className="text-sm text-gray-600 tracking-wider bg-gray-50">
                                                    <th className="py-3 px-4 text-center">STT</th>
                                                    <th className="py-3 px-4 text-center">Mã đơn</th>
                                                    <th className="py-3 px-4 text-center">Trạng thái giao hàng</th>
                                                    <th className="py-3 px-4 text-center">Trạng thái đơn hàng</th>
                                                    <th className="py-3 px-4 text-center">Ngày Gán</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedOrders.map((o, idx) => (
                                                    <tr key={o.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                                                        <td className="py-3 px-4 text-center text-sm">{(page - 1) * pageSize + idx + 1}</td>
                                                        <td className="py-3 px-4 text-center text-sm text-gray-800">#{o.order_id}</td>
                                                        <td className="py-3 px-4 text-center">
                                                            <DriverStatusBadge status={o.driver_status} />
                                                        </td>
                                                        <td className="py-3 px-4 text-center">
                                                            <OrderStatusBadge status={o.order?.status} />
                                                        </td>
                                                        <td className="py-3 px-4 text-center text-sm text-gray-500">
                                                            {formatDateTime(o.created_at)}
                                                        </td>
                                                    </tr>
                                                ))}
                                                {paginatedOrders.length === 0 && (
                                                    <tr>
                                                        <td colSpan={6} className="text-center py-4 text-gray-500">
                                                            Không có đơn hàng nào phù hợp.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                        {/* Pagination Controls - styled with arrow icons */}
                                        <div className="flex justify-center items-center mt-4 gap-2">
                                            <button
                                                className={`w-9 h-9 rounded-xl bg-gray-200 flex items-center justify-center ${page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'}`}
                                                onClick={() => setPage(page - 1)}
                                                disabled={page === 1}
                                                aria-label="Trang trước"
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M15 6L9 12L15 18" stroke="#A3A3A3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </button>
                                            {/* Page numbers */}
                                            {Array.from({ length: totalPages }, (_, i) => (
                                                <button
                                                    key={i + 1}
                                                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-base font-semibold transition-all duration-150 ${page === i + 1 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                                    onClick={() => setPage(i + 1)}
                                                >
                                                    {i + 1}
                                                </button>
                                            ))}
                                            <button
                                                className={`w-9 h-9 rounded-xl bg-gray-200 flex items-center justify-center ${page === totalPages || totalPages === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-300'}`}
                                                onClick={() => setPage(page + 1)}
                                                disabled={page === totalPages || totalPages === 0}
                                                aria-label="Trang sau"
                                            >
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M9 6L15 12L9 18" stroke="#A3A3A3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {fullOrderDetails && (
                                    <OrderDetailModal
                                        order={fullOrderDetails}
                                        onClose={handleCloseModal}
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