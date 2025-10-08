"use client";
import React, { useEffect, useState } from "react";
import {
  getVouchers,
  addVoucher,
  updateVoucher,
  deleteVoucher,
  updateVoucherCustomer,
  Voucher,
} from "@/api/services/voucherService";

const initialFormState: Voucher = {
  name: "",
  voucher_percentage: undefined, // ⬅️ SỬA: Dùng undefined thay vì 0
  quantity: undefined,           // ⬅️ SỬA: Dùng undefined thay vì 0
  order_conditions: undefined,   // ⬅️ SỬA: Dùng undefined thay vì 0
  start_time: "",
  end_time: "",
  is_active: true,
};

// ✅ Chuyển từ Date sang input datetime-local
const toDatetimeLocal = (date?: string | Date) => {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

// ✅ Hàm an toàn để hiển thị ngày tháng
const formatDate = (dateString?: string | Date): string => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    // Nếu date string không chuẩn (vd: chỉ là HH:mm:ss)
    if (String(dateString).includes(':')) return String(dateString); 
    return "Ngày không hợp lệ";
  }
  return date.toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric', 
    hour: '2-digit', minute: '2-digit'
  });
};


export default function VoucherPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [form, setForm] = useState<Voucher>(initialFormState);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);

  const fetchVouchers = async () => {
    try {
      const data = await getVouchers();
      console.log("✅ Dữ liệu vouchers nhận được:", data); 
      setVouchers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Lỗi tải voucher:", err);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target;
    
    let newValue: string | number | boolean | undefined = value;

    if (type === "checkbox") {
        newValue = checked;
    } else if (["voucher_percentage", "quantity", "order_conditions"].includes(name)) {
        // ⬅️ SỬA: Đặt thành undefined nếu người dùng xóa input (giá trị là rỗng)
        newValue = value === "" ? undefined : Number(value); 
    }
    
    setForm({
      ...form,
      [name]: newValue,
    });
    setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.name?.trim()) newErrors.name = "Tên không được trống";
    // Kiểm tra số lượng và phần trăm giảm phải là số và lớn hơn 0
    if (form.voucher_percentage === undefined || form.voucher_percentage <= 0)
      newErrors.voucher_percentage = "Phần trăm giảm phải > 0";
    if (form.quantity === undefined || form.quantity <= 0)
      newErrors.quantity = "Số lượng phải > 0";
      
    if (!form.start_time) newErrors.start_time = "Chọn thời gian bắt đầu";
    if (!form.end_time) newErrors.end_time = "Chọn thời gian kết thúc";
    
    if (form.start_time && form.end_time) {
      const s = new Date(form.start_time);
      const e = new Date(form.end_time);
      if (s >= e)
        newErrors.end_time = "Thời gian kết thúc phải sau thời gian bắt đầu";
    }
    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    try {
      if (editingId) {
        await updateVoucher(editingId, form);
        alert("Cập nhật thành công!");
      } else {
        await addVoucher(form);
        alert("Thêm Voucher mới thành công!");
      }
      setForm(initialFormState);
      setEditingId(null);
      await fetchVouchers(); 
    } catch (err) {
      console.error("❌ Lỗi thêm/sửa:", err);
      alert("Có lỗi xảy ra! Vui lòng kiểm tra console hoặc network tab."); 
    }
  };

  const handleEdit = (v: Voucher) => {
    setEditingId(v.id || null);
    setForm({
      ...v,
      // Đảm bảo giá trị là undefined/string rỗng nếu null/0 từ backend
      voucher_percentage: v.voucher_percentage || undefined,
      quantity: v.quantity || undefined,
      order_conditions: v.order_conditions || undefined,

      // Chuyển ngày ISO (effective_period...) sang format datetime-local (start_time/end_time)
      start_time: toDatetimeLocal(v.effective_period_begins || v.start_time),
      end_time: toDatetimeLocal(v.effective_period_ends || v.end_time),
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Xoá voucher này?")) return;
    try {
        await deleteVoucher(id);
        alert("Xóa thành công!");
        await fetchVouchers();
    } catch(err) {
        console.error("❌ Lỗi xóa:", err);
        alert("Lỗi khi xóa voucher!");
    }
  };

  const handleCustomerGetVoucher = async (voucherId: number) => {
    try {
      const res = await updateVoucherCustomer(1, voucherId); 
      alert(res.message);
      await fetchVouchers();
    } catch {
      alert("Lỗi khi nhận voucher");
    }
  };

  const totalPages = Math.ceil(vouchers.length / pageSize);
  const currentItems = vouchers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 mx-auto">
        <h2 className="text-2xl font-bold text-gray-700 mb-6 text-center">
          🎁 Quản lý Voucher
        </h2>

        {/* --- FORM --- */}
        <div
          className={`border p-6 rounded-lg mb-8 ${
            editingId ? "border-yellow-400" : "border-blue-400"
          }`}
        >
          <h3 className="text-xl font-semibold mb-4">
            {editingId ? `Sửa Voucher #${editingId}` : "Thêm Voucher mới"}
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label>Tên</label>
              <input
                name="name"
                value={form.name || ""}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
              {errors.name && (
                <p className="text-red-500 text-xs">{errors.name}</p>
              )}
            </div>
            <div>
              <label>Giảm (%)</label>
              <input
                name="voucher_percentage"
                type="number"
                // ⬅️ HIỂN THỊ: Hiển thị rỗng nếu undefined
                value={form.voucher_percentage === undefined ? "" : form.voucher_percentage}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
               {errors.voucher_percentage && (
                <p className="text-red-500 text-xs">{errors.voucher_percentage}</p>
              )}
            </div>
            <div>
              <label>Số lượng</label>
              <input
                name="quantity"
                type="number"
                // ⬅️ HIỂN THỊ: Hiển thị rỗng nếu undefined
                value={form.quantity === undefined ? "" : form.quantity}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
              {errors.quantity && (
                <p className="text-red-500 text-xs">{errors.quantity}</p>
              )}
            </div>
            <div>
              <label>ĐK đơn hàng</label>
              <input
                name="order_conditions"
                type="number"
                // ⬅️ HIỂN THỊ: Hiển thị rỗng nếu undefined
                value={form.order_conditions === undefined ? "" : form.order_conditions}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label>Thời gian bắt đầu</label>
              <input
                name="start_time"
                type="datetime-local"
                value={form.start_time || ""}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
              {errors.start_time && (
                <p className="text-red-500 text-xs">{errors.start_time}</p>
              )}
            </div>
            <div>
              <label>Thời gian kết thúc</label>
              <input
                name="end_time"
                type="datetime-local"
                value={form.end_time || ""}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              />
              {errors.end_time && (
                <p className="text-red-500 text-xs">{errors.end_time}</p>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center mt-4 border-t pt-4">
            <div>
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active || false}
                onChange={handleChange}
              />
              <label className="ml-2">Kích hoạt</label>
            </div>
            <div className="flex gap-3">
              {editingId && (
                <button
                  onClick={() => {
                    setForm(initialFormState);
                    setEditingId(null);
                    setErrors({}); 
                  }}
                  className="bg-gray-400 px-4 py-2 rounded text-white"
                >
                  Hủy
                </button>
              )}
              <button
                onClick={handleSubmit}
                className={`px-4 py-2 rounded text-white ${
                  editingId ? "bg-yellow-500" : "bg-blue-500"
                }`}
              >
                {editingId ? "Cập nhật" : "Thêm"}
              </button>
            </div>
          </div>
        </div>

        {/* --- DANH SÁCH --- */}
        <h3 className="text-xl font-semibold mb-4">Danh sách Voucher</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2">ID</th>
                <th className="px-4 py-2">Tên</th>
                <th className="px-4 py-2">Giảm (%)</th>
                <th className="px-4 py-2">SL</th>
                <th className="px-4 py-2">ĐK</th>
                <th className="px-4 py-2">Hiệu lực</th>
                <th className="px-4 py-2">Trạng thái</th>
                <th className="px-4 py-2">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((v) => (
                <tr key={v.id} className="border-t">
                  <td className="px-4 py-2">{v.id}</td>
                  <td className="px-4 py-2">{v.name}</td>
                  <td className="px-4 py-2">{v.voucher_percentage}%</td>
                  <td className="px-4 py-2">{v.quantity}</td>
                  <td className="px-4 py-2">
                    {v.order_conditions?.toLocaleString("vi-VN")}
                  </td>
                  <td className="px-4 py-2 text-xs">
                    {formatDate(v.effective_period_begins)} -{" "}
                    {formatDate(v.effective_period_ends)}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        v.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {v.is_active ? "Hoạt động" : "Tạm dừng"}
                    </span>
                  </td>
                  <td className="px-4 py-2 space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => handleEdit(v)}
                      className="text-blue-600 hover:underline"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(v.id!)}
                      className="text-red-600 hover:underline"
                    >
                      Xoá
                    </button>
                    <button
                      onClick={() => handleCustomerGetVoucher(v.id!)}
                      className="text-purple-600 hover:underline"
                    >
                      Nhận
                    </button>
                  </td>
                </tr>
              ))}
              {vouchers.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-4 text-gray-500">
                    Chưa có voucher nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- PHÂN TRANG --- */}
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}