/* ==========================================================
   BLOSSOM BEAUTY STORE – APPROVAL WORKFLOW LOGIC (FR-08 / T06A663)
   Quản lý hàng đợi phê duyệt bài viết, duyệt, từ chối (≥ 10 ký tự), yêu cầu sửa
   ========================================================== */

(function () {
    "use strict";

    const STORAGE_KEY = "blossom_posts_fr06_07_v1";
    let currentTab = "queue"; // 'queue' | 'history'

    const STATUS_MAP = {
        PENDING_APPROVAL:   { label: "Chờ duyệt",      cls: "st-pending",   color: "#d9923a", bg: "#fff0e1" },
        APPROVED:           { label: "Đã phê duyệt",   cls: "st-approved",  color: "#2563eb", bg: "#eff6ff" },
        SCHEDULED:          { label: "Đã lên lịch",    cls: "st-scheduled", color: "#3f9a65", bg: "#ebf6ef" },
        PUBLISHED:          { label: "Đã xuất bản",    cls: "st-published", color: "#3f9a65", bg: "#e6f5ec" },
        REVISION_REQUESTED: { label: "Đang chỉnh sửa", cls: "st-revision",  color: "#7a6aa8", bg: "#efeaf8" },
        REJECTED:           { label: "Bị từ chối",     cls: "st-rejected",  color: "#d64545", bg: "#fdeaea" },
        DRAFT:              { label: "Bản nháp",       cls: "st-draft",     color: "#8c8294", bg: "#f0edf3" }
    };

    function getPosts() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                const list = JSON.parse(data);
                if (Array.isArray(list) && list.length > 0) return list;
            }
        } catch (e) {}

        // Khởi tạo danh sách mặc định nếu chưa có
        const initial = [
            {
                post_id: 128,
                code: "BL-0128",
                title: "5 bước dưỡng da cho buổi sáng rạng rỡ",
                platforms: ["Facebook", "Instagram"],
                platform_label: "Facebook & Instagram",
                author: "Nguyễn Hà Linh",
                status: "PUBLISHED",
                planned_label: "04/11/2026 08:00",
                caption: "Routine 5 bước buổi sáng giúp làn da căng mướt tự nhiên cùng Blossom.",
                mediaUrl: "../../assets/figma/skincare-editorial.png"
            },
            {
                post_id: 127,
                code: "BL-0127",
                title: "Bí quyết chăm da mùa hanh khô",
                platforms: ["Facebook", "Instagram"],
                platform_label: "Facebook & Instagram",
                author: "Trần Ngọc Mai",
                status: "PENDING_APPROVAL",
                planned_label: "05/11/2026 08:00",
                caption: "Cấp ẩm chuyên sâu bảo vệ hàng rào tự nhiên của làn da trong tiết trời thu đông.",
                mediaUrl: "../../assets/figma/skincare-editorial.png"
            },
            {
                post_id: 126,
                code: "BL-0126",
                title: "Một chút yêu thương cho làn da",
                platforms: ["Facebook", "Instagram"],
                platform_label: "Facebook & Instagram",
                author: "Lê Thu Hương",
                status: "REVISION_REQUESTED",
                planned_label: "06/11/2026 10:00",
                caption: "Dành 10 phút mỗi tối để thư giãn và phục hồi làn da với mặt nạ hoa hồng.",
                mediaUrl: "../../assets/figma/skincare-editorial.png"
            },
            {
                post_id: 125,
                code: "BL-0125",
                title: "Chọn serum phù hợp với làn da của bạn",
                platforms: ["Facebook", "Instagram"],
                platform_label: "Facebook & Instagram",
                author: "Nguyễn Hà Linh",
                status: "PENDING_APPROVAL",
                planned_label: "07/11/2026 09:30",
                caption: "Hướng dẫn phân biệt các hoạt chất Hyaluronic Acid, Niacinamide và Vitamin C.",
                mediaUrl: "../../assets/figma/skincare-editorial.png"
            },
            {
                post_id: 124,
                code: "BL-0124",
                title: "Bộ cọ trang điểm Rose Gold 12 món",
                platforms: ["TikTok"],
                platform_label: "TikTok",
                author: "Nguyễn Phát Đạt",
                status: "REJECTED",
                planned_label: "08/11/2026 15:00",
                caption: "Bộ cọ trang điểm siêu mềm mại từ sợi nhân tạo cao cấp.",
                mediaUrl: "../../assets/figma/skincare-editorial.png",
                rejection_reason: "Hình ảnh cận cảnh sợi cọ chưa đủ độ sắc nét và thiếu bảng giá niêm yết."
            }
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        return initial;
    }

    function savePosts(posts) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
        window.dispatchEvent(new Event("blossom_posts_updated"));
    }

    function updateMetrics() {
        const posts = getPosts();
        const pending = posts.filter(function (p) { return p.status === "PENDING_APPROVAL"; }).length;
        const approved = posts.filter(function (p) {
            return p.status === "APPROVED" || p.status === "SCHEDULED" || p.status === "PUBLISHED";
        }).length;
        const revision = posts.filter(function (p) { return p.status === "REVISION_REQUESTED"; }).length;
        const rejected = posts.filter(function (p) { return p.status === "REJECTED"; }).length;

        const elPending = document.getElementById("statPendingCount");
        const elApproved = document.getElementById("statApprovedCount");
        const elRevision = document.getElementById("statRevisionCount");
        const elRejected = document.getElementById("statRejectedCount");

        if (elPending) elPending.textContent = String(pending);
        if (elApproved) elApproved.textContent = String(approved);
        if (elRevision) elRevision.textContent = String(revision);
        if (elRejected) elRejected.textContent = String(rejected);

        const elQueueBadge = document.getElementById("queueBadge");
        const elHistBadge = document.getElementById("historyBadge");

        if (elQueueBadge) elQueueBadge.textContent = String(pending);
        if (elHistBadge) elHistBadge.textContent = String(posts.length - pending);
    }

    function getFilteredPosts() {
        const posts = getPosts();
        const searchVal = (document.getElementById("approvalSearchInput") ? document.getElementById("approvalSearchInput").value : "").toLowerCase().trim();
        const platformVal = (document.getElementById("platformFilter") ? document.getElementById("platformFilter").value : "ALL");
        const authorVal = (document.getElementById("authorFilter") ? document.getElementById("authorFilter").value : "ALL");

        return posts.filter(function (p) {
            if (p.deleted_at) return false;

            // Tab filter
            if (currentTab === "queue") {
                if (p.status !== "PENDING_APPROVAL") return false;
            } else {
                if (p.status === "PENDING_APPROVAL") return false;
            }

            // Platform filter
            if (platformVal !== "ALL") {
                const hasPlat = (p.platforms || []).some(function (pl) {
                    return pl.toLowerCase().indexOf(platformVal.toLowerCase()) !== -1;
                });
                if (!hasPlat) return false;
            }

            // Author filter
            if (authorVal !== "ALL" && p.author !== authorVal) return false;

            // Search filter
            if (searchVal) {
                const matchTitle = (p.title || "").toLowerCase().indexOf(searchVal) !== -1;
                const matchCode = (p.code || "").toLowerCase().indexOf(searchVal) !== -1;
                const matchAuthor = (p.author || "").toLowerCase().indexOf(searchVal) !== -1;
                if (!matchTitle && !matchCode && !matchAuthor) return false;
            }

            return true;
        });
    }

    function renderTable() {
        const list = getFilteredPosts();
        const tbody = document.getElementById("approvalsTbody");
        if (!tbody) return;

        if (!list.length) {
            tbody.innerHTML =
                '<tr><td colspan="7" style="text-align:center;padding:48px 20px;">' +
                    '<div style="color:var(--muted);font-size:15px;display:flex;flex-direction:column;align-items:center;gap:8px;">' +
                        UI.icon("check") +
                        '<span>' + (currentTab === "queue" ? "Hiện không có bài viết nào đang chờ duyệt." : "Chưa có bài viết nào trong lịch sử đã xử lý.") + '</span>' +
                    '</div>' +
                '</td></tr>';
            return;
        }

        tbody.innerHTML = list.map(function (post) {
            const st = STATUS_MAP[post.status] || { label: post.status, color: "#8c8294", bg: "#f0edf3" };

            let platBadges = (post.platforms || [post.platform_label || "Đa kênh"]).map(function (pl) {
                let cls = "fb";
                if (pl.toLowerCase().indexOf("insta") !== -1) cls = "ig";
                else if (pl.toLowerCase().indexOf("tik") !== -1) cls = "tiktok";
                return '<span class="channel-tag ' + cls + '">' + UI.esc(pl) + '</span>';
            }).join(" ");

            let actionsHtml = "";
            if (currentTab === "queue") {
                actionsHtml =
                    '<div class="action-btn-group">' +
                        '<button type="button" class="btn-act view" data-view-id="' + post.post_id + '" title="Xem chi tiết">' +
                            UI.icon("doc") + '<span>Chi tiết</span>' +
                        '</button>' +
                        '<button type="button" class="btn-act approve" data-approve-id="' + post.post_id + '" title="Phê duyệt bài viết">' +
                            UI.icon("tick") + '<span>Duyệt</span>' +
                        '</button>' +
                        '<button type="button" class="btn-act revision" data-revision-id="' + post.post_id + '" title="Yêu cầu sửa">' +
                            UI.icon("edit") + '<span>Sửa</span>' +
                        '</button>' +
                        '<button type="button" class="btn-act reject" data-reject-id="' + post.post_id + '" title="Từ chối bài viết">' +
                            UI.icon("close") + '<span>Từ chối</span>' +
                        '</button>' +
                    '</div>';
            } else {
                actionsHtml =
                    '<div class="action-btn-group">' +
                        '<button type="button" class="btn-act view" data-view-id="' + post.post_id + '">' +
                            UI.icon("doc") + '<span>Xem lại</span>' +
                        '</button>' +
                    '</div>';
            }

            return '<tr>' +
                '<td><b>' + UI.esc(post.code || "BL-0" + post.post_id) + '</b></td>' +
                '<td>' +
                    '<div class="post-title-cell">' +
                        '<a href="javascript:void(0)" class="post-title-link" data-view-id="' + post.post_id + '">' + UI.esc(post.title) + '</a>' +
                        '<div class="post-meta-sub">' + platBadges + '</div>' +
                    '</div>' +
                '</td>' +
                '<td>' + UI.esc(post.author || "Nguyễn Phát Đạt") + '</td>' +
                '<td>' + UI.esc(post.planned_label || "Chưa lên lịch") + '</td>' +
                '<td><span style="font-size:12px;font-weight:600;color:' + st.color + ';background:' + st.bg + ';padding:3px 10px;border-radius:100px;">' + UI.esc(st.label) + '</span></td>' +
                '<td style="text-align:right;">' + actionsHtml + '</td>' +
            '</tr>';
        }).join("");
    }

    /* ---------- THAO TÁC PHÊ DUYỆT ---------- */
    function handleApprove(postId) {
        const posts = getPosts();
        const post = posts.find(function (p) { return p.post_id === Number(postId); });
        if (!post) return;

        post.status = "APPROVED";
        savePosts(posts);
        updateMetrics();
        renderTable();

        // Ghi nhận thông báo
        if (window.NotificationsStore) {
            window.NotificationsStore.addNotification({
                type: "approved",
                postId: post.post_id,
                title: "Bài viết đã được phê duyệt! 🎉",
                message: "Bài viết '" + post.title + "' đã được Manager Đoàn Thị Minh Anh phê duyệt và sẵn sàng xuất bản.",
                author: "Đoàn Thị Minh Anh (Manager)",
                recipientRole: "STAFF"
            });
        }

        UI.toast("success", "Đã phê duyệt bài viết", "Bài viết '" + post.code + " · " + post.title + "' đã được chuyển sang trạng thái ĐÃ DUYỆT.");
    }

    /* ---------- THAO TÁC TỪ CHỐI (BẮT BUỘC LÝ DO ≥ 10 KÝ TỰ - ERR-09) ---------- */
    function handleReject(postId) {
        const posts = getPosts();
        const post = posts.find(function (p) { return p.post_id === Number(postId); });
        if (!post) return;

        const bodyHtml =
            '<div style="display:flex;flex-direction:column;gap:12px;">' +
                '<p style="font-size:14px;color:var(--text-2);">Vui lòng nhập lý do từ chối bài viết <b>' + UI.esc(post.code + " · " + post.title) + '</b>. Lý do phải rõ ràng để nhân viên nắm được điểm cần khắc phục.</p>' +
                '<div>' +
                    '<label for="rejectReasonInput" style="display:block;font-size:13px;font-weight:600;color:var(--text);margin-bottom:6px;">Lý do từ chối (Tối thiểu 10 ký tự):</label>' +
                    '<textarea id="rejectReasonInput" style="width:100%;height:100px;padding:10px;border:1px solid var(--pink-border);border-radius:8px;font-size:14px;outline:none;" placeholder="VD: Hình ảnh mờ, chưa đúng nhận diện thương hiệu hoặc caption chưa đủ tiêu chuẩn..."></textarea>' +
                    '<span id="rejectErrorMsg" style="color:var(--red);font-size:12px;margin-top:4px;display:none;">⚠️ Lý do từ chối bắt buộc phải có ít nhất 10 ký tự!</span>' +
                '</div>' +
            '</div>';

        UI.modal({
            title: "Từ chối phê duyệt bài viết",
            body: bodyHtml,
            actions: [
                { label: "Hủy bỏ", variant: "ghost", value: false },
                { label: "Xác nhận từ chối", variant: "primary", value: "CONFIRM" }
            ]
        }).then(function (act) {
            if (act === "CONFIRM") {
                const reasonInput = document.getElementById("rejectReasonInput");
                const errorMsg = document.getElementById("rejectErrorMsg");
                const reason = reasonInput ? reasonInput.value.trim() : "";

                if (reason.length < 10) {
                    if (errorMsg) errorMsg.style.display = "block";
                    UI.toast("error", "Lỗi nhập liệu", "Lý do từ chối bắt buộc phải có ít nhất 10 ký tự.");
                    return;
                }

                post.status = "REJECTED";
                post.rejection_reason = reason;
                savePosts(posts);
                updateMetrics();
                renderTable();

                if (window.NotificationsStore) {
                    window.NotificationsStore.addNotification({
                        type: "rejected",
                        postId: post.post_id,
                        title: "Bài viết bị từ chối phê duyệt ❌",
                        message: "Lý do: " + reason,
                        author: "Đoàn Thị Minh Anh (Manager)",
                        recipientRole: "STAFF"
                    });
                }

                UI.toast("info", "Đã từ chối bài viết", "Bài viết đã được chuyển sang trạng thái BỊ TỪ CHỐI kèm lý do phản hồi.");
            }
        });
    }

    /* ---------- THAO TÁC YÊU CẦU CHỈNH SỬA ---------- */
    function handleRevision(postId) {
        const posts = getPosts();
        const post = posts.find(function (p) { return p.post_id === Number(postId); });
        if (!post) return;

        const bodyHtml =
            '<div style="display:flex;flex-direction:column;gap:12px;">' +
                '<p style="font-size:14px;color:var(--text-2);">Nhập ghi chú yêu cầu chỉnh sửa cho bài viết <b>' + UI.esc(post.code + " · " + post.title) + '</b>:</p>' +
                '<div>' +
                    '<textarea id="revisionNoteInput" style="width:100%;height:100px;padding:10px;border:1px solid var(--pink-border);border-radius:8px;font-size:14px;outline:none;" placeholder="Nhập các điểm cần nhân viên điều chỉnh lại (hashtag, câu chữ, ảnh...)..."></textarea>' +
                '</div>' +
            '</div>';

        UI.modal({
            title: "Yêu cầu chỉnh sửa bài viết",
            body: bodyHtml,
            actions: [
                { label: "Hủy bỏ", variant: "ghost", value: false },
                { label: "Gửi yêu cầu", variant: "secondary", value: "CONFIRM" }
            ]
        }).then(function (act) {
            if (act === "CONFIRM") {
                const noteInput = document.getElementById("revisionNoteInput");
                const note = noteInput ? noteInput.value.trim() : "Cần rà soát và chỉnh sửa lại nội dung.";

                post.status = "REVISION_REQUESTED";
                post.revision_note = note;
                savePosts(posts);
                updateMetrics();
                renderTable();

                if (window.NotificationsStore) {
                    window.NotificationsStore.addNotification({
                        type: "revision",
                        postId: post.post_id,
                        title: "Yêu cầu chỉnh sửa bài viết ✍️",
                        message: "Ghi chú: " + note,
                        author: "Đoàn Thị Minh Anh (Manager)",
                        recipientRole: "STAFF"
                    });
                }

                UI.toast("info", "Đã gửi yêu cầu chỉnh sửa", "Đã gửi phản hồi yêu cầu nhân viên hoàn thiện bài viết.");
            }
        });
    }

    function bindEvents() {
        // Tab switching
        const tabQueueBtn = document.getElementById("tabQueueBtn");
        const tabHistoryBtn = document.getElementById("tabHistoryBtn");

        if (tabQueueBtn) {
            tabQueueBtn.addEventListener("click", function () {
                currentTab = "queue";
                tabQueueBtn.classList.add("active");
                if (tabHistoryBtn) tabHistoryBtn.classList.remove("active");
                renderTable();
            });
        }

        if (tabHistoryBtn) {
            tabHistoryBtn.addEventListener("click", function () {
                currentTab = "history";
                tabHistoryBtn.classList.add("active");
                if (tabQueueBtn) tabQueueBtn.classList.remove("active");
                renderTable();
            });
        }

        // Filters
        const searchInput = document.getElementById("approvalSearchInput");
        if (searchInput) searchInput.addEventListener("input", renderTable);

        const platSelect = document.getElementById("platformFilter");
        if (platSelect) platSelect.addEventListener("change", renderTable);

        const authSelect = document.getElementById("authorFilter");
        if (authSelect) authSelect.addEventListener("change", renderTable);

        // Row table clicks
        const tbody = document.getElementById("approvalsTbody");
        if (tbody) {
            tbody.addEventListener("click", function (e) {
                const viewBtn = e.target.closest("[data-view-id]");
                if (viewBtn) {
                    const id = Number(viewBtn.dataset.viewId);
                    if (window.openPostDetailModal) window.openPostDetailModal(id);
                    return;
                }

                const appBtn = e.target.closest("[data-approve-id]");
                if (appBtn) {
                    handleApprove(Number(appBtn.dataset.approveId));
                    return;
                }

                const revBtn = e.target.closest("[data-revision-id]");
                if (revBtn) {
                    handleRevision(Number(revBtn.dataset.revisionId));
                    return;
                }

                const rejBtn = e.target.closest("[data-reject-id]");
                if (rejBtn) {
                    handleReject(Number(rejBtn.dataset.rejectId));
                    return;
                }
            });
        }

        window.addEventListener("blossom_posts_updated", function () {
            updateMetrics();
            renderTable();
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        updateMetrics();
        renderTable();
        bindEvents();
    });
})();
