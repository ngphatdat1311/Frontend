/* =========================================================
   FR-04 & FR-05 · TẠO & CHỈNH SỬA BÀI VIẾT (Task T06A660)
   - Form nhiều nền tảng (Facebook, Instagram, Threads)
   - Upload & kiểm tra định dạng/dung lượng: JPG/PNG/WEBP (≤ 10MB), MP4/MOV (≤ 50MB)
   - Auto-save tự động mỗi 30 giây + lưu tạm LocalStorage
   - Live Preview đa nền tảng
   - Chặn chỉnh sửa bài viết đã Published (ERR-01)
   - Cảnh báo & chuyển bài đã Approved về Pending Approval khi sửa (BR-04/BR-05)
   ========================================================= */
(function () {
    "use strict";

    const POSTS_STORAGE_KEY = "blossom_posts_fr06_07_v1";
    const AUTOSAVE_DRAFT_KEY = "blossom_autosave_draft_v1";
    const AUTOSAVE_INTERVAL_SEC = 30;

    const DEFAULT_SHARED_POSTS = [
        {
            post_id: 128,
            code: "BL-0128",
            title: "5 bước dưỡng da cho buổi sáng rạng rỡ",
            platforms: ["Facebook", "Instagram"],
            platform_label: "Facebook & Instagram",
            author: "Nguyễn Hà Linh",
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
            author: "Trần Ngọc Mai",
            status: "PENDING_APPROVAL",
            planned_date: "2026-11-05",
            planned_label: "05/11/2026",
            updated_label: "05/11/2026",
            caption: "Cấp ẩm chuyên sâu bảo vệ hàng rào tự nhiên của làn da trong tiết trời thu đông.",
            deleted_at: null
        },
        {
            post_id: 126,
            code: "BL-0126",
            title: "Một chút yêu thương cho làn da",
            platforms: ["Facebook", "Instagram"],
            platform_label: "Facebook & Instagram",
            author: "Lê Thu Hương",
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

    function getSharedPostList() {
        try {
            const raw = JSON.parse(localStorage.getItem(POSTS_STORAGE_KEY));
            if (Array.isArray(raw) && raw.length) return raw;
        } catch (e) {}
        localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(DEFAULT_SHARED_POSTS));
        return DEFAULT_SHARED_POSTS.slice();
    }

    function getPostListHref() {
        return "posts.html";
    }

    const ALLOWED_IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp"];
    const ALLOWED_VIDEO_EXT = [".mp4", ".mov"];
    const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
    const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB

    const DEMO_POSTS = {
        DRAFT: {
            post_id: 127,
            code: "BL-0127",
            title: "Bí quyết chăm da mùa hanh khô",
            category: "Chăm sóc da",
            campaign: "Nâng niu làn da · Tháng 11",
            headline: "Làn da mềm mại, bất chấp tiết trời.",
            caption: "Làn da cũng cần được nâng niu mỗi ngày. Cùng Blossom xây dựng chu trình chăm sóc da đơn giản, dịu nhẹ để luôn tự tin với vẻ đẹp tự nhiên của bạn.\n\n1. Làm sạch dịu nhẹ, giữ lại độ ẩm tự nhiên.\n2. Bổ sung serum cấp ẩm chuyên sâu.\n3. Khóa ẩm với kem dưỡng phù hợp.",
            hashtags: "#BlossomBeauty #ChamSocDa #NangNiuLanDa",
            platforms: ["Facebook", "Instagram"],
            planned_time: "05/11/2026         08:00",
            approver: "Nguyễn Minh Anh",
            status: "DRAFT",
            status_label: "Bản nháp",
            media_name: "blossom-skincare-thang11.jpg",
            media_meta: "1,8 MB · 1600 × 900 px · Ảnh đại diện",
            media_type: "IMAGE",
            media_url: "../../assets/figma/skincare-editorial.png",
            history: [
                "09:42 · Đã lưu thay đổi",
                "09:15 · Trần Ngọc Mai chỉnh sửa",
                "03/11 · Tạo bản nháp"
            ]
        },
        APPROVED: {
            post_id: 128,
            code: "BL-0128",
            title: "Bộ sưu tập Son Dưỡng Thu Đông 2026 - Hương Đào Tự Nhiên",
            category: "Trang điểm",
            campaign: "Nâng niu làn da · Tháng 11",
            headline: "Đôi môi mềm mượt suốt 24 giờ.",
            caption: "Khám phá dòng son dưỡng thuần chay chiết xuất từ hoa quả tươi hữu cơ, cấp ẩm sâu 24h và mang lại sắc hồng tự nhiên.",
            hashtags: "#SonDuong #BlossomBeauty #VeganCosmetics #LipCare",
            platforms: ["Facebook", "Instagram", "Threads"],
            planned_time: "20/11/2026         09:30",
            approver: "Nguyễn Minh Anh",
            status: "APPROVED",
            status_label: "Đã phê duyệt (Approved)",
            media_name: "blossom-lipbalm-collection.webp",
            media_meta: "2,4 MB · 1600 × 900 px · Ảnh sản phẩm",
            media_type: "IMAGE",
            media_url: "../../assets/figma/skincare-editorial.png",
            history: [
                "10:15 · Nguyễn Minh Anh đã phê duyệt (Approved)",
                "09:30 · Trần Ngọc Mai gửi duyệt",
                "04/11 · Tạo bản nháp"
            ]
        },
        PUBLISHED: {
            post_id: 129,
            code: "BL-0129",
            title: "Đại Tiệc Sale Cuối Tuần - Giảm 50% Toàn Bộ Cửa Hàng",
            category: "Khuyến mãi",
            campaign: "Nâng niu làn da · Tháng 11",
            headline: "Ưu đãi lớn nhất tháng 11 tại Blossom.",
            caption: "Duy nhất cuối tuần này tại hệ thống showroom Blossom Beauty trên toàn quốc. Đừng bỏ lỡ cơ hội sở hữu bộ đôi serum dưỡng sáng!",
            hashtags: "#SaleCuoiTuan #KhuyenMai #BlossomBeauty #BigSale",
            platforms: ["Facebook"],
            planned_time: "01/11/2026         08:00",
            approver: "Nguyễn Minh Anh",
            status: "PUBLISHED",
            status_label: "Đã xuất bản (Published)",
            published_url: "https://facebook.com/blossom/posts/1015948302",
            media_name: "blossom-weekend-sale.jpg",
            media_meta: "1,5 MB · 1600 × 900 px · Đã xuất bản",
            media_type: "IMAGE",
            media_url: "../../assets/figma/skincare-editorial.png",
            history: [
                "01/11 08:05 · Đã xuất bản (Published) — Khóa chỉnh sửa nội dung",
                "31/10 16:00 · Nguyễn Minh Anh phê duyệt",
                "30/10 10:00 · Tạo bài viết"
            ]
        },
        REVISION_REQUESTED: {
            post_id: 130,
            code: "BL-0130",
            title: "Review Serum Vitamin C Dưỡng Sáng Da Mờ Thâm",
            category: "Chăm sóc da",
            campaign: "Nâng niu làn da · Tháng 11",
            headline: "Đánh thức vẻ rạng rỡ tự nhiên mỗi sáng.",
            caption: "Công thức 15% Vitamin C tinh khiết kết hợp chiết xuất hoa anh đào giúp làm mờ thâm sạm chỉ sau 14 ngày sử dụng đều đặn.",
            hashtags: "#VitaminC #SerumBlossom #SkincareRoutine",
            platforms: ["Instagram", "Threads"],
            planned_time: "22/11/2026         19:00",
            approver: "Nguyễn Minh Anh",
            status: "REVISION_REQUESTED",
            status_label: "Cần chỉnh sửa",
            manager_comment: "Nhận xét từ Quản lý Nguyễn Minh Anh: Bổ sung thêm hướng dẫn sử dụng kem chống nắng vào buổi sáng và thay ảnh chụp cận chất serum rõ nét hơn nhé.",
            media_name: "serum-vitaminc-reel.mp4",
            media_meta: "14,2 MB · 1080 × 1920 px · Video ngắn",
            media_type: "IMAGE",
            media_url: "../../assets/figma/skincare-editorial.png",
            history: [
                "11:20 · Nguyễn Minh Anh yêu cầu chỉnh sửa (Revision Requested)",
                "09:00 · Trần Ngọc Mai gửi duyệt",
                "02/11 · Tạo bản nháp"
            ]
        }
    };

    const isEditMode = document.body.dataset.editorMode === "edit";
    let currentPostStatus = "DRAFT";
    let currentPostId = isEditMode ? 127 : null;
    let currentMedia = {
        name: "blossom-skincare-thang11.jpg",
        meta: "1,8 MB · 1600 × 900 px · Ảnh đại diện",
        type: "IMAGE",
        url: "../../assets/figma/skincare-editorial.png",
        sizeBytes: 1800000
    };
    let activePreviewTab = "Facebook";
    let countdownRemaining = AUTOSAVE_INTERVAL_SEC;

    function formatTimeNow() {
        const d = new Date();
        return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    }

    function getSelectedPlatforms() {
        const boxes = document.querySelectorAll('#platformCheckboxes input[type="checkbox"]:checked');
        return Array.prototype.map.call(boxes, function (b) { return b.value; });
    }

    function setSelectedPlatforms(platforms) {
        const list = Array.isArray(platforms) ? platforms : ["Facebook", "Instagram"];
        const boxes = document.querySelectorAll('#platformCheckboxes input[type="checkbox"]');
        boxes.forEach(function (box) {
            box.checked = list.indexOf(box.value) !== -1;
        });
        syncPlatformPresetSelect();
    }

    function syncPlatformPresetSelect() {
        const plats = getSelectedPlatforms();
        const select = document.getElementById("platformSelect");
        if (plats.length === 3) {
            select.value = "Facebook, Instagram & Threads";
        } else if (plats.indexOf("Facebook") !== -1 && plats.indexOf("Instagram") !== -1 && plats.length === 2) {
            select.value = "Facebook & Instagram";
        } else if (plats.length === 1) {
            select.value = plats[0];
        }
    }

    function updateWordAndCharStats() {
        const title = document.getElementById("postTitle").value || "";
        const headline = document.getElementById("postHeadline").value || "";
        const caption = document.getElementById("postCaption").value || "";
        const hashtags = document.getElementById("postHashtags").value || "";
        const combined = (title + " " + headline + " " + caption + " " + hashtags).trim();

        const words = combined ? combined.split(/\s+/).filter(Boolean).length : 0;
        const chars = combined.length;
        document.getElementById("wordCharStat").textContent =
            words.toLocaleString("vi-VN") + " từ · " + chars.toLocaleString("vi-VN") + " ký tự";
    }

    function updateChecklist() {
        const titleEl = document.getElementById("chkItemTitle");
        const mediaEl = document.getElementById("chkItemMedia");
        const schedEl = document.getElementById("chkItemSchedule");
        if (!titleEl || !mediaEl || !schedEl) return;

        const hasTitle = Boolean(document.getElementById("postTitle").value.trim());
        const hasMedia = Boolean(currentMedia && currentMedia.url);
        const hasPlatformAndDate = getSelectedPlatforms().length > 0 && Boolean(document.getElementById("plannedPublishInput").value.trim());

        titleEl.classList.toggle("is-done", hasTitle);
        mediaEl.classList.toggle("is-done", hasMedia);
        schedEl.classList.toggle("is-done", hasPlatformAndDate);
    }

    function updateLivePreview() {
        const headline = document.getElementById("postHeadline").value.trim() || document.getElementById("postTitle").value.trim();
        const caption = document.getElementById("postCaption").value;
        const hashtags = document.getElementById("postHashtags").value;
        const planned = document.getElementById("plannedPublishInput").value.trim();
        const plats = getSelectedPlatforms();

        document.getElementById("previewHeadline").textContent = headline || "Chưa có tiêu đề bài viết";
        document.getElementById("previewBody").textContent = caption || "Nội dung bài viết sẽ hiển thị trực tiếp tại đây...";
        document.getElementById("previewTags").textContent = hashtags || "";
        document.getElementById("previewActivePlatforms").textContent = plats.length ? plats.join(" · ") : "Chưa chọn kênh";
        document.getElementById("previewChannelMeta").textContent =
            activePreviewTab + " · Dự kiến " + (planned.replace(/\s+/g, " ") || "Chưa đặt lịch");

        const pImg = document.getElementById("previewMediaImg");
        const pVid = document.getElementById("previewMediaVideo");
        if (currentMedia.type === "VIDEO") {
            pImg.hidden = true;
            pVid.hidden = false;
            if (pVid.src !== currentMedia.url) pVid.src = currentMedia.url;
        } else {
            pVid.hidden = true;
            pImg.hidden = false;
            pImg.src = currentMedia.url || "../../assets/figma/skincare-editorial.png";
        }
    }

    function renderMediaAttachment() {
        document.getElementById("mediaFileName").textContent = currentMedia.name || "Chưa đính kèm tệp";
        document.getElementById("mediaFileMeta").textContent = currentMedia.meta || "Vui lòng tải lên JPG/PNG/WEBP hoặc MP4/MOV";

        const thumbImg = document.getElementById("mediaThumbImg");
        const thumbVid = document.getElementById("mediaThumbVideo");
        if (currentMedia.type === "VIDEO") {
            thumbImg.hidden = true;
            thumbVid.hidden = false;
            if (thumbVid.src !== currentMedia.url) thumbVid.src = currentMedia.url;
        } else {
            thumbVid.hidden = true;
            thumbImg.hidden = false;
            thumbImg.src = currentMedia.url || "../../assets/figma/skincare-editorial.png";
        }
        updateLivePreview();
        updateChecklist();
    }

    /* ---------- KIỂM TRA ĐỊNH DẠNG & DUNG LƯỢNG MEDIA (JPG/PNG/WEBP/MP4/MOV) ---------- */
    async function handleFileSelected(file) {
        if (!file) return;
        const errEl = document.getElementById("errMedia");
        errEl.classList.remove("is-visible");
        errEl.textContent = "";

        const fileName = file.name || "";
        const dotIdx = fileName.lastIndexOf(".");
        const ext = dotIdx !== -1 ? fileName.slice(dotIdx).toLowerCase() : "";

        const isImage = ALLOWED_IMAGE_EXT.indexOf(ext) !== -1 || ["image/jpeg", "image/png", "image/webp"].indexOf(file.type) !== -1;
        const isVideo = ALLOWED_VIDEO_EXT.indexOf(ext) !== -1 || ["video/mp4", "video/quicktime"].indexOf(file.type) !== -1;

        if (!isImage && !isVideo) {
            const msg = "Định dạng tệp '" + (ext || file.type || "không rõ") + "' không hợp lệ! Chỉ chấp nhận JPG, PNG, WEBP, MP4, MOV.";
            errEl.textContent = msg;
            errEl.classList.add("is-visible");
            UI.toast("error", "Sai định dạng tệp", msg);
            return;
        }

        const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
        const maxMb = isVideo ? 50 : 10;
        if (file.size > maxBytes) {
            const msgSize = "Dung lượng tệp vượt quá giới hạn cho phép (" + maxMb + "MB).";
            errEl.textContent = msgSize;
            errEl.classList.add("is-visible");
            UI.toast("error", "Tệp vượt quá dung lượng", msgSize);
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        const sizeMb = (file.size / (1024 * 1024)).toFixed(2).replace(".", ",");
        currentMedia = {
            name: fileName,
            meta: sizeMb + " MB · " + (isVideo ? "Video ngắn (MP4/MOV)" : "Hình ảnh (JPG/PNG/WEBP)"),
            type: isVideo ? "VIDEO" : "IMAGE",
            url: objectUrl,
            sizeBytes: file.size
        };

        renderMediaAttachment();
        UI.toast("success", "Đã tải tệp Media hợp lệ", fileName + " (" + sizeMb + " MB)");

        // Thử upload lên Backend /api/posts/upload-media nếu server đang chạy
        try {
            const formData = new FormData();
            formData.append("file", file);
            const token = localStorage.getItem("blossom_access_token");
            const headers = token ? { "Authorization": "Bearer " + token } : {};
            const resp = await fetch(BlossomAPI.API_BASE + "/posts/upload-media", {
                method: "POST",
                headers: headers,
                body: formData,
                credentials: "include"
            });
            if (resp.ok) {
                const uploaded = await resp.json();
                if (uploaded && uploaded.file_url) {
                    currentMedia.serverUrl = uploaded.file_url;
                }
            }
        } catch (e) {
            /* fallback local preview URL */
        }
    }

    /* ---------- AUTO-SAVE MỖI 30 GIÂY (FR-04 & NFR-05) ---------- */
    async function performAutoSave(isManualTrigger) {
        if (currentPostStatus === "PUBLISHED") return;

        const payload = collectFormPayload();
        try {
            localStorage.setItem(AUTOSAVE_DRAFT_KEY, JSON.stringify({
                savedAt: new Date().toISOString(),
                mode: isEditMode ? "edit" : "create",
                data: payload
            }));
        } catch (e) {
            /* ignore */
        }

        try {
            await BlossomAPI.request("/posts/autosave", {
                method: "POST",
                body: JSON.stringify({
                    post_id: currentPostId,
                    title: payload.title,
                    caption: payload.headline + "\n\n" + payload.caption,
                    hashtags: payload.hashtags,
                    platforms: payload.platforms,
                    media_type: currentMedia.type,
                    media_files: [currentMedia.serverUrl || currentMedia.url],
                    total_media_size_bytes: currentMedia.sizeBytes
                })
            });
        } catch (e) {
            /* offline fallback already saved to localStorage */
        }

        const timeLabel = formatTimeNow();
        document.getElementById("autoSaveText").textContent = "✓ Đã tự động lưu lúc " + timeLabel;
        if (isEditMode) {
            const code = (DEMO_POSTS[currentPostStatus] && DEMO_POSTS[currentPostStatus].code) || "BL-0127";
            document.getElementById("editorSubTitle").textContent =
                code + " · " + (payload.title || "Bài viết") + " · Đã lưu lúc " + timeLabel;
        }
        countdownRemaining = AUTOSAVE_INTERVAL_SEC;
        document.getElementById("autoSaveCountdown").textContent = String(countdownRemaining);

        if (isManualTrigger) {
            UI.toast("success", "Auto-save 30 giây", "Đã tự động lưu tạm dữ liệu bài viết lúc " + timeLabel + ".");
        }
    }

    function startAutoSaveTimer() {
        setInterval(function () {
            if (currentPostStatus === "PUBLISHED") return;
            countdownRemaining -= 1;
            if (countdownRemaining <= 0) {
                performAutoSave(false);
            } else {
                const el = document.getElementById("autoSaveCountdown");
                if (el) el.textContent = String(countdownRemaining);
            }
        }, 1000);
    }

    function collectFormPayload() {
        return {
            post_id: currentPostId,
            title: document.getElementById("postTitle").value.trim(),
            category: document.getElementById("postCategory").value,
            campaign: document.getElementById("postCampaign").value,
            headline: document.getElementById("postHeadline").value.trim(),
            caption: document.getElementById("postCaption").value.trim(),
            hashtags: document.getElementById("postHashtags").value.trim(),
            platforms: getSelectedPlatforms(),
            planned_time: document.getElementById("plannedPublishInput").value.trim(),
            approver: document.getElementById("approverSelect").value,
            status: currentPostStatus,
            media: currentMedia
        };
    }

    /* ---------- ÁP DỤNG TRẠNG THÁI BÀI VIẾT TRONG FR-05 (DRAFT / APPROVED / PUBLISHED / REVISION) ---------- */
    function applyPostState(stateKey) {
        const post = DEMO_POSTS[stateKey] || DEMO_POSTS.DRAFT;
        currentPostStatus = post.status;
        currentPostId = post.post_id;

        document.getElementById("editorCrumb").textContent = "Blossom / Bài viết / " + post.code + " / Chỉnh sửa";
        document.getElementById("editorSubTitle").textContent = post.code + " · " + post.title + " · Đã lưu lúc " + formatTimeNow();
        document.getElementById("postTitle").value = post.title;
        document.getElementById("postCategory").value = post.category;
        document.getElementById("postCampaign").value = post.campaign;
        document.getElementById("postHeadline").value = post.headline;
        document.getElementById("postCaption").value = post.caption;
        document.getElementById("postHashtags").value = post.hashtags;
        document.getElementById("plannedPublishInput").value = post.planned_time;
        document.getElementById("approverSelect").value = post.approver;

        setSelectedPlatforms(post.platforms);

        currentMedia = {
            name: post.media_name,
            meta: post.media_meta,
            type: post.media_type,
            url: post.media_url,
            sizeBytes: 1800000
        };
        renderMediaAttachment();

        // Status badge
        const badgeEl = document.getElementById("postStatusBadge");
        badgeEl.textContent = post.status_label;
        badgeEl.className = "fr04-status-pill";
        if (post.status === "APPROVED") badgeEl.classList.add("is-approved");
        else if (post.status === "PUBLISHED") badgeEl.classList.add("is-published");
        else if (post.status === "PENDING_APPROVAL") badgeEl.classList.add("is-pending");
        else if (post.status === "REVISION_REQUESTED") badgeEl.classList.add("is-revision");

        // History list
        const histEl = document.getElementById("editHistoryList");
        if (histEl && Array.isArray(post.history)) {
            histEl.innerHTML = post.history.map(function (item) {
                return '<div class="fr04-review-item">' +
                    '<img src="../../assets/figma/history.svg" alt="" width="16" height="16">' +
                    '<span>' + UI.esc(item) + '</span>' +
                '</div>';
            }).join("");
        }

        // Banner & locking rules (ERR-01 Published lock & BR-04/BR-05 Approved warning)
        const bannerEl = document.getElementById("stateWarningBanner");
        const isPublished = post.status === "PUBLISHED";

        if (isPublished) {
            bannerEl.hidden = false;
            bannerEl.className = "fr05-banner fr05-banner--published";
            bannerEl.innerHTML =
                '<div><b>🔒 Bài viết đã xuất bản:</b> ' +
                'Bài viết này đã được đăng chính thức (' + UI.esc(post.published_url || "") + '). ' +
                'Hệ thống khóa chức năng chỉnh sửa nội dung bài viết đã xuất bản, chỉ cho phép cập nhật liên kết thực tế và theo dõi số liệu thống kê.</div>';
        } else if (post.status === "APPROVED") {
            bannerEl.hidden = false;
            bannerEl.className = "fr05-banner fr05-banner--approved";
            bannerEl.innerHTML =
                '<div><b>⚠️ Cảnh báo chỉnh sửa bài viết đã phê duyệt:</b> ' +
                'Bài viết này đã được Quản lý phê duyệt. Nếu bạn lưu thay đổi nội dung hoặc Media, hệ thống sẽ tự động chuyển trạng thái bài viết về <b>Chờ phê duyệt (Pending Approval)</b> và tạm gỡ khỏi Lịch đăng bài để duyệt lại.</div>';
        } else if (post.status === "REVISION_REQUESTED") {
            bannerEl.hidden = false;
            bannerEl.className = "fr05-banner fr05-banner--revision";
            bannerEl.innerHTML = '<div><b>💬 Yêu cầu chỉnh sửa từ Marketing Manager:</b> ' + UI.esc(post.manager_comment || "") + '</div>';
        } else {
            bannerEl.hidden = true;
            bannerEl.innerHTML = "";
        }

        // Khóa hoặc mở khóa toàn bộ trường nhập liệu khi bài đã Published
        const lockableIds = [
            "postTitle", "postCategory", "postCampaign", "postHeadline",
            "postCaption", "postHashtags", "platformSelect", "plannedPublishInput",
            "approverSelect", "btnReplaceMedia", "btnRemoveMedia", "btnUploadIcon",
            "btnSaveDraft", "btnSubmitApproval"
        ];
        lockableIds.forEach(function (id) {
            const el = document.getElementById(id);
            if (el) el.disabled = isPublished;
        });
        document.querySelectorAll('#platformCheckboxes input[type="checkbox"]').forEach(function (cb) {
            cb.disabled = isPublished;
        });

        updateWordAndCharStats();
        updateLivePreview();
    }

    function validateRequiredFields() {
        const title = document.getElementById("postTitle").value.trim();
        const plats = getSelectedPlatforms();
        const errTitle = document.getElementById("errTitle");
        const errPlat = document.getElementById("errPlatform");

        errTitle.classList.toggle("is-visible", !title);
        errPlat.classList.toggle("is-visible", plats.length === 0);

        if (!title || plats.length === 0) {
            UI.toast("error", "Thiếu thông tin bắt buộc", "Vui lòng nhập đầy đủ Tiêu đề bài viết và chọn ít nhất một Nền tảng đích.");
            return false;
        }
        return true;
    }

    function prependHistoryEntry(text) {
        const histEl = document.getElementById("editHistoryList");
        if (!histEl) return;
        const row = document.createElement("div");
        row.className = "fr04-review-item";
        row.innerHTML = '<img src="../../assets/figma/history.svg" alt="" width="16" height="16"><span>' + UI.esc(formatTimeNow() + " · " + text) + '</span>';
        histEl.prepend(row);
    }

    async function handleSavePost(targetAction) {
        if (currentPostStatus === "PUBLISHED") {
            UI.toast("error", "Không thể chỉnh sửa", "Bài viết đã ở trạng thái Published, không được phép chỉnh sửa nội dung!");
            return;
        }

        if (!validateRequiredFields()) return;

        // Nếu đang sửa bài đã APPROVED -> Hiển thị hộp thoại cảnh báo xác nhận chuyển về PENDING_APPROVAL (FR-05 Step 4a)
        if (currentPostStatus === "APPROVED") {
            const confirmed = await UI.confirm({
                title: "Cảnh báo chỉnh sửa bài viết đã duyệt (Approved)",
                message: "Bài viết này đang ở trạng thái Đã phê duyệt. Việc lưu thay đổi sẽ đưa bài viết quay lại trạng thái Chờ duyệt và cập nhật trên Lịch đăng bài. Bạn có chắc chắn muốn tiếp tục?",
                confirmText: "Đồng ý & Gửi duyệt lại",
                cancelText: "Hủy thay đổi"
            });
            if (!confirmed) return;

            currentPostStatus = "PENDING_APPROVAL";
            const badgeEl = document.getElementById("postStatusBadge");
            badgeEl.textContent = "Chờ phê duyệt (Pending Approval)";
            badgeEl.className = "fr04-status-pill is-pending";
            prependHistoryEntry("Chỉnh sửa bài Approved → Tự động chuyển về Pending Approval");
        } else if (targetAction === "SUBMIT") {
            currentPostStatus = "PENDING_APPROVAL";
            const badgeEl = document.getElementById("postStatusBadge");
            badgeEl.textContent = "Chờ phê duyệt (Pending Approval)";
            badgeEl.className = "fr04-status-pill is-pending";
            prependHistoryEntry("Trần Ngọc Mai gửi duyệt bài viết");
        } else {
            prependHistoryEntry("Đã lưu thay đổi bản nháp");
        }

        const payload = collectFormPayload();

        // Đồng bộ trực tiếp với danh sách bài viết FR-06/07 (blossom_posts_fr06_07_v1)
        try {
            const list = getSharedPostList();
            const platLabel = payload.platforms.length >= 2
                ? payload.platforms.slice(0, 2).join(" & ")
                : (payload.platforms[0] || "Facebook");
            const dateMatch = (payload.planned_time || "").match(/(\d{2})\/(\d{2})\/(\d{4})/);
            const plannedLabel = dateMatch ? (dateMatch[1] + "/" + dateMatch[2] + "/" + dateMatch[3]) : "15/11/2026";
            const plannedIso = dateMatch ? (dateMatch[3] + "-" + dateMatch[2] + "-" + dateMatch[1]) : "2026-11-15";
            const todayLabel = new Date().toLocaleDateString("vi-VN");
            const userObj = (window.Auth && typeof window.Auth.getUser === "function") ? window.Auth.getUser() : null;
            const authorName = (userObj && userObj.fullName) ? userObj.fullName : "Trần Ngọc Mai";

            const targetStatus = isEditMode
                ? currentPostStatus
                : (targetAction === "SUBMIT" ? "PENDING_APPROVAL" : "DRAFT");

            if (isEditMode && currentPostId) {
                const idx = list.findIndex(function (item) { return Number(item.post_id) === Number(currentPostId); });
                if (idx !== -1) {
                    list[idx].title = payload.title;
                    list[idx].platforms = payload.platforms;
                    list[idx].platform_label = platLabel;
                    list[idx].status = targetStatus;
                    list[idx].planned_date = plannedIso;
                    list[idx].planned_label = plannedLabel;
                    list[idx].updated_label = todayLabel;
                    list[idx].caption = payload.caption;
                } else {
                    list.unshift({
                        post_id: currentPostId,
                        code: "BL-0" + currentPostId,
                        title: payload.title,
                        platforms: payload.platforms,
                        platform_label: platLabel,
                        author: authorName,
                        status: targetStatus,
                        planned_date: plannedIso,
                        planned_label: plannedLabel,
                        updated_label: todayLabel,
                        caption: payload.caption,
                        deleted_at: null
                    });
                }
            } else {
                const maxId = list.reduce(function (m, it) { return Math.max(m, Number(it.post_id) || 120); }, 128);
                const newId = maxId + 1;
                currentPostId = newId;
                list.unshift({
                    post_id: newId,
                    code: "BL-0" + newId,
                    title: payload.title,
                    platforms: payload.platforms,
                    platform_label: platLabel,
                    author: authorName,
                    status: targetStatus,
                    planned_date: plannedIso,
                    planned_label: plannedLabel,
                    updated_label: todayLabel,
                    caption: payload.caption,
                    deleted_at: null
                });
            }
            localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(list));
        } catch (e) {
            /* ignore */
        }

        // Gọi API Backend nếu đang chạy
        try {
            if (isEditMode && currentPostId) {
                await BlossomAPI.request("/posts/" + currentPostId, {
                    method: "PUT",
                    body: JSON.stringify({
                        title: payload.title,
                        caption: payload.headline + "\n\n" + payload.caption,
                        hashtags: payload.hashtags,
                        platforms: payload.platforms,
                        media_type: currentMedia.type,
                        media_files: [currentMedia.serverUrl || currentMedia.url],
                        total_media_size_bytes: currentMedia.sizeBytes
                    })
                });
            } else {
                await BlossomAPI.request("/posts", {
                    method: "POST",
                    body: JSON.stringify({
                        title: payload.title,
                        caption: payload.headline + "\n\n" + payload.caption,
                        hashtags: payload.hashtags,
                        platforms: payload.platforms,
                        media_type: currentMedia.type,
                        media_files: [currentMedia.serverUrl || currentMedia.url],
                        total_media_size_bytes: currentMedia.sizeBytes
                    })
                });
            }
        } catch (e) {
            /* offline fallback */
        }

        await performAutoSave(false);

        if (currentPostStatus === "PENDING_APPROVAL") {
            if (window.NotificationsStore) {
                window.NotificationsStore.addNotification({
                    type: "submitted",
                    postId: currentPostId,
                    title: "Nhân viên vừa gửi bài viết mới cần duyệt 📋",
                    message: "Nhân viên " + authorName + " vừa gửi duyệt bài '" + payload.title + "'.",
                    author: authorName,
                    recipientRole: "MANAGER"
                });
            }
            UI.toast("success", "Đã gửi duyệt bài viết", "Bài viết '" + payload.title + "' đã được gửi tới Quản lý phê duyệt.");
            setTimeout(function () {
                location.href = getPostListHref();
            }, 1000);
        } else {
            UI.toast("success", "Đã lưu bài viết thành công", "Bản ghi '" + payload.title + "' đã được lưu nháp lúc " + formatTimeNow() + ".");
        }
    }

    function bindEvents() {
        ["postTitle", "postHeadline", "postCaption", "postHashtags", "plannedPublishInput"].forEach(function (id) {
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener("input", function () {
                updateWordAndCharStats();
                updateChecklist();
                updateLivePreview();
            });
        });

        document.getElementById("platformSelect").addEventListener("change", function (e) {
            const val = e.target.value;
            if (val === "Facebook & Instagram") setSelectedPlatforms(["Facebook", "Instagram"]);
            else if (val === "Facebook, Instagram & Threads") setSelectedPlatforms(["Facebook", "Instagram", "Threads"]);
            else setSelectedPlatforms([val]);
            updateChecklist();
            updateLivePreview();
        });

        document.querySelectorAll('#platformCheckboxes input[type="checkbox"]').forEach(function (cb) {
            cb.addEventListener("change", function () {
                syncPlatformPresetSelect();
                updateChecklist();
                updateLivePreview();
            });
        });

        // Media upload handlers
        const fileInput = document.getElementById("mediaFileInput");
        ["btnReplaceMedia", "btnUploadIcon"].forEach(function (id) {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener("click", function () {
                    if (currentPostStatus === "PUBLISHED") return;
                    fileInput.click();
                });
            }
        });

        fileInput.addEventListener("change", function (e) {
            if (e.target.files && e.target.files[0]) {
                handleFileSelected(e.target.files[0]);
            }
        });

        document.getElementById("btnRemoveMedia").addEventListener("click", function () {
            if (currentPostStatus === "PUBLISHED") return;
            currentMedia = {
                name: "Chưa có tệp đính kèm",
                meta: "0 MB · Vui lòng chọn tệp JPG, PNG, WEBP, MP4 hoặc MOV",
                type: "IMAGE",
                url: "",
                sizeBytes: 0
            };
            renderMediaAttachment();
            UI.toast("warning", "Đã xóa tệp đính kèm", "Hãy tải lên hình ảnh hoặc video trước khi gửi duyệt.");
        });

        // Preview tabs
        document.getElementById("previewTabs").addEventListener("click", function (e) {
            const btn = e.target.closest("[data-tab]");
            if (!btn) return;
            activePreviewTab = btn.dataset.tab;
            document.querySelectorAll("#previewTabs .fr04-preview-tab").forEach(function (b) {
                b.classList.toggle("is-active", b === btn);
            });
            updateLivePreview();
        });

        // Formatting toolbar quick actions
        document.querySelectorAll("[data-format]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                if (currentPostStatus === "PUBLISHED") return;
                const fmt = btn.dataset.format;
                const area = document.getElementById("postCaption");
                if (fmt === "bullet") area.value += "\n• Điểm nhấn chăm sóc da dịu nhẹ.";
                else if (fmt === "number") area.value += "\n4. Xịt khoáng cấp ẩm tức thì.";
                else if (fmt === "image") fileInput.click();
                updateWordAndCharStats();
                updateLivePreview();
            });
        });

        document.getElementById("btnTriggerAutoSave").addEventListener("click", function () {
            performAutoSave(true);
        });

        document.getElementById("btnSaveDraft").addEventListener("click", function () {
            handleSavePost("DRAFT");
        });

        document.getElementById("btnSubmitApproval").addEventListener("click", function () {
            handleSavePost("SUBMIT");
        });

        const cancelBtn = document.getElementById("btnCancelEdit");
        if (cancelBtn) {
            cancelBtn.addEventListener("click", function () {
                const stateSel = document.getElementById("demoPostStateSelect");
                applyPostState(stateSel ? stateSel.value : "DRAFT");
                UI.toast("info", "Đã khôi phục dữ liệu", "Mọi thay đổi chưa lưu đã được hoàn tác.");
            });
        }

        const backLink = document.getElementById("btnBackToPostList");
        if (backLink) {
            backLink.href = getPostListHref();
        }

        const stateSelect = document.getElementById("demoPostStateSelect");
        if (stateSelect) {
            // Hỗ trợ truyền ?id=...&state=... từ trang Danh sách bài viết (FR-07)
            const params = new URLSearchParams(location.search);
            const urlId = Number(params.get("id") || 0);
            const urlState = (params.get("state") || "").toUpperCase();
            if (urlState && DEMO_POSTS[urlState]) {
                stateSelect.value = urlState;
            }
            applyPostState(stateSelect.value);

            // Nếu đi từ dòng bài viết cụ thể trong FR-07 (?id=...), nạp đúng bài viết đó vào form
            if (urlId) {
                const sharedList = getSharedPostList();
                const found = sharedList.find(function (p) { return Number(p.post_id) === urlId; });
                if (found) {
                    currentPostId = found.post_id;
                    currentPostStatus = found.status;
                    document.getElementById("editorCrumb").textContent = "Blossom / Bài viết / " + found.code + " / Chỉnh sửa";
                    document.getElementById("editorSubTitle").textContent = found.code + " · " + found.title + " · Đã lưu lúc " + formatTimeNow();
                    document.getElementById("postTitle").value = found.title;
                    if (found.caption) document.getElementById("postCaption").value = found.caption;
                    if (Array.isArray(found.platforms)) setSelectedPlatforms(found.platforms);
                    if (found.planned_label) {
                        document.getElementById("plannedPublishInput").value = found.planned_label + "         08:00";
                    }
                    const badgeEl = document.getElementById("postStatusBadge");
                    if (badgeEl) {
                        const statusLabelMap = {
                            DRAFT: "Bản nháp",
                            PENDING_APPROVAL: "Chờ duyệt",
                            APPROVED: "Đã phê duyệt (Approved)",
                            PUBLISHED: "Đã xuất bản (Published)",
                            REVISION_REQUESTED: "Cần chỉnh sửa",
                            SCHEDULED: "Đã lên lịch",
                            REJECTED: "Bị từ chối"
                        };
                        badgeEl.textContent = statusLabelMap[found.status] || found.status;
                        badgeEl.className = "fr04-status-pill";
                        if (found.status === "APPROVED" || found.status === "SCHEDULED") badgeEl.classList.add("is-approved");
                        else if (found.status === "PUBLISHED") badgeEl.classList.add("is-published");
                        else if (found.status === "PENDING_APPROVAL") badgeEl.classList.add("is-pending");
                        else if (found.status === "REVISION_REQUESTED" || found.status === "REJECTED") badgeEl.classList.add("is-revision");
                    }
                    updateWordAndCharStats();
                    updateLivePreview();
                }
            }

            stateSelect.addEventListener("change", function (e) {
                applyPostState(e.target.value);
            });
        }
    }

    updateWordAndCharStats();
    updateChecklist();
    updateLivePreview();
    bindEvents();
    startAutoSaveTimer();
})();
