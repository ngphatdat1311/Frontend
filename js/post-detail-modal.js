/* ==========================================================
   BLOSSOM BEAUTY STORE – POST DETAIL MODAL (FR-12 / T06A668)
   Xem chi tiết bài viết, Sao chép Caption (clipboard), Tải xuống Media (blob)
   Dùng chung cho Posts Management, Calendar, Approvals, Notifications
   ========================================================== */

(function (global) {
    "use strict";

    function getSharedPost(postId) {
        try {
            const list = JSON.parse(localStorage.getItem("blossom_posts_fr06_07_v1") || "[]");
            const found = list.find(function (p) {
                return Number(p.post_id) === Number(postId) ||
                       String(p.post_id) === String(postId) ||
                       p.code === String(postId);
            });
            if (found) return found;
        } catch (e) {}

        // Fallback từ calendar events
        try {
            const calEvents = JSON.parse(localStorage.getItem("blossom_fr11_calendar_events_v1") || "[]");
            const ev = calEvents.find(function (e) {
                return Number(e.id) === Number(postId) || String(e.id) === String(postId) || e.code === String(postId);
            });
            if (ev) {
                return {
                    post_id: ev.id,
                    code: ev.code || "BL-0" + ev.id,
                    title: ev.title,
                    platforms: [ev.platform || "Facebook & Instagram"],
                    platform_label: ev.platform || "Facebook & Instagram",
                    author: ev.author || "Doãn Thị Minh Anh",
                    status: ev.status === "SCHEDULED" ? "SCHEDULED" : (ev.status === "PENDING" ? "PENDING_APPROVAL" : "DRAFT"),
                    planned_label: ev.date + " " + ev.time,
                    caption: "Routine chăm sóc da toàn diện cùng các tinh chất dưỡng ẩm từ thiên nhiên của Blossom Beauty.",
                    mediaUrl: "../../assets/figma/skincare-editorial.png"
                };
            }
        } catch (e) {}

        if (Number(postId) === 129 || String(postId).includes("129")) {
            return {
                post_id: 129,
                code: "BL-0129",
                title: "Kem dưỡng trắng da Blossom",
                platforms: ["Instagram"],
                platform_label: "Instagram",
                author: "Doãn Thị Minh Anh",
                status: "PENDING_APPROVAL",
                planned_label: "05/11/2026 08:00",
                caption: "Kem dưỡng trắng da Blossom chứa chiết xuất hoa anh đào giúp nâng tông nhẹ nhàng và cấp ẩm sâu. Thành phần thuần chay lành tính cho mọi loại da.",
                mediaUrl: "../../assets/figma/skincare-editorial.png"
            };
        }

        if (Number(postId) === 127 || String(postId).includes("127")) {
            return {
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
            };
        }

        // Default mock
        return {
            post_id: postId,
            code: "BL-0" + postId,
            title: "Bộ sưu tập chăm sóc da thu đông Blossom",
            platforms: ["Facebook", "Instagram"],
            platform_label: "Facebook & Instagram",
            author: "Doãn Thị Minh Anh",
            status: "PENDING_APPROVAL",
            planned_label: "20/11/2026 14:00",
            caption: "Routine 5 bước buổi sáng giúp làn da căng mướt tự nhiên cùng các sản phẩm thiên nhiên thuần khiết từ Blossom Beauty Store. #BlossomBeauty #SkincareRoutine #NaturalGlow",
            mediaUrl: "../../assets/figma/skincare-editorial.png"
        };
    }

    const STATUS_MAP = {
        PUBLISHED:          { label: "Đã xuất bản",    cls: "st-published",  color: "#3f9a65", bg: "#e6f5ec" },
        PENDING_APPROVAL:   { label: "Chờ duyệt",      cls: "st-pending",    color: "#d9923a", bg: "#fff0e1" },
        REVISION_REQUESTED: { label: "Đang chỉnh sửa", cls: "st-revision",   color: "#7a6aa8", bg: "#efeaf8" },
        DRAFT:              { label: "Bản nháp",       cls: "st-draft",      color: "#8c8294", bg: "#f0edf3" },
        SCHEDULED:          { label: "Đã lên lịch",    cls: "st-scheduled",  color: "#3f9a65", bg: "#ebf6ef" },
        APPROVED:           { label: "Đã phê duyệt",   cls: "st-approved",   color: "#2563eb", bg: "#eff6ff" },
        REJECTED:           { label: "Bị từ chối",     cls: "st-rejected",   color: "#d64545", bg: "#fdeaea" }
    };

    function copyCaption(text) {
        if (!text) {
            UI.toast("info", "Thông báo", "Bài viết chưa có nội dung caption.");
            return;
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () {
                UI.toast("success", "Đã sao chép caption", "Nội dung caption bài viết đã được lưu vào bộ nhớ tạm.");
            }).catch(function () {
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
    }

    function fallbackCopy(text) {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand("copy");
            UI.toast("success", "Đã sao chép caption", "Nội dung caption bài viết đã được lưu vào bộ nhớ tạm.");
        } catch (err) {
            UI.toast("error", "Lỗi", "Không thể sao chép caption tự động. Vui lòng chọn và sao chép thủ công.");
        }
        document.body.removeChild(ta);
    }

    function downloadMedia(url, postCode) {
        UI.toast("info", "Tải xuống media", "Đang tải tệp media của bài viết " + postCode + " về máy...");

        const safeCode = (postCode || "blossom_post").replace(/[^a-zA-Z0-9_-]/g, "_");
        const filename = safeCode + "_media.png";

        fetch(url)
            .then(function (res) { return res.blob(); })
            .then(function (blob) {
                const blobUrl = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = blobUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(blobUrl);
                document.body.removeChild(a);
                UI.toast("success", "Thành công", "Tệp media đã được tải xuống: " + filename);
            })
            .catch(function () {
                // Fallback nếu fetch blob bị cors
                const a = document.createElement("a");
                a.href = url;
                a.download = filename;
                a.target = "_blank";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                UI.toast("success", "Tải xuống", "Đã bắt đầu tải tệp media.");
            });
    }

    function openPostDetailModal(postId) {
        const post = getSharedPost(postId);
        if (!post) {
            UI.toast("error", "Lỗi", "Không tìm thấy dữ liệu bài viết ID #" + postId);
            return;
        }

        const st = STATUS_MAP[post.status] || { label: post.status, color: "#8c8294", bg: "#f0edf3" };
        const mediaUrl = post.mediaUrl || "../../assets/figma/skincare-editorial.png";
        const captionText = post.caption || "Chưa có nội dung caption.";

        const bodyHtml =
            '<div class="post-detail-modal-grid">' +
                '<!-- CỘT 1: MEDIA & DOWNLOAD MEDIA -->' +
                '<div class="detail-media-pane">' +
                    '<img src="' + UI.esc(mediaUrl) + '" alt="Media Preview" class="detail-media-preview-img" onerror="this.src=\'../../assets/figma/skincare-editorial.png\'">' +
                    '<button type="button" class="btn-download-media" id="btnDownloadPostMedia">' +
                        UI.icon("chart") + '<span>Tải xuống Media</span>' +
                    '</button>' +
                    '<small style="font-size:11.5px;color:var(--muted);text-align:center;">Định dạng chuẩn ảnh phân giải cao/video xuất bản đa kênh</small>' +
                '</div>' +

                '<!-- CỘT 2: THÔNG TIN CHI TIẾT & COPY CAPTION -->' +
                '<div class="detail-content-pane">' +
                    '<div class="detail-header-meta">' +
                        '<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">' +
                            '<span style="font-size:12px;font-weight:700;color:var(--pink);background:var(--pink-soft);padding:3px 8px;border-radius:4px;">' + UI.esc(post.code || "BL-0" + post.post_id) + '</span>' +
                            '<span style="font-size:12px;font-weight:600;color:#555;background:#eee;padding:3px 8px;border-radius:4px;">' + UI.esc(post.platform_label || "Đa kênh") + '</span>' +
                        '</div>' +
                        '<span style="font-size:12px;font-weight:700;color:' + st.color + ';background:' + st.bg + ';padding:3px 10px;border-radius:100px;">' + UI.esc(st.label) + '</span>' +
                    '</div>' +

                    '<h3 style="font-family:var(--font-display);font-size:22px;color:var(--text-strong);line-height:1.35;margin:0;">' + UI.esc(post.title) + '</h3>' +

                    '<div style="font-size:13px;color:var(--muted);display:flex;gap:16px;flex-wrap:wrap;border-bottom:1px solid #f4dce4;padding-bottom:10px;">' +
                        '<span>Tác giả: <b style="color:var(--text);">' + UI.esc(post.author || "Nguyễn Phát Đạt") + '</b></span>' +
                        '<span>Lịch dự kiến: <b style="color:var(--text);">' + UI.esc(post.planned_label || "Chưa lên lịch") + '</b></span>' +
                    '</div>' +

                    '<div>' +
                        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">' +
                            '<span style="font-size:12.5px;font-weight:600;color:var(--muted);text-transform:uppercase;">Nội dung Caption:</span>' +
                            '<button type="button" class="btn-copy-caption" id="btnCopyPostCaption">' +
                                UI.icon("clipboard") + '<span>Sao chép Caption</span>' +
                            '</button>' +
                        '</div>' +
                        '<div class="caption-box" id="postModalCaptionBox">' + UI.esc(captionText) + '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';

        const inAdmin = location.pathname.indexOf("/pages/admin/") !== -1;
        const editUrl = (inAdmin ? "../staff/edit-post.html" : "edit-post.html") + "?id=" + encodeURIComponent(post.post_id);

        UI.modal({
            title: "Chi tiết bài viết – " + (post.code || "BL-0" + post.post_id),
            size: "lg",
            body: bodyHtml,
            actions: [
                { label: "Đóng", variant: "ghost", value: false },
                { label: "Chỉnh sửa bài viết", variant: "secondary", value: "EDIT" }
            ]
        }).then(function (act) {
            if (act === "EDIT") {
                location.href = editUrl;
            }
        });

        // Gắn sự kiện cho 2 nút cốt lõi của FR-12 ngay sau khi modal xuất hiện
        setTimeout(function () {
            const btnCopy = document.getElementById("btnCopyPostCaption");
            if (btnCopy) {
                btnCopy.addEventListener("click", function () {
                    copyCaption(post.caption);
                });
            }

            const btnDl = document.getElementById("btnDownloadPostMedia");
            if (btnDl) {
                btnDl.addEventListener("click", function () {
                    downloadMedia(mediaUrl, post.code || "BL-0" + post.post_id);
                });
            }
        }, 50);
    }

    document.addEventListener("DOMContentLoaded", function () {
        const params = new URLSearchParams(location.search);
        const openId = params.get("open");
        if (openId) {
            setTimeout(function () {
                openPostDetailModal(Number(openId));
            }, 300);
        }
    });

    global.openPostDetailModal = openPostDetailModal;
    global.PostDetailModal = {
        open: openPostDetailModal,
        copyCaption: copyCaption,
        downloadMedia: downloadMedia
    };
    global.copyCaption = copyCaption;
    global.downloadMedia = downloadMedia;
})(window);
