/* ==========================================================
   BLOSSOM BEAUTY STORE – NOTIFICATIONS PAGE LOGIC (FR-12 / T06A668)
   Danh sách thông báo, tab lọc, đánh dấu is_read, mở Post Detail Modal
   ========================================================== */

(function () {
    "use strict";

    let activeTab = "ALL"; // 'ALL' | 'UNREAD' | 'APPROVAL' | 'SYSTEM'

    function formatRelative(isoStr) {
        if (!isoStr) return "Vừa xong";
        try {
            const d = new Date(isoStr);
            const now = new Date();
            const diffMin = Math.round((now - d) / 60000);
            if (diffMin < 1) return "Vừa xong";
            if (diffMin < 60) return diffMin + " phút trước";
            const diffHours = Math.round(diffMin / 60);
            if (diffHours < 24) return diffHours + " giờ trước";
            return d.toLocaleDateString("vi-VN");
        } catch (e) {
            return isoStr;
        }
    }

    function getFilteredList() {
        if (!window.NotificationsStore) return [];
        const all = window.NotificationsStore.getNotifications();
        const role = (window.Auth && window.Auth.getRole()) || "MANAGER";

        return all.filter(function (n) {
            // Role filter
            if (n.recipientRole && n.recipientRole !== role && n.recipientRole !== "ALL") {
                return false;
            }

            if (activeTab === "UNREAD") return !n.is_read;
            if (activeTab === "APPROVAL") return n.type === "approved" || n.type === "rejected" || n.type === "revision" || n.type === "submitted";
            if (activeTab === "SYSTEM") return n.type === "system" || n.type === "reminder" || n.type === "published";
            return true;
        });
    }

    function renderNotifications() {
        const container = document.getElementById("notifListContainer");
        if (!container) return;

        const list = getFilteredList();

        if (!list.length) {
            container.innerHTML =
                '<div style="text-align:center;padding:56px 20px;color:var(--muted);">' +
                    UI.icon("bell") +
                    '<div style="font-size:15px;margin-top:8px;">Không có thông báo nào trong danh mục này.</div>' +
                '</div>';
            return;
        }

        container.innerHTML = list.map(function (n) {
            let iconBoxClass = "system";
            let iconSvg = UI.icon("bell");

            if (n.type === "approved") {
                iconBoxClass = "approved";
                iconSvg = UI.icon("tick");
            } else if (n.type === "revision") {
                iconBoxClass = "revision";
                iconSvg = UI.icon("edit");
            } else if (n.type === "rejected") {
                iconBoxClass = "rejected";
                iconSvg = UI.icon("close");
            } else if (n.type === "reminder") {
                iconBoxClass = "reminder";
                iconSvg = UI.icon("clock");
            } else if (n.type === "submitted") {
                iconBoxClass = "submitted";
                iconSvg = UI.icon("clipboard");
            }

            const unreadClass = n.is_read ? "" : " unread";
            const timeText = n.time_relative || formatRelative(n.time);

            return (
                '<div class="notif-item' + unreadClass + '" data-notif-id="' + n.id + '" data-post-id="' + (n.postId || '') + '">' +
                    '<div class="notif-icon-box ' + iconBoxClass + '">' + iconSvg + '</div>' +
                    '<div class="notif-content">' +
                        '<div class="notif-title-row">' +
                            '<span class="notif-title">' + UI.esc(n.title) + '</span>' +
                            '<span class="notif-time">' + UI.esc(timeText) + '</span>' +
                        '</div>' +
                        '<p class="notif-msg">' + UI.esc(n.message) + '</p>' +
                        '<div class="notif-meta">' +
                            '<span>Gửi bởi: <b>' + UI.esc(n.author || "Hệ thống Blossom") + '</b></span>' +
                            (n.postId ? '<span style="color:var(--pink);font-weight:600;">· Nhấn để xem chi tiết bài viết →</span>' : '') +
                        '</div>' +
                    '</div>' +
                '</div>'
            );
        }).join("");
    }

    function bindEvents() {
        // Tab switching
        document.querySelectorAll("[data-notif-tab]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                activeTab = btn.dataset.notifTab;
                document.querySelectorAll("[data-notif-tab]").forEach(function (b) {
                    b.classList.toggle("active", b === btn);
                });
                renderNotifications();
            });
        });

        // Mark all as read
        const markAllBtn = document.getElementById("btnMarkAllRead");
        if (markAllBtn) {
            markAllBtn.addEventListener("click", function () {
                if (window.NotificationsStore) {
                    window.NotificationsStore.markAllAsRead();
                    renderNotifications();
                    UI.toast("success", "Đã đánh dấu tất cả đã đọc", "Toàn bộ thông báo đã được cập nhật trạng thái đã đọc.");
                }
            });
        }

        // Click on notification item
        const container = document.getElementById("notifListContainer");
        if (container) {
            container.addEventListener("click", function (e) {
                const item = e.target.closest("[data-notif-id]");
                if (!item) return;

                const notifId = Number(item.dataset.notifId);
                const postId = item.dataset.postId ? Number(item.dataset.postId) : null;

                if (window.NotificationsStore) {
                    window.NotificationsStore.markAsRead(notifId);
                    item.classList.remove("unread");
                }

                if (postId && window.openPostDetailModal) {
                    window.openPostDetailModal(postId);
                }
            });
        }

        window.addEventListener("blossom_notifications_updated", function () {
            renderNotifications();
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        renderNotifications();
        bindEvents();
    });
})();
