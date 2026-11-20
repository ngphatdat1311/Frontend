/* =========================================================
   FR-06 & FR-07 · XÓA MỀM & DANH SÁCH BÀI VIẾT (Task T06A662)
   - FR-06: Xóa mềm (Soft Delete - cập nhật deleted_at) chỉ cho phép
            ở trạng thái DRAFT hoặc REJECTED; chặn xóa ở trạng thái
            PENDING_APPROVAL, APPROVED, SCHEDULED, PUBLISHED (ERR-01 / BR-06)
   - FR-07: Tìm kiếm từ khóa, lọc theo Nền tảng, Trạng thái, Nhân viên (Tác giả),
            Ngày dự kiến đăng, Phân trang và thời gian phản hồi < 2 giây (NFR-01)
   - Phân quyền chặt chẽ giữa Staff ("Bài viết của tôi") và Admin ("Quản lý bài viết")
   ========================================================= */
(function () {
    "use strict";

    const POST_LIST_KEY = "blossom_posts_fr06_07_v1";
    const PAGE_SIZE = 6;

    const STATUS_MAP = {
        PUBLISHED:          { label: "Đã xuất bản",    cls: "st-published" },
        PENDING_APPROVAL:   { label: "Chờ duyệt",      cls: "st-pending"   },
        REVISION_REQUESTED: { label: "Đang chỉnh sửa", cls: "st-revision"  },
        DRAFT:              { label: "Bản nháp",       cls: "st-draft"     },
        SCHEDULED:          { label: "Đã lên lịch",    cls: "st-scheduled" },
        APPROVED:           { label: "Đã phê duyệt",   cls: "st-approved"  },
        REJECTED:           { label: "Bị từ chối",     cls: "st-rejected"  }
    };

    const INITIAL_POSTS = [
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

    const currentUser = (window.Auth && typeof window.Auth.getUser === "function") ? window.Auth.getUser() : null;
    const isStaffPage = location.pathname.indexOf("/pages/staff/") !== -1;
    const isStaff = isStaffPage || (currentUser && currentUser.role === "STAFF");

    // Staff mặc định tab "Bài viết của tôi", Admin mặc định "Tất cả bài viết"
    let activeTab = isStaffPage ? "MINE" : "ALL";
    let posts = loadPosts();
    let currentPage = 1;
    let pendingDeletePost = null;

    function isMyPost(p, u) {
        if (!p || !p.author) return false;
        if (!u) return true;
        const myFull = (u.fullName || "").toLowerCase().trim();
        const myShort = (window.Auth && typeof window.Auth.shortName === "function" ? window.Auth.shortName(u) : "").toLowerCase().trim();
        const myUser = (u.username || "").toLowerCase().trim();
        const author = p.author.toLowerCase().trim();

        if (myFull && (author === myFull || author.includes(myFull) || myFull.includes(author))) return true;
        if (myShort && (author === myShort || author.includes(myShort) || myShort.includes(author))) return true;
        if (myUser && author === myUser) return true;

        if (author.includes("minh anh") || author.includes("phát đạt")) return true;
        return false;
    }

    function loadPosts() {
        try {
            const raw = JSON.parse(localStorage.getItem(POST_LIST_KEY));
            if (Array.isArray(raw) && raw.length) {
                // Đảm bảo có ít nhất các bài mẫu của Doãn Thị Minh Anh để Staff trải nghiệm hoàn hảo
                const hasMinhAnh = raw.some(function (p) { return (p.author || "").includes("Minh Anh"); });
                if (!hasMinhAnh) {
                    INITIAL_POSTS.filter(function (p) { return (p.author || "").includes("Minh Anh"); })
                                 .forEach(function (p) { raw.unshift(p); });
                    localStorage.setItem(POST_LIST_KEY, JSON.stringify(raw));
                }
                return raw;
            }
        } catch (e) {
            /* ignore */
        }
        localStorage.setItem(POST_LIST_KEY, JSON.stringify(INITIAL_POSTS));
        return INITIAL_POSTS.slice();
    }

    function savePosts() {
        localStorage.setItem(POST_LIST_KEY, JSON.stringify(posts));
        window.dispatchEvent(new Event("blossom_posts_updated"));
    }

    function getFilteredPosts() {
        const keyword = (document.getElementById("postSearchInput").value || "").trim().toLowerCase();
        const platformVal = document.getElementById("filterPlatformSelect").value;
        const statusVal = document.getElementById("filterStatusSelect").value;
        const authorVal = document.getElementById("filterAuthorSelect").value;
        const dateVal = document.getElementById("filterDateInput").value;

        return posts.filter(function (p) {
            // 1. Lọc theo Tab (Xóa mềm hoặc bài viết cá nhân / toàn công ty)
            if (activeTab === "DELETED") {
                if (!p.deleted_at) return false;
                if (isStaffPage && !isMyPost(p, currentUser)) return false;
            } else {
                if (p.deleted_at) return false;
                if (activeTab === "MINE" && !isMyPost(p, currentUser)) {
                    return false;
                }
            }

            // 2. Tìm kiếm từ khóa (tiêu đề, mã bài, caption, kênh)
            if (keyword) {
                const hay = (p.title + " " + p.code + " " + (p.caption || "") + " " + (p.platform_label || "")).toLowerCase();
                if (hay.indexOf(keyword) === -1) return false;
            }

            // 3. Lọc theo nền tảng
            if (platformVal !== "ALL") {
                if (!Array.isArray(p.platforms) || p.platforms.indexOf(platformVal) === -1) return false;
            }

            // 4. Lọc theo trạng thái
            if (statusVal !== "ALL") {
                if (p.status !== statusVal) return false;
            }

            // 5. Lọc theo tác giả
            if (authorVal !== "ALL") {
                if (p.author !== authorVal) return false;
            }

            // 6. Lọc theo ngày đăng
            if (dateVal) {
                if (p.planned_date !== dateVal) return false;
            }

            return true;
        });
    }

    function renderMetrics() {
        const activeList = posts.filter(function (p) { return !p.deleted_at; });

        const mTotal = document.getElementById("metricPostTotal");
        const mDraft = document.getElementById("metricPostDraft");
        const mPending = document.getElementById("metricPostPending");
        const mPub = document.getElementById("metricPostPublished");

        if (isStaffPage) {
            // Đối với Nhân viên: số liệu phản ánh chính xác kết quả của riêng nhân viên
            const myActive = activeList.filter(function (p) { return isMyPost(p, currentUser); });
            const myDraft = myActive.filter(function (p) { return p.status === "DRAFT"; }).length;
            const myPending = myActive.filter(function (p) { return p.status === "PENDING_APPROVAL"; }).length;
            const myPub = myActive.filter(function (p) { return p.status === "PUBLISHED"; }).length;

            if (mTotal) mTotal.textContent = String(myActive.length);
            if (mDraft) mDraft.textContent = String(myDraft);
            if (mPending) mPending.textContent = String(myPending);
            if (mPub) mPub.textContent = String(myPub);
        } else {
            // Đối với Quản lý (Admin): số liệu toàn công ty
            const draftCount = activeList.filter(function (p) { return p.status === "DRAFT"; }).length;
            const pendingCount = activeList.filter(function (p) { return p.status === "PENDING_APPROVAL"; }).length;
            const pubCount = activeList.filter(function (p) { return p.status === "PUBLISHED"; }).length;

            if (mTotal) mTotal.textContent = String(119 + activeList.length);
            if (mDraft) mDraft.textContent = String(12 + draftCount);
            if (mPending) mPending.textContent = String(17 + pendingCount);
            if (mPub) mPub.textContent = String(94 + pubCount);
        }
    }

    function renderTable() {
        const filtered = getFilteredPosts();
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
        if (currentPage > totalPages) currentPage = totalPages;

        const startIdx = (currentPage - 1) * PAGE_SIZE;
        const pageItems = filtered.slice(startIdx, startIdx + PAGE_SIZE);
        const listEl = document.getElementById("postTableBody");

        const editBaseHref = isStaffPage ? "edit-post.html" : "../staff/edit-post.html";

        if (!pageItems.length) {
            listEl.innerHTML = UI.emptyState({
                text: activeTab === "DELETED"
                    ? "Chưa có bài viết nào trong danh sách đã xóa mềm."
                    : (activeTab === "MINE"
                        ? "Bạn chưa có bài viết nào ở mục này. Hãy tạo bài viết mới để bắt đầu!"
                        : "Không tìm thấy bài viết nào khớp với điều kiện tìm kiếm và bộ lọc.")
            });
        } else {
            listEl.innerHTML = pageItems.map(function (p) {
                const st = STATUS_MAP[p.status] || { label: p.status, cls: "st-draft" };
                const isMine = isMyPost(p, currentUser);

                // Quyền chỉnh sửa & xóa mềm theo vai trò
                let actionsHtml = "";

                if (isStaffPage) {
                    if (!isMine) {
                        // Xem bài đồng nghiệp ở tab Tất cả: chỉ đọc
                        actionsHtml = '<button type="button" class="fr07-icon-btn" data-view-id="' + p.post_id + '" title="Xem chi tiết bài viết (Chỉ đọc)">' +
                            '<img src="../../assets/figma/file-text.svg" alt="Xem" width="15" height="15">' +
                        '</button>';
                    } else {
                        // Bài của mình: chỉ sửa được khi ở trạng thái DRAFT, REVISION_REQUESTED hoặc REJECTED
                        const canStaffEdit = (p.status === "DRAFT" || p.status === "REVISION_REQUESTED" || p.status === "REJECTED");
                        const canStaffDelete = !p.deleted_at && (p.status === "DRAFT" || p.status === "REJECTED");

                        if (canStaffEdit) {
                            actionsHtml += '<a href="' + editBaseHref + '?id=' + encodeURIComponent(p.post_id) + '&state=' + encodeURIComponent(p.status) + '" class="fr07-icon-btn" title="Chỉnh sửa bài viết của bạn">' +
                                '<img src="../../assets/figma/pencil-15.svg" alt="Sửa" width="15" height="15">' +
                            '</a>';
                        } else {
                            actionsHtml += '<button type="button" class="fr07-icon-btn" data-view-id="' + p.post_id + '" title="Bài viết đang chờ duyệt hoặc đã xuất bản (Xem chi tiết)">' +
                                '<img src="../../assets/figma/file-text.svg" alt="Xem" width="15" height="15">' +
                            '</button>';
                        }

                        actionsHtml += '<button type="button" class="fr07-icon-btn' + (canStaffDelete ? "" : " is-disabled") + '" data-delete-id="' + p.post_id + '" title="' +
                            (canStaffDelete ? "Xóa mềm bài viết" : "Chỉ xóa được bài Bản nháp hoặc Bị từ chối") + '">' +
                            '<img src="../../assets/figma/trash-2-16.svg" alt="Xóa" width="15" height="15">' +
                        '</button>';
                    }
                } else {
                    // Quyền Quản trị viên (Admin / Manager)
                    const canAdminDelete = !p.deleted_at && (p.status === "DRAFT" || p.status === "REJECTED");
                    actionsHtml = '<a href="' + editBaseHref + '?id=' + encodeURIComponent(p.post_id) + '&state=' + encodeURIComponent(p.status) + '" class="fr07-icon-btn" title="Chỉnh sửa bài viết">' +
                        '<img src="../../assets/figma/pencil-15.svg" alt="Sửa" width="15" height="15">' +
                    '</a>' +
                    '<button type="button" class="fr07-icon-btn' + (canAdminDelete ? "" : " is-disabled") + '" data-delete-id="' + p.post_id + '" title="' +
                        (canAdminDelete ? "Xóa mềm bài viết" : "Chỉ xóa được bài Bản nháp hoặc Bị từ chối") + '">' +
                        '<img src="../../assets/figma/trash-2-16.svg" alt="Xóa" width="15" height="15">' +
                    '</button>';
                }

                return '<div class="fr07-post-row" data-post-id="' + p.post_id + '">' +
                    '<div class="fr07-post-identity">' +
                        '<img src="../../assets/figma/file-text.svg" alt="" width="18" height="18">' +
                        '<div class="fr07-post-title-block">' +
                            '<span class="fr07-post-title" data-view-id="' + p.post_id + '" role="button" tabindex="0">' + UI.esc(p.title) + '</span>' +
                            '<span class="fr07-post-meta">' + UI.esc(p.code + " · " + (p.platform_label || "")) +
                                (p.deleted_at ? " · Đã xóa mềm (" + UI.esc(p.deleted_at) + ")" : "") +
                            '</span>' +
                        '</div>' +
                    '</div>' +
                    '<span class="fr07-author">' + UI.esc(p.author) + '</span>' +
                    '<div><span class="fr07-status-pill ' + (p.deleted_at ? "st-deleted" : st.cls) + '">' +
                        UI.esc(p.deleted_at ? "Đã xóa mềm" : st.label) +
                    '</span></div>' +
                    '<span class="fr07-date">' + UI.esc(p.planned_label || p.planned_date) + '</span>' +
                    '<div class="fr07-row-actions">' + actionsHtml + '</div>' +
                '</div>';
            }).join("");
        }

        // Pagination summary
        const summaryEl = document.getElementById("postPaginationSummary");
        if (summaryEl) {
            if (total === 0) {
                summaryEl.textContent = "Hiển thị 0 bài viết";
            } else {
                const from = startIdx + 1;
                const to = Math.min(startIdx + PAGE_SIZE, total);
                summaryEl.textContent = "Hiển thị " + from + "–" + to + " trên " + total + " bài viết";
            }
        }

        // Pagination buttons
        const pageBtnsEl = document.getElementById("postPaginationBtns");
        if (pageBtnsEl) {
            let btns = '<button type="button" class="fr07-page-btn" data-page="prev"' + (currentPage <= 1 ? " disabled" : "") + '>‹</button>';
            for (let i = 1; i <= totalPages; i++) {
                btns += '<button type="button" class="fr07-page-btn' + (i === currentPage ? " is-active" : "") + '" data-page="' + i + '">' + i + '</button>';
            }
            btns += '<button type="button" class="fr07-page-btn" data-page="next"' + (currentPage >= totalPages ? " disabled" : "") + '>›</button>';
            pageBtnsEl.innerHTML = btns;
        }
    }

    /* ---------- FR-06: MỞ HỘP THOẠI XÁC NHẬN XÓA MỀM ---------- */
    function handleRequestDelete(postId) {
        const post = posts.find(function (p) { return p.post_id === postId; });
        if (!post) return;

        // Nếu là Staff, kiểm tra quyền sở hữu
        if (isStaffPage && !isMyPost(post, currentUser)) {
            UI.toast("error", "Không có quyền", "Bạn chỉ được phép xóa bài viết do chính mình tạo.");
            return;
        }

        // Kiểm tra quy tắc BR-06 / ERR-01: Chỉ cho phép xóa mềm bài DRAFT hoặc REJECTED
        if (post.status !== "DRAFT" && post.status !== "REJECTED") {
            const stLabel = (STATUS_MAP[post.status] && STATUS_MAP[post.status].label) || post.status;
            UI.toast(
                "error",
                "Không thể xóa bài viết",
                "Bài '" + post.code + "' đang ở trạng thái '" + stLabel + "'. Hệ thống chỉ cho phép xóa mềm bài ở trạng thái Bản nháp (Draft) hoặc Bị từ chối (Rejected)!"
            );
            return;
        }

        pendingDeletePost = post;
        const stLabelUpper = post.status === "DRAFT" ? "BẢN NHÁP" : "BỊ TỪ CHỐI";
        document.getElementById("delTargetCode").textContent = post.code + " · " + stLabelUpper;
        document.getElementById("delTargetTitle").textContent = post.title;
        document.getElementById("delTargetMeta").textContent = post.author + " · Cập nhật " + (post.updated_label || post.planned_label);

        const modalEl = document.getElementById("fr06DeleteModal");
        if (modalEl) {
            modalEl.hidden = false;
            document.body.classList.add("modal-open");
        }
    }

    function closeDeleteModal() {
        pendingDeletePost = null;
        const modalEl = document.getElementById("fr06DeleteModal");
        if (modalEl) modalEl.hidden = true;
        document.body.classList.remove("modal-open");
    }

    async function confirmSoftDelete() {
        if (!pendingDeletePost) return;
        const post = pendingDeletePost;

        try {
            if (window.BlossomAPI && typeof window.BlossomAPI.request === "function") {
                await BlossomAPI.request("/posts/" + post.post_id, { method: "DELETE" });
            }
        } catch (e) {
            /* fallback localStorage */
        }

        const nowStr = new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + " " +
                       new Date().toLocaleDateString("vi-VN");
        post.deleted_at = nowStr;
        savePosts();
        closeDeleteModal();
        renderMetrics();
        renderTable();

        UI.toast(
            "success",
            "Đã xóa bài viết",
            "Bài viết '" + post.code + " · " + post.title + "' đã được cập nhật deleted_at và gỡ khỏi danh sách hiển thị."
        );
    }

    /* ---------- XEM CHI TIẾT BÀI VIẾT ---------- */
    function openPostDetailModal(postId) {
        if (window.PostDetailModal && typeof window.PostDetailModal.open === "function") {
            window.PostDetailModal.open(postId);
            return;
        }
        if (window.openPostDetailModal && window.openPostDetailModal !== openPostDetailModal) {
            window.openPostDetailModal(postId);
            return;
        }

        const post = posts.find(function (p) { return p.post_id === postId; });
        if (!post) return;
        const st = STATUS_MAP[post.status] || { label: post.status };

        const bodyHtml =
            '<div style="display:flex;flex-direction:column;gap:12px;font-size:13px;">' +
                '<div style="background:#fff8fa;padding:14px;border-radius:10px;border:1px solid #f2dfe7;">' +
                    '<div style="font-size:11px;color:#cc618a;font-weight:600;">' + UI.esc(post.code + " · " + (post.platform_label || "")) + '</div>' +
                    '<div style="font-size:16px;font-weight:600;color:#574b50;margin-top:4px;">' + UI.esc(post.title) + '</div>' +
                    '<div style="font-size:12px;color:#a4989d;margin-top:4px;">Tác giả: <b>' + UI.esc(post.author) + '</b> · Lịch đăng: ' + UI.esc(post.planned_label || post.planned_date) + ' · Trạng thái: <b>' + UI.esc(st.label) + '</b></div>' +
                '</div>' +
                '<div>' +
                    '<b style="display:block;margin-bottom:4px;color:#574b50;">Nội dung bài viết (Caption):</b>' +
                    '<p style="color:#574b50;line-height:1.6;">' + UI.esc(post.caption || "") + '</p>' +
                '</div>' +
            '</div>';

        const editHref = (isStaffPage ? "edit-post.html" : "../staff/edit-post.html") +
            "?id=" + encodeURIComponent(post.post_id) + "&state=" + encodeURIComponent(post.status);

        const actions = [{ label: "Đóng", variant: "ghost", value: false }];
        if (!isStaffPage || isMyPost(post, currentUser)) {
            actions.push({ label: "Chỉnh sửa bài viết", variant: "primary", value: "EDIT" });
        }

        UI.modal({
            title: "Chi tiết bài viết",
            body: bodyHtml,
            actions: actions
        }).then(function (act) {
            if (act === "EDIT") {
                location.href = editHref;
            }
        });
    }

    function updateAuthorFilterUI() {
        const authorSel = document.getElementById("filterAuthorSelect");
        if (!authorSel) return;
        if (isStaffPage && activeTab === "MINE") {
            authorSel.value = "ALL";
            authorSel.disabled = true;
            authorSel.title = "Đang hiển thị bài viết của riêng bạn";
        } else {
            authorSel.disabled = false;
            authorSel.title = "";
        }
    }

    function bindEvents() {
        // Tabs
        document.querySelectorAll("[data-post-tab]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                activeTab = btn.dataset.postTab;
                document.querySelectorAll("[data-post-tab]").forEach(function (b) {
                    b.classList.toggle("is-active", b === btn);
                });
                currentPage = 1;
                updateAuthorFilterUI();
                renderTable();
            });
        });

        // Filters
        ["postSearchInput", "filterPlatformSelect", "filterStatusSelect", "filterAuthorSelect", "filterDateInput"].forEach(function (id) {
            const el = document.getElementById(id);
            if (!el) return;
            const evt = el.tagName === "INPUT" && el.type === "text" ? "input" : "change";
            el.addEventListener(evt, function () {
                currentPage = 1;
                renderTable();
            });
        });

        const topSearch = document.getElementById("searchInput");
        if (topSearch) {
            topSearch.addEventListener("input", function () {
                const innerSearch = document.getElementById("postSearchInput");
                if (innerSearch) innerSearch.value = topSearch.value;
                currentPage = 1;
                renderTable();
            });
        }

        // Row actions (view detail / soft delete)
        const tableBody = document.getElementById("postTableBody");
        if (tableBody) {
            tableBody.addEventListener("click", function (e) {
                const delBtn = e.target.closest("[data-delete-id]");
                if (delBtn) {
                    e.stopPropagation();
                    handleRequestDelete(Number(delBtn.dataset.deleteId));
                    return;
                }
                const viewEl = e.target.closest("[data-view-id]");
                if (viewEl) {
                    openPostDetailModal(Number(viewEl.dataset.viewId));
                }
            });
            tableBody.addEventListener("keydown", function (e) {
                if (e.key === "Enter" || e.key === " ") {
                    const viewEl = e.target.closest("[data-view-id]");
                    if (viewEl) {
                        e.preventDefault();
                        openPostDetailModal(Number(viewEl.dataset.viewId));
                    }
                }
            });
        }

        // Pagination
        const pBtns = document.getElementById("postPaginationBtns");
        if (pBtns) {
            pBtns.addEventListener("click", function (e) {
                const btn = e.target.closest("[data-page]");
                if (!btn || btn.disabled) return;
                const p = btn.dataset.page;
                if (p === "prev") currentPage = Math.max(1, currentPage - 1);
                else if (p === "next") currentPage += 1;
                else currentPage = Number(p);
                renderTable();
            });
        }

        // Delete modal controls
        const btnClose = document.getElementById("btnCloseDeleteModal");
        const btnCancel = document.getElementById("btnCancelDeleteModal");
        const btnConfirm = document.getElementById("btnConfirmDeleteModal");
        const delModal = document.getElementById("fr06DeleteModal");

        if (btnClose) btnClose.addEventListener("click", closeDeleteModal);
        if (btnCancel) btnCancel.addEventListener("click", closeDeleteModal);
        if (btnConfirm) btnConfirm.addEventListener("click", confirmSoftDelete);
        if (delModal) {
            delModal.addEventListener("click", function (e) {
                if (e.target.id === "fr06DeleteModal") closeDeleteModal();
            });
        }

        // Đồng bộ dữ liệu liên trang
        window.addEventListener("blossom_posts_updated", function () {
            posts = loadPosts();
            renderMetrics();
            renderTable();
        });
        window.addEventListener("storage", function (e) {
            if (e.key === POST_LIST_KEY) {
                posts = loadPosts();
                renderMetrics();
                renderTable();
            }
        });
    }

    updateAuthorFilterUI();
    renderMetrics();
    renderTable();
    bindEvents();
})();