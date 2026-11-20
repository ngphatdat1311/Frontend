/* ==========================================================
   BLOSSOM BEAUTY STORE – NOTIFICATIONS STORE (FR-12 / T06A668)
   Lưu trữ danh sách thông báo, đánh dấu is_read, đồng bộ Bell Topbar
   ========================================================== */

(function (global) {
    "use strict";

    const STORAGE_KEY = "blossom_notifications_data_v1";

    const INITIAL_NOTIFICATIONS = [
        {
            id: 1,
            type: "approved",
            postId: 128,
            title: "Bài viết đã được phê duyệt! 🎉",
            message: "Bài viết '5 bước dưỡng da cho buổi sáng rạng rỡ' đã được Manager Minh Anh phê duyệt và lên lịch phát hành.",
            time: "2026-11-20T08:30:00",
            time_relative: "15 phút trước",
            is_read: false,
            recipientRole: "STAFF",
            author: "Đoàn Thị Minh Anh (Manager)"
        },
        {
            id: 2,
            type: "revision",
            postId: 126,
            title: "Yêu cầu chỉnh sửa bài viết ✍️",
            message: "Manager yêu cầu chỉnh sửa bài 'Một chút yêu thương cho làn da': Bổ sung thêm hashtag #BlossomCare và chỉnh lại ảnh bìa.",
            time: "2026-11-20T07:45:00",
            time_relative: "1 giờ trước",
            is_read: false,
            recipientRole: "STAFF",
            author: "Đoàn Thị Minh Anh (Manager)"
        },
        {
            id: 3,
            type: "reminder",
            postId: 125,
            title: "Nhắc nhở: Sắp đến giờ xuất bản bài viết ⏰",
            message: "Bài viết 'Chọn serum phù hợp với làn da của bạn' sẽ được đăng sau 30 phút nữa. Vui lòng kiểm tra media sẵn sàng.",
            time: "2026-11-19T18:00:00",
            time_relative: "Hôm qua",
            is_read: false,
            recipientRole: "STAFF",
            author: "Hệ thống Blossom Auto-Scheduler"
        },
        {
            id: 4,
            type: "submitted",
            postId: 127,
            title: "Nhân viên vừa gửi bài viết mới cần duyệt 📋",
            message: "Nhân viên Trần Ngọc Mai vừa gửi duyệt bài 'Bí quyết chăm da mùa hanh khô' cho kênh Facebook & Instagram.",
            time: "2026-11-19T14:15:00",
            time_relative: "Hôm qua",
            is_read: true,
            recipientRole: "MANAGER",
            author: "Trần Ngọc Mai"
        },
        {
            id: 5,
            type: "rejected",
            postId: 124,
            title: "Bài viết bị từ chối phê duyệt ❌",
            message: "Lý do: Nội dung caption chưa đủ 100 từ và hình ảnh sản phẩm chưa có logo nhận diện thương hiệu Blossom.",
            time: "2026-11-18T10:00:00",
            time_relative: "2 ngày trước",
            is_read: true,
            recipientRole: "STAFF",
            author: "Đoàn Thị Minh Anh (Manager)"
        }
    ];

    const NotificationsStore = {
        getNotifications: function () {
            try {
                const data = localStorage.getItem(STORAGE_KEY);
                if (data) {
                    const parsed = JSON.parse(data);
                    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
                }
            } catch (e) {}

            this.saveNotifications(INITIAL_NOTIFICATIONS);
            return INITIAL_NOTIFICATIONS;
        },

        saveNotifications: function (list) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
                window.dispatchEvent(new Event("blossom_notifications_updated"));
                this.syncBellUI();
            } catch (e) {
                console.error("NotificationsStore save error:", e);
            }
        },

        getUnreadCount: function () {
            const list = this.getNotifications();
            const role = (global.Auth && global.Auth.getRole()) || "MANAGER";
            return list.filter(function (n) {
                return !n.is_read && (!n.recipientRole || n.recipientRole === role || n.recipientRole === "ALL");
            }).length;
        },

        markAsRead: function (id) {
            const list = this.getNotifications();
            const item = list.find(function (n) { return n.id === Number(id); });
            if (item && !item.is_read) {
                item.is_read = true;
                this.saveNotifications(list);
            }
            return item;
        },

        markAllAsRead: function () {
            const list = this.getNotifications();
            list.forEach(function (n) { n.is_read = true; });
            this.saveNotifications(list);
        },

        addNotification: function (notif) {
            const list = this.getNotifications();
            const newId = list.length ? Math.max.apply(Math, list.map(function (n) { return n.id; })) + 1 : 1;
            const newNotif = Object.assign({
                id: newId,
                time: new Date().toISOString(),
                time_relative: "Vừa xong",
                is_read: false
            }, notif);
            list.unshift(newNotif);
            this.saveNotifications(list);
            return newNotif;
        },

        syncBellUI: function () {
            const count = this.getUnreadCount();
            const notifDot = document.getElementById("notifDot");
            if (notifDot) {
                notifDot.hidden = (count === 0);
            }

            const bellLink = document.querySelector(".bell");
            if (bellLink) {
                let badge = bellLink.querySelector(".bell-badge");
                if (count > 0) {
                    if (!badge) {
                        badge = document.createElement("span");
                        badge.className = "bell-badge";
                        bellLink.appendChild(badge);
                    }
                    badge.textContent = count > 9 ? "9+" : count;
                } else if (badge) {
                    badge.remove();
                }
            }
        }
    };

    global.NotificationsStore = NotificationsStore;

    document.addEventListener("DOMContentLoaded", function () {
        NotificationsStore.syncBellUI();
    });

    window.addEventListener("blossom_notifications_updated", function () {
        NotificationsStore.syncBellUI();
    });
})(window);
