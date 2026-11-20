/* =========================================================
   PERMISSIONS – Phân quyền truy cập trang giữa Staff và Manager
   Nạp trong <head>, SAU auth.js. Tự chạy guard() ngay khi nạp
   để người không đủ quyền bị chuyển đi trước khi trang kịp hiển thị.

   Quy tắc:
   1. Mỗi thư mục trong /pages/ có role được phép (AREA_ACCESS):
        pages/admin/*  -> chỉ MANAGER
        pages/staff/*  -> chỉ STAFF
        pages/auth/*   -> công khai
   2. Trang nào cần ngoại lệ thì khai báo trong PAGE_ACCESS
      (ưu tiên hơn quy tắc theo thư mục).
   3. Chưa đăng nhập -> về trang login.
      Sai quyền      -> về dashboard của role mình + toast báo lỗi.
   4. Quyền theo chức năng (nút, menu...) khai báo trong FEATURES.

   LƯU Ý: đây là kiểm tra phía giao diện (UX). Khi nối backend,
   API vẫn phải tự kiểm tra role/JWT ở server.
   ========================================================= */
(function (global) {
    "use strict";

    const M = Auth.ROLES.MANAGER;
    const S = Auth.ROLES.STAFF;

    /* ---------- 1. Quy tắc theo thư mục ---------- */
    const AREA_ACCESS = {
        auth: "public",
        admin: [M],
        staff: [S]
    };

    /* ---------- 2. Ngoại lệ theo từng trang ----------
       Cho phép cả Manager và Staff truy cập luồng Bài viết (FR-04/05/06/07),
       Lịch đăng bài (FR-11) và Thông báo (FR-12) để liên kết xuyên suốt.
    */
    const PAGE_ACCESS = {
        "staff/create-post.html": [M, S],
        "staff/edit-post.html":   [M, S],
        "staff/approvals.html":   [M, S],
        "admin/create-post.html": [M, S],
        "admin/edit-post.html":   [M, S],
        "staff/posts.html":       [M, S],
        "admin/posts.html":       [M, S],
        "staff/calendar.html":    [M, S],
        "admin/calendar.html":    [M, S],
        "staff/notifications.html": [M, S],
        "admin/notifications.html": [M]
    };

    /* ---------- 3. Quyền theo chức năng ---------- */
    const FEATURES = {
        "post:create":     [S, M],
        "post:edit":       [S, M],
        "post:delete":     [S, M],
        "post:approve":    [M],
        "report:view":     [M],
        "account:manage":  [M],
        "settings:manage": [M]
    };

    // "/Frontend-main/pages/admin/posts.html" -> "admin/posts.html" (null nếu không nằm trong /pages/)
    function pageKey(pathname) {
        const match = (pathname || location.pathname).match(/\/pages\/([^/]+\/[^/?#]+)$/);
        return match ? match[1] : null;
    }

    function ruleFor(key) {
        if (key in PAGE_ACCESS) return PAGE_ACCESS[key];
        const area = key.split("/")[0];
        return area in AREA_ACCESS ? AREA_ACCESS[area] : null; // thư mục lạ -> từ chối
    }

    function canAccessPage(role, key) {
        const rule = ruleFor(key);
        if (rule === "public") return true;
        return Array.isArray(rule) && rule.indexOf(role) !== -1;
    }

    function can(feature, role) {
        const r = role || Auth.getRole();
        const allowed = FEATURES[feature];
        return !!allowed && allowed.indexOf(r) !== -1;
    }

    function hidePage() {
        document.documentElement.style.visibility = "hidden";
    }

    function guard() {
        const key = pageKey();
        if (key === null) return true;          // không nằm trong /pages/ (vd: index.html)

        if (ruleFor(key) === "public") return true;

        const user = Auth.getUser();

        if (!user) {                            // chưa đăng nhập
            hidePage();
            location.replace(Auth.loginUrl());
            return false;
        }

        if (!canAccessPage(user.role, key)) {   // sai quyền
            Auth.setFlash({
                type: "error",
                title: "Không có quyền truy cập",
                message: "Tài khoản " + Auth.ROLE_LABEL[user.role] + " không được phép vào trang này."
            });
            hidePage();
            location.replace(Auth.homeUrl(user.role));
            return false;
        }

        return true;
    }

    /* Ẩn phần tử trên giao diện theo role / chức năng:
         <button data-roles="MANAGER">...</button>
         <button data-can="post:approve">...</button>
       Gọi lại apply(container) sau khi render HTML động. */
    function apply(root) {
        const scope = root || document;
        const role = Auth.getRole();

        scope.querySelectorAll("[data-roles]").forEach(function (el) {
            const roles = el.dataset.roles.split(",").map(function (r) { return Auth.normalizeRole(r.trim()); });
            if (roles.indexOf(role) === -1) el.remove();
        });

        scope.querySelectorAll("[data-can]").forEach(function (el) {
            if (!can(el.dataset.can, role)) el.remove();
        });
    }

    global.Permissions = { AREA_ACCESS, PAGE_ACCESS, FEATURES, pageKey, canAccessPage, can, guard, apply };

    guard();

    // Nhấn nút Back sau khi đăng xuất: trang lấy từ bộ nhớ đệm -> kiểm tra lại
    window.addEventListener("pageshow", function (e) {
        if (e.persisted) guard();
    });
})(window);
