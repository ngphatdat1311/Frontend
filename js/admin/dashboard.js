/* =========================================================
   MANAGER – Trang Tiến độ bài viết (logic riêng của trang)
   Sidebar / Header / dropdown / đăng xuất: js/layout.js
   Component: js/components.js (UI.*)
   Đồng bộ dữ liệu thời gian thực với blossom_posts_fr06_07_v1
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
        } catch (e) {
            /* ignore */
        }
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_POSTS));
        } catch (e) {}
        return DEFAULT_POSTS.slice();
    }

    let allPosts = loadAllPosts();
    let currentAuthorFilter = "ALL";
    let currentCampaignFilter = "ALL";
    let currentTab = "board"; // "board" | "members"

    function getActiveFilteredPosts() {
        return allPosts.filter(function (p) {
            if (p.deleted_at) return false;
            if (currentAuthorFilter !== "ALL" && p.author !== currentAuthorFilter) {
                return false;
            }
            if (currentCampaignFilter !== "ALL") {
                const hay = (p.title + " " + (p.caption || "")).toLowerCase();
                const needle = currentCampaignFilter.toLowerCase();
                if (!hay.includes(needle)) return false;
            }
            return true;
        });
    }

    // ==============================
    // STATISTICS
    // ==============================
    function renderStats(activePosts) {
        const statsEl = document.getElementById("stats");
        if (!statsEl) return;

        const totalActive = activePosts.length;
        const publishedCount = activePosts.filter(function (p) { return p.status === "PUBLISHED"; }).length;
        const readyCount = activePosts.filter(function (p) { return p.status === "SCHEDULED" || p.status === "APPROVED"; }).length;
        const reviewCount = activePosts.filter(function (p) { return p.status === "PENDING_APPROVAL"; }).length;
        const editCount = activePosts.filter(function (p) { return p.status === "REVISION_REQUESTED" || p.status === "REJECTED"; }).length;

        // Quá hạn: ngày đăng nhỏ hơn hôm nay và chưa xuất bản
        const todayIso = new Date().toISOString().split("T")[0];
        const overdueCount = activePosts.filter(function (p) {
            return p.status !== "PUBLISHED" && p.planned_date && p.planned_date < todayIso;
        }).length;

        const planPercent = totalActive ? Math.round((publishedCount / totalActive) * 100) : 0;
        const onSchedulePercent = totalActive ? Math.round(((publishedCount + readyCount) / totalActive) * 100) : 0;

        const statItems = [
            {
                icon: "doc",
                tone: "pink",
                label: "Hoàn thành kế hoạch",
                value: planPercent + "%",
                note: publishedCount + " / " + totalActive + " bài đã xuất bản"
            },
            {
                icon: "check",
                tone: "green",
                label: "Đúng tiến độ",
                value: onSchedulePercent + "%",
                note: readyCount + " bài sẵn sàng phát hành",
                noteTone: "green"
            },
            {
                icon: "clock",
                tone: "orange",
                label: "Cần xử lý hôm nay",
                value: UI.pad(reviewCount + editCount),
                note: reviewCount + " bài duyệt · " + editCount + " chỉnh sửa",
                noteTone: "pink"
            },
            {
                icon: "alert",
                tone: "pink",
                label: "Quá hạn",
                value: UI.pad(overdueCount),
                note: overdueCount > 0 ? "Cần ưu tiên xử lý ngay" : "Không có bài quá hạn",
                noteTone: overdueCount > 0 ? "pink" : "green"
            }
        ];

        statsEl.innerHTML = statItems.map(UI.statCard).join("");
    }

    // ==============================
    // KANBAN BOARD
    // ==============================
    function renderBoard(activePosts) {
        const boardEl = document.getElementById("board");
        if (!boardEl) return;

        if (currentTab === "members") {
            renderMembersView(activePosts, boardEl);
            return;
        }

        const draftPosts = activePosts.filter(function (p) { return p.status === "DRAFT"; });
        const reviewPosts = activePosts.filter(function (p) { return p.status === "PENDING_APPROVAL"; });
        const editPosts = activePosts.filter(function (p) { return p.status === "REVISION_REQUESTED" || p.status === "REJECTED"; });
        const readyPosts = activePosts.filter(function (p) { return p.status === "SCHEDULED" || p.status === "APPROVED"; });

        const columns = [
            {
                cls: "draft",
                title: "Bản nháp",
                empty: "Không có bản nháp",
                posts: draftPosts,
                seeAllHref: "posts.html?status=DRAFT"
            },
            {
                cls: "review",
                title: "Chờ duyệt",
                empty: "Không có bài chờ duyệt",
                posts: reviewPosts,
                seeAllHref: "approvals.html"
            },
            {
                cls: "edit",
                title: "Đang chỉnh sửa",
                empty: "Không có bài cần sửa",
                posts: editPosts,
                seeAllHref: "posts.html?status=REVISION_REQUESTED"
            },
            {
                cls: "ready",
                title: "Sẵn sàng đăng",
                empty: "Không có bài đã lên lịch",
                posts: readyPosts,
                seeAllHref: "calendar.html"
            }
        ];

        boardEl.innerHTML = columns.map(function (column) {
            const cardsHtml = column.posts.length
                ? column.posts.map(function (post) {
                    const plat = post.platform_label || (Array.isArray(post.platforms) ? post.platforms.join(" & ") : "Mạng xã hội");
                    return '<div class="post" data-post-id="' + post.post_id + '" role="button" tabindex="0" title="Nhấn để xem chi tiết bài viết">' +
                        '<b>' + UI.esc(post.title) + '</b>' +
                        '<small>' + UI.esc(post.author) + ' · ' + UI.esc(plat) + '</small>' +
                    '</div>';
                }).join("")
                : UI.emptyState({ text: column.empty });

            return '<div class="kb-col ' + column.cls + '">' +
                '<div class="kb-head">' +
                    '<h3>' + UI.esc(column.title) + '</h3>' +
                    '<span class="count">' + UI.pad(column.posts.length) + '</span>' +
                '</div>' +
                '<div class="cards">' + cardsHtml + '</div>' +
                '<a href="' + column.seeAllHref + '" class="see-all">Xem tất cả ' + column.posts.length + ' bài viết →</a>' +
            '</div>';
        }).join("");
    }

    function renderMembersView(activePosts, boardEl) {
        const authors = [];
        activePosts.forEach(function (p) {
            if (p.author && !authors.includes(p.author)) authors.push(p.author);
        });

        if (!authors.length) {
            boardEl.innerHTML = '<div style="grid-column:1/-1;padding:40px;text-align:center;background:#fff;border-radius:16px;">' +
                UI.emptyState({ text: "Chưa có thành viên nào tạo bài viết." }) + '</div>';
            return;
        }

        boardEl.innerHTML = authors.map(function (author) {
            const authorPosts = activePosts.filter(function (p) { return p.author === author; });
            const cardsHtml = authorPosts.map(function (post) {
                const plat = post.platform_label || (Array.isArray(post.platforms) ? post.platforms.join(" & ") : "Mạng xã hội");
                return '<div class="post" data-post-id="' + post.post_id + '" role="button" tabindex="0">' +
                    '<b>' + UI.esc(post.title) + '</b>' +
                    '<small>' + UI.esc(plat) + ' · Lịch: ' + UI.esc(post.planned_label || post.planned_date) + '</small>' +
                '</div>';
            }).join("");

            return '<div class="kb-col draft">' +
                '<div class="kb-head">' +
                    '<h3>' + UI.esc(author) + '</h3>' +
                    '<span class="count">' + UI.pad(authorPosts.length) + '</span>' +
                '</div>' +
                '<div class="cards">' + cardsHtml + '</div>' +
                '<a href="posts.html?author=' + encodeURIComponent(author) + '" class="see-all">Xem danh sách của ' + UI.esc(author) + ' →</a>' +
            '</div>';
        }).join("");
    }

    // ==============================
    // PRIORITY BANNER
    // ==============================
    function updatePriorityBanner(activePosts) {
        const titleEl = document.getElementById("priorityTitle");
        const descEl = document.getElementById("priorityDesc");
        const linkEl = document.getElementById("priorityLink");
        if (!titleEl || !descEl || !linkEl) return;

        const todayIso = new Date().toISOString().split("T")[0];
        const overdue = activePosts.filter(function (p) {
            return p.status !== "PUBLISHED" && p.planned_date && p.planned_date < todayIso;
        });
        const pending = activePosts.filter(function (p) {
            return p.status === "PENDING_APPROVAL";
        });

        if (overdue.length > 0) {
            titleEl.textContent = "Ưu tiên hôm nay: Có " + overdue.length + " bài viết quá hạn";
            descEl.textContent = "Có " + overdue.length + " bài viết đã quá hạn lịch đăng ban đầu. Quản lý cần kiểm tra và phân công lên lại lịch phát hành.";
            linkEl.textContent = "Kiểm tra ngay";
            linkEl.href = "calendar.html";
        } else if (pending.length > 0) {
            titleEl.textContent = "Cần phê duyệt: " + pending.length + " bài viết chờ duyệt";
            descEl.textContent = "Đội ngũ sáng tạo đã gửi " + pending.length + " bài viết mới. Vui lòng duyệt bài để kịp thời gian phát hành theo kế hoạch.";
            linkEl.textContent = "Duyệt bài viết";
            linkEl.href = "approvals.html";
        } else {
            titleEl.textContent = "Tiến độ hôm nay rất tốt!";
            descEl.textContent = "Tất cả các bài viết đều đang được thực hiện theo đúng kế hoạch và tiến độ đã định.";
            linkEl.textContent = "Xem tất cả bài";
            linkEl.href = "posts.html";
        }
    }

    // ==============================
    // POPULATE FILTERS
    // ==============================
    function populateAuthorFilter() {
        const sel = document.getElementById("filterAuthor");
        if (!sel) return;

        const authors = [];
        allPosts.forEach(function (p) {
            if (p.author && !authors.includes(p.author)) authors.push(p.author);
        });

        sel.innerHTML = '<option value="ALL">Tất cả tác giả</option>' +
            authors.map(function (a) {
                return '<option value="' + UI.esc(a) + '">' + UI.esc(a) + '</option>';
            }).join("");
    }

    // ==============================
    // OPEN DETAIL MODAL / EDIT
    // ==============================
    function handlePostClick(postId) {
        if (window.PostDetailModal && typeof window.PostDetailModal.open === "function") {
            window.PostDetailModal.open(postId);
            return;
        }
        if (typeof window.openPostDetailModal === "function") {
            window.openPostDetailModal(postId);
            return;
        }
        // Fallback: điều hướng xem chi tiết tại posts.html
        location.href = "posts.html?view=" + encodeURIComponent(postId);
    }

    // ==============================
    // EVENT BINDINGS
    // ==============================
    function bindEvents() {
        // Author Filter
        const authorSel = document.getElementById("filterAuthor");
        if (authorSel) {
            authorSel.addEventListener("change", function () {
                currentAuthorFilter = authorSel.value;
                refreshUI();
            });
        }

        // Campaign Filter
        const campSel = document.getElementById("filterCampaign");
        if (campSel) {
            campSel.addEventListener("change", function () {
                currentCampaignFilter = campSel.value;
                refreshUI();
            });
        }

        // Tabs (Bảng tiến độ vs Theo thành viên)
        const tabProgress = document.getElementById("tabProgress");
        const tabMembers = document.getElementById("tabMembers");
        if (tabProgress && tabMembers) {
            tabProgress.addEventListener("click", function () {
                currentTab = "board";
                tabProgress.classList.add("active");
                tabMembers.classList.remove("active");
                refreshUI();
            });
            tabMembers.addEventListener("click", function () {
                currentTab = "members";
                tabMembers.classList.add("active");
                tabProgress.classList.remove("active");
                refreshUI();
            });
        }

        // Board Card Click
        const boardEl = document.getElementById("board");
        if (boardEl) {
            boardEl.addEventListener("click", function (e) {
                const card = e.target.closest(".post[data-post-id]");
                if (card) {
                    handlePostClick(Number(card.dataset.postId));
                }
            });
            boardEl.addEventListener("keydown", function (e) {
                if (e.key === "Enter" || e.key === " ") {
                    const card = e.target.closest(".post[data-post-id]");
                    if (card) {
                        e.preventDefault();
                        handlePostClick(Number(card.dataset.postId));
                    }
                }
            });
        }

        // Realtime Storage Sync
        window.addEventListener("blossom_posts_updated", function () {
            allPosts = loadAllPosts();
            refreshUI();
        });
        window.addEventListener("storage", function (e) {
            if (e.key === STORAGE_KEY) {
                allPosts = loadAllPosts();
                refreshUI();
            }
        });
    }

    function refreshUI() {
        const filtered = getActiveFilteredPosts();
        renderStats(filtered);
        renderBoard(filtered);
        updatePriorityBanner(filtered);
    }

    // Initialize
    populateAuthorFilter();
    refreshUI();
    bindEvents();
})();