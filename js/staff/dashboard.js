/* =========================================================
   STAFF – Trang Dashboard nhân viên (logic riêng của trang)
   Sidebar / Header / dropdown / đăng xuất / Ctrl+K: js/layout.js
   Component: js/components.js (UI.*)
   Đồng bộ trực tiếp với blossom_posts_fr06_07_v1
   ========================================================= */

(function () {
    "use strict";

    const STORAGE_KEY = "blossom_posts_fr06_07_v1";

    const DEFAULT_POSTS = [
        {
            post_id: 129,
            code: "BL-0129",
            title: "Kem dưỡng trắng da Blossom",
            platforms: ["Instagram"],
            platform_label: "Instagram",
            author: "Doãn Thị Minh Anh",
            status: "PENDING_APPROVAL",
            planned_date: "2026-11-05",
            planned_label: "05/11/2026",
            updated_label: "05/11/2026",
            caption: "Kem dưỡng trắng da Blossom chứa chiết xuất hoa anh đào giúp nâng tông nhẹ nhàng và cấp ẩm sâu.",
            deleted_at: null
        },
        {
            post_id: 128,
            code: "BL-0128",
            title: "5 bước dưỡng da cho buổi sáng rạng rỡ",
            platforms: ["Facebook", "Instagram"],
            platform_label: "Facebook & Instagram",
            author: "Doãn Thị Minh Anh",
            status: "PUBLISHED",
            planned_date: "2026-11-04",
            planned_label: "04/11/2026",
            updated_label: "04/11/2026",
            caption: "Routine 5 bước buổi sáng giúp làn da căng mướt tự nhiên cùng Blossom.",
            deleted_at: null
        },
        {
            post_id: 127,
            code: "BL-0127",
            title: "Bí quyết chăm da mùa hanh khô",
            platforms: ["Facebook", "Instagram"],
            platform_label: "Facebook & Instagram",
            author: "Doãn Thị Minh Anh",
            status: "DRAFT",
            planned_date: "2026-11-07",
            planned_label: "07/11/2026",
            updated_label: "07/11/2026",
            caption: "Cấp ẩm chuyên sâu bảo vệ hàng rào tự nhiên của làn da trong tiết trời thu đông.",
            deleted_at: null
        },
        {
            post_id: 126,
            code: "BL-0126",
            title: "Một chút yêu thương cho làn da",
            platforms: ["Facebook", "Instagram"],
            platform_label: "Facebook & Instagram",
            author: "Doãn Thị Minh Anh",
            status: "REVISION_REQUESTED",
            planned_date: "2026-11-06",
            planned_label: "06/11/2026",
            updated_label: "06/11/2026",
            caption: "Dành 10 phút mỗi tối để thư giãn và phục hồi làn da với mặt nạ hoa hồng.",
            deleted_at: null
        },
        {
            post_id: 125,
            code: "BL-0125",
            title: "Chọn serum phù hợp với làn da của bạn",
            platforms: ["Facebook", "Instagram"],
            platform_label: "Facebook & Instagram",
            author: "Nguyễn Hà Linh",
            status: "DRAFT",
            planned_date: "2026-11-07",
            planned_label: "07/11/2026",
            updated_label: "04/11/2026",
            caption: "Hướng dẫn phân biệt các hoạt chất Hyaluronic Acid, Niacinamide và Vitamin C.",
            deleted_at: null
        },
        {
            post_id: 124,
            code: "BL-0124",
            title: "Chống nắng mỗi ngày, nâng niu làn da",
            platforms: ["Facebook", "Instagram"],
            platform_label: "Facebook & Instagram",
            author: "Phạm Khánh Linh",
            status: "SCHEDULED",
            planned_date: "2026-11-08",
            planned_label: "08/11/2026",
            updated_label: "06/11/2026",
            caption: "Kem chống nắng thuần chay mỏng nhẹ, không để lại vệt trắng.",
            deleted_at: null
        },
        {
            post_id: 123,
            code: "BL-0123",
            title: "Routine tối giản cho ngày bận rộn",
            platforms: ["Facebook", "Instagram", "Threads"],
            platform_label: "Facebook & Instagram",
            author: "Trần Ngọc Mai",
            status: "REJECTED",
            planned_date: "2026-11-03",
            planned_label: "03/11/2026",
            updated_label: "03/11/2026",
            caption: "3 bước gọn nhẹ cho cô nàng công sở bận rộn.",
            deleted_at: null
        },
        {
            post_id: 122,
            code: "BL-0122",
            title: "Review Son Dưỡng Thuần Chay Hương Đào Blossom",
            platforms: ["Threads"],
            platform_label: "Threads",
            author: "Trần Ngọc Mai",
            status: "DRAFT",
            planned_date: "2026-11-10",
            planned_label: "10/11/2026",
            updated_label: "09/11/2026",
            caption: "Video ngắn unbox và swatch bảng màu son dưỡng thu đông.",
            deleted_at: null
        },
        {
            post_id: 121,
            code: "BL-0121",
            title: "Tẩy trang đúng cách giúp ngăn ngừa mụn ẩn",
            platforms: ["Instagram"],
            platform_label: "Instagram",
            author: "Lê Thu Hương",
            status: "APPROVED",
            planned_date: "2026-11-12",
            planned_label: "12/11/2026",
            updated_label: "10/11/2026",
            caption: "Làm sạch kép (Double Cleansing) dịu nhẹ không gây khô căng.",
            deleted_at: null
        },
        {
            post_id: 120,
            code: "BL-0120",
            title: "Ưu đãi Tuần Lễ Hoa Anh Đào - Tặng Kèm Mặt Nạ Ngủ",
            platforms: ["Facebook"],
            platform_label: "Facebook",
            author: "Phạm Khánh Linh",
            status: "PUBLISHED",
            planned_date: "2026-11-01",
            planned_label: "01/11/2026",
            updated_label: "01/11/2026",
            caption: "Quà tặng giới hạn dành cho 200 đơn hàng đầu tiên trong tháng 11.",
            deleted_at: null
        }
    ];

    function loadAllPosts() {
        try {
            const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (Array.isArray(raw) && raw.length) return raw;
        } catch (e) {}
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_POSTS));
        } catch (e) {}
        return DEFAULT_POSTS.slice();
    }

    function isMyPost(post, currentUser) {
        if (!post || !post.author) return false;
        if (!currentUser) return true;
        const myName = (currentUser.fullName || "").toLowerCase().trim();
        const myShort = (Auth.shortName(currentUser) || "").toLowerCase().trim();
        const myUser = (currentUser.username || "").toLowerCase().trim();
        const author = post.author.toLowerCase().trim();

        if (myName && (author === myName || author.includes(myName) || myName.includes(author))) return true;
        if (myShort && (author === myShort || author.includes(myShort) || myShort.includes(author))) return true;
        if (myUser && author === myUser) return true;

        // Minh Anh hoặc Nguyễn Phát Đạt demo
        if (author.includes("minh anh") || author.includes("phát đạt")) return true;
        return false;
    }

    // Map Blossom standard status to components UI status (draft | review | edit | ready | done)
    function mapStatus(s) {
        switch (s) {
            case "DRAFT": return "draft";
            case "PENDING_APPROVAL": return "review";
            case "REVISION_REQUESTED":
            case "REJECTED": return "edit";
            case "SCHEDULED":
            case "APPROVED": return "ready";
            case "PUBLISHED": return "done";
            default: return "draft";
        }
    }

    function renderDashboard() {
        const user = Auth.getUser();
        const all = loadAllPosts();
        const active = all.filter(function (p) { return !p.deleted_at; });

        // Lọc bài viết của riêng nhân viên này
        let myPosts = active.filter(function (p) { return isMyPost(p, user); });
        if (!myPosts.length) {
            // Nếu tài khoản mới chưa có bài, hiển thị các bài mẫu để giao diện hoàn chỉnh
            myPosts = active.slice(0, 4);
        }

        const countStatus = function (st) {
            return myPosts.filter(function (p) { return mapStatus(p.status) === st; }).length;
        };

        const total = myPosts.length;
        const done = countStatus("done");
        const review = countStatus("review");
        const edit = countStatus("edit");
        const ready = countStatus("ready");

        // 1. WELCOME + PROGRESS
        const now = new Date();
        const weekday = now.toLocaleDateString("vi-VN", { weekday: "long" });
        const greetingEl = document.getElementById("greeting");
        const todayTextEl = document.getElementById("todayText");
        const monthChipEl = document.getElementById("monthChip");

        if (greetingEl) greetingEl.textContent = "Xin chào, " + Auth.shortName(user) + "!";
        if (todayTextEl) {
            todayTextEl.textContent = weekday + ", " + now.toLocaleDateString("vi-VN") + " · Cùng hoàn thành những nội dung thật chỉn chu hôm nay.";
        }
        if (monthChipEl) {
            monthChipEl.textContent = "Tháng " + (now.getMonth() + 1) + " / " + now.getFullYear();
        }

        const percent = total ? Math.round((done / total) * 100) : 0;
        const progPercentEl = document.getElementById("progressPercent");
        const progCountEl = document.getElementById("progressCount");
        const progFillEl = document.getElementById("progressFill");

        if (progPercentEl) progPercentEl.textContent = percent + "%";
        if (progCountEl) progCountEl.textContent = done + " / " + total + " bài viết đã xuất bản";
        if (progFillEl) {
            requestAnimationFrame(function () {
                progFillEl.style.width = percent + "%";
            });
        }

        // 2. STATS CARDS
        const statsEl = document.getElementById("stats");
        if (statsEl) {
            const stats = [
                {
                    icon: "doc",
                    tone: "pink",
                    label: "Bài viết của tôi",
                    value: UI.pad(total),
                    note: "Tổng bài bạn đã tạo"
                },
                {
                    icon: "clock",
                    tone: "orange",
                    label: "Chờ duyệt",
                    value: UI.pad(review),
                    note: "Đang chờ Manager phê duyệt"
                },
                {
                    icon: "edit",
                    tone: "purple",
                    label: "Cần chỉnh sửa",
                    value: UI.pad(edit),
                    note: "Cần hoàn thiện lại"
                },
                {
                    icon: "check",
                    tone: "green",
                    label: "Đã xuất bản",
                    value: UI.pad(done),
                    note: "Đã chia sẻ đến khách hàng"
                }
            ];
            statsEl.innerHTML = stats.map(UI.statCard).join("");
        }

        // 3. TASKS (Công việc cần theo dõi)
        // Ưu tiên: cần sửa > chờ duyệt > nháp > sẵn sàng; bỏ bài đã xuất bản
        const priorityOrder = { edit: 0, review: 1, draft: 2, ready: 3, done: 4 };
        const pendingTasks = myPosts
            .filter(function (p) { return mapStatus(p.status) !== "done"; })
            .sort(function (a, b) {
                return (priorityOrder[mapStatus(a.status)] || 0) - (priorityOrder[mapStatus(b.status)] || 0);
            })
            .slice(0, 5);

        window.__staffTasks = pendingTasks;
        renderTasks(pendingTasks);

        // 4. SCHEDULE (Lịch đăng sắp tới)
        const upcoming = myPosts
            .filter(function (p) {
                const ms = mapStatus(p.status);
                return ms === "ready" || ms === "review";
            })
            .sort(function (a, b) {
                return (a.planned_date || "").localeCompare(b.planned_date || "");
            })
            .slice(0, 4);

        const scheduleEl = document.getElementById("scheduleList");
        if (scheduleEl) {
            if (upcoming.length) {
                scheduleEl.innerHTML = upcoming.map(function (p) {
                    const d = p.planned_date ? new Date(p.planned_date + "T09:00:00") : now;
                    const plat = p.platform_label || (Array.isArray(p.platforms) ? p.platforms.join(" & ") : "Mạng xã hội");
                    return '<div class="schedule-item">' +
                        '<div class="date-box"><b>' + UI.pad(d.getDate()) + '</b><small>TH ' + (d.getMonth() + 1) + '</small></div>' +
                        '<div class="schedule-info"><b>' + UI.esc(p.title) + '</b>' +
                        '<small>09:00 · ' + UI.esc(plat) + '</small></div>' +
                    '</div>';
                }).join("");
            } else {
                scheduleEl.innerHTML = '<p class="empty-message">Chưa có bài nào được lên lịch.</p>';
            }
        }
    }

    function renderTasks(list) {
        const el = document.getElementById("taskList");
        if (!el) return;
        if (!list.length) {
            el.innerHTML = '<p class="empty-message">Không có công việc nào cần xử lý lúc này.</p>';
            return;
        }
        el.innerHTML = list.map(function (t) {
            const plat = t.platform_label || (Array.isArray(t.platforms) ? t.platforms.join(" & ") : "Mạng xã hội");
            const dateStr = t.planned_label || t.planned_date || "Hôm nay";
            const ms = mapStatus(t.status);
            return '<a href="posts.html" class="task" title="Xem bài viết trong danh sách">' +
                '<div><b>' + UI.esc(t.title) + '</b><small>' + UI.esc(plat) + ' · ' + UI.esc(dateStr) + '</small></div>' +
                UI.statusBadge(ms) +
            '</a>';
        }).join("");
    }

    // Bind Topbar Search
    function bindSearch() {
        const searchInput = document.getElementById("searchInput");
        if (searchInput) {
            searchInput.addEventListener("input", function () {
                const k = searchInput.value.toLowerCase().trim();
                const tasks = window.__staffTasks || [];
                if (!k) {
                    renderTasks(tasks);
                    return;
                }
                const filtered = tasks.filter(function (p) {
                    const stObj = UI.POST_STATUS[mapStatus(p.status)] || {};
                    return [p.title, p.platform_label, stObj.label || ""].some(function (v) {
                        return (v || "").toLowerCase().includes(k);
                    });
                });
                renderTasks(filtered);
            });
        }

        // Listen for storage changes
        window.addEventListener("blossom_posts_updated", renderDashboard);
        window.addEventListener("storage", function (e) {
            if (e.key === STORAGE_KEY) renderDashboard();
        });
    }

    renderDashboard();
    bindSearch();
})();