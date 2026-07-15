(function() {
    'use strict';

    // ===========================================================
    //  DOM REFS
    // ===========================================================
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

    const clockTime = $('#clockTime');
    const tabBtns = $$('.tab-btn');
    const panels = {
        free: $('#panel-free'),
        vip: $('#panel-vip'),
    };

    // Free
    const refCodeFree = $('#refCodeFree');
    const applyRefFree = $('#applyRefFree');
    const getKeyFree = $('#getKeyFree');
    const keyDisplayFree = $('#keyDisplayFree');
    const copyKeyFree = $('#copyKeyFree');
    const clearKeyFree = $('#clearKeyFree');
    const buffKeyFree = $('#buffKeyFree');
    const btnBuffFree = $('#btnBuffFree');

    // VIP
    const rechargeItems = $$('.recharge-item');
    const vipBuffCount = $('#vipBuffCount');
    const btnRecharge = $('#btnRecharge');
    const keyDisplayVip = $('#keyDisplayVip');
    const copyKeyVip = $('#copyKeyVip');
    const clearKeyVip = $('#clearKeyVip');
    const buffKeyVip = $('#buffKeyVip');
    const btnBuffVip = $('#btnBuffVip');
    const vipTotalBuffs = $('#vipTotalBuffs');
    const vipRemaining = $('#vipRemaining');
    const remainingDisplay = $('#remainingDisplay');

    // Free VIP Key
    const getFreeVipKeyBtn = $('#getFreeVipKey');
    const freeVipKeyDisplay = $('#freeVipKeyDisplay');
    const copyFreeVipKey = $('#copyFreeVipKey');
    const clearFreeVipKey = $('#clearFreeVipKey');
    const freeVipKeyCount = $('#freeVipKeyCount');
    const freeVipTotalDisplay = $('#freeVipTotalDisplay');

    // Task inputs
    const tiktokLinkInput = $('#tiktokLinkInput');
    const submitTiktokLink = $('#submitTiktokLink');
    const nameInput = $('#nameInput');
    const submitName = $('#submitName');

    // Modals
    const rechargeModal = $('#rechargeModal');
    const closeRechargeModal = $('#closeRechargeModal');
    const cancelRecharge = $('#cancelRecharge');
    const confirmRecharge = $('#confirmRecharge');
    const modalRechargeAmount = $('#modalRechargeAmount');
    const modalRechargeBuffs = $('#modalRechargeBuffs');
    const adminCodeInput = $('#adminCodeInput');
    const transferContent = $('#transferContent');

    const keyModal = $('#keyModal');
    const closeKeyModal = $('#closeKeyModal');
    const closeKeyModalBtn = $('#closeKeyModalBtn');
    const modalKeyContent = $('#modalKeyContent');
    const copyKeyModal = $('#copyKeyModal');

    const toastContainer = $('#toastContainer');

    // Buff Overlay
    const buffOverlay = $('#buffOverlay');
    const buffNumber = $('#buffNumber');
    const buffCurrent = $('#buffCurrent');
    const buffTotal = $('#buffTotal');
    const buffLabel = $('#buffLabel');
    const buffStatusText = $('#buffStatusText');
    const buffProgressBar = $('#buffProgressBar');
    const buffSub = $('#buffSub');
    const buffSuccess = $('#buffSuccess');
    const buffCloseBtn = $('#buffCloseBtn');

    // ===========================================================
    //  DANH SÁCH LINK GET KEY
    // ===========================================================
    const getKeyLinks = [
        'https://link4m.org/QpcUA',
        'https://link4m.net/q93pk',
        'https://link4m.net/wL2VHfzf',
        'https://link4m.net/ZxOKu8u'
    ];

    // ===========================================================
    //  DANH SÁCH KEY CÓ SẴN (DÙNG 1 LẦN)
    // ===========================================================
    const keyPool = [
        'A7XQ-9MPL-K4ZT',
        'F2RW-H8YN-P6CV',
        'Q9KD-X3LP-W7MA',
        'N5TZ-B4QY-R8XC'
    ];

    // ===========================================================
    //  STATE
    // ===========================================================
    let state = {
        freeKey: '',
        refCode: '',
        selectedAmount: 30000,
        selectedBuffs: 3,
        vipKey: '',
        vipBuffs: 0,
        vipUsed: 0,
        isBuffing: false,
        completedTasks: [],
        freeVipKeys: 0,
        currentFreeVipKey: '',
        totalFreeVipEarned: 0,
        usedKeys: [],
        taskStatus: {
            1: false,
            2: false,
            3: false
        }
    };

    // ===========================================================
    //  CLOCK
    // ===========================================================
    function updateClock() {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        const s = String(now.getSeconds()).padStart(2, '0');
        clockTime.textContent = `${h}:${m}:${s}`;
    }
    updateClock();
    setInterval(updateClock, 1000);

    // ===========================================================
    //  TOAST
    // ===========================================================
    function showToast(message, type = 'info', duration = 3500) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️',
        };
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <span class="icon">${icons[type] || 'ℹ️'}</span>
            <span class="msg">${message}</span>
            <button class="close-toast"><i class="fas fa-times"></i></button>
        `;
        toastContainer.appendChild(toast);

        const close = () => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(40px)';
            setTimeout(() => toast.remove(), 300);
        };

        toast.querySelector('.close-toast').addEventListener('click', close);
        setTimeout(close, duration);

        return toast;
    }

    // ===========================================================
    //  UTILITY
    // ===========================================================
    function formatCurrency(amount) {
        return amount.toLocaleString('vi-VN') + 'đ';
    }

    function copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                showToast('Đã sao chép vào clipboard!', 'success');
            }).catch(() => {
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
    }

    function fallbackCopy(text) {
        const el = document.createElement('textarea');
        el.value = text;
        document.body.appendChild(el);
        el.select();
        try {
            document.execCommand('copy');
            showToast('Đã sao chép vào clipboard!', 'success');
        } catch (e) {
            showToast('Không thể sao chép, vui lòng copy thủ công.', 'error');
        }
        document.body.removeChild(el);
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function generateKey(prefix = 'VIP') {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let key = prefix;
        for (let i = 0; i < 12; i++) {
            if (i > 0 && i % 4 === 0) key += '-';
            key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return key;
    }

    // ===========================================================
    //  LẤY KEY TỪ POOL (NGẪU NHIÊN, 1 LẦN)
    // ===========================================================
    function getAvailableKey() {
        const available = keyPool.filter(k => !state.usedKeys.includes(k));
        if (available.length === 0) {
            showToast('❌ Đã hết key! Vui lòng thử lại sau.', 'error');
            return null;
        }
        const randomIndex = Math.floor(Math.random() * available.length);
        return available[randomIndex];
    }

    // ===========================================================
    //  UPDATE VIP STATS
    // ===========================================================
    function updateVipStats() {
        const total = state.vipBuffs + state.freeVipKeys;
        const used = state.vipUsed;
        const remaining = total - used;
        vipTotalBuffs.textContent = total;
        vipRemaining.textContent = Math.max(0, remaining);
        remainingDisplay.textContent = Math.max(0, remaining);
        vipBuffCount.textContent = state.selectedBuffs;
        freeVipKeyCount.textContent = state.freeVipKeys;
        freeVipTotalDisplay.textContent = state.freeVipKeys;
    }

    // ===========================================================
    //  TASK SYSTEM
    // ===========================================================
    window.completeTask = function(taskId) {
        if (state.completedTasks.includes(taskId)) {
            showToast('Nhiệm vụ này đã hoàn thành!', 'warning');
            return;
        }

        // Kiểm tra task 1: YouTube
        if (taskId === 1) {
            window.open('https://www.youtube.com/@baonamvietsub', '_blank');
        }

        // Kiểm tra task 2: TikTok
        if (taskId === 2) {
            const link = tiktokLinkInput.value.trim();
            if (!link) {
                showToast('Vui lòng dán link TikTok của bạn!', 'warning');
                return;
            }
            showToast('✅ Đã gửi link TikTok để admin kiểm tra!', 'success');
        }

        // Kiểm tra task 3: Nhập mã mời
        if (taskId === 3) {
            const name = nameInput.value.trim();
            if (!name) {
                showToast('Vui lòng nhập tên của bạn!', 'warning');
                return;
            }
            const refCode = refCodeFree.value.trim().toUpperCase();
            if (refCode !== 'NOVELAH2025') {
                showToast('❌ Mã mời không đúng! Vui lòng nhập NOVELAH2025', 'error');
                return;
            }
            showToast(`✅ Đã gửi tên "${name}" để admin kiểm tra!`, 'success');
        }

        const taskBtn = document.getElementById(`taskBtn${taskId}`);
        const taskItem = document.querySelector(`.task-item[data-task="${taskId}"]`);

        state.completedTasks.push(taskId);
        state.taskStatus[taskId] = true;
        taskItem.classList.add('completed');

        taskBtn.innerHTML = '<i class="fas fa-check-circle"></i> Đã nhận';
        taskBtn.classList.add('completed');
        taskBtn.disabled = true;

        let reward = 1;
        if (taskId === 3) reward = 2;

        state.freeVipKeys += reward;
        state.totalFreeVipEarned += reward;
        updateVipStats();

        showToast(`🎉 Hoàn thành nhiệm vụ! Nhận ${reward} Key VIP Free!`, 'success', 4000);

        if (state.freeVipKeys > 0) {
            const newKey = generateKey('FREE');
            state.currentFreeVipKey = newKey;
            freeVipKeyDisplay.textContent = newKey;
            freeVipKeyDisplay.className = 'key-display has-key';
            state.vipKey = newKey;
            keyDisplayVip.textContent = newKey;
            keyDisplayVip.className = 'key-display has-key';
            showToast(`🔑 Key VIP Free đã sẵn sàng!`, 'success', 2000);
        }
    };

    // ===========================================================
    //  SUBMIT TIKTOK LINK
    // ===========================================================
    submitTiktokLink.addEventListener('click', function() {
        const link = tiktokLinkInput.value.trim();
        if (!link) {
            showToast('Vui lòng dán link TikTok của bạn!', 'warning');
            return;
        }
        showToast(`✅ Đã gửi link TikTok để admin kiểm tra: ${link}`, 'success');
    });

    // ===========================================================
    //  SUBMIT NAME
    // ===========================================================
    submitName.addEventListener('click', function() {
        const name = nameInput.value.trim();
        if (!name) {
            showToast('Vui lòng nhập tên của bạn!', 'warning');
            return;
        }
        const refCode = refCodeFree.value.trim().toUpperCase();
        if (refCode !== 'NOVELAH2025') {
            showToast('❌ Mã mời không đúng! Vui lòng nhập NOVELAH2025', 'error');
            return;
        }
        showToast(`✅ Đã gửi tên "${name}" để admin kiểm tra!`, 'success');
    });

    // ===========================================================
    //  FREE VIP KEY
    // ===========================================================
    getFreeVipKeyBtn.addEventListener('click', function() {
        if (state.freeVipKeys <= 0) {
            showToast('Bạn chưa có Key VIP Free nào! Hãy hoàn thành nhiệm vụ.', 'warning');
            return;
        }

        const key = generateKey('FREE');
        state.currentFreeVipKey = key;
        state.freeVipKeys--;
        state.vipBuffs += 1;
        updateVipStats();

        freeVipKeyDisplay.textContent = key;
        freeVipKeyDisplay.className = 'key-display has-key';

        state.vipKey = key;
        keyDisplayVip.textContent = key;
        keyDisplayVip.className = 'key-display has-key';

        showToast(`🎉 Nhận Key VIP Free thành công! Còn ${state.freeVipKeys} key.`, 'success', 3000);

        modalKeyContent.textContent = key;
        keyModal.classList.add('show');
    });

    copyFreeVipKey.addEventListener('click', function() {
        const key = freeVipKeyDisplay.textContent;
        if (!key || key.includes('xuất hiện')) {
            showToast('Chưa có key để sao chép!', 'warning');
            return;
        }
        copyToClipboard(key);
    });

    clearFreeVipKey.addEventListener('click', function() {
        state.currentFreeVipKey = '';
        freeVipKeyDisplay.textContent = '🔑 Key VIP Free sẽ xuất hiện tại đây';
        freeVipKeyDisplay.className = 'key-display';
        showToast('Đã xóa key', 'info');
    });

    // ===========================================================
    //  GET KEY FREE - LẤY KEY TỪ POOL + MỞ LINK RANDOM
    // ===========================================================
    getKeyFree.addEventListener('click', function() {
        if (state.isBuffing) return;

        // Mở link random trong tab mới
        const randomLinkIndex = Math.floor(Math.random() * getKeyLinks.length);
        const link = getKeyLinks[randomLinkIndex];
        window.open(link, '_blank');

        // Lấy key từ pool
        const key = getAvailableKey();
        if (!key) {
            showToast('❌ Đã hết key! Vui lòng thử lại sau.', 'error');
            return;
        }

        // Đánh dấu key đã dùng
        state.usedKeys.push(key);
        state.freeKey = key;
        keyDisplayFree.textContent = key;
        keyDisplayFree.className = 'key-display has-key';
        showToast(`🔑 Key Free: ${key} (Đã mở link)`, 'success', 3000);
    });

    copyKeyFree.addEventListener('click', function() {
        if (!state.freeKey) {
            showToast('Chưa có key để sao chép!', 'warning');
            return;
        }
        copyToClipboard(state.freeKey);
    });

    clearKeyFree.addEventListener('click', function() {
        state.freeKey = '';
        keyDisplayFree.textContent = '🔑 Key sẽ xuất hiện tại đây';
        keyDisplayFree.className = 'key-display';
        buffKeyFree.value = '';
        showToast('Đã xóa key', 'info');
    });

    // ===========================================================
    //  BUFF PROCESS
    // ===========================================================
    function startBuffProcess(type, btnElement) {
        if (state.isBuffing) {
            showToast('Đang có một tiến trình buff chạy, vui lòng đợi!', 'warning');
            return;
        }

        btnElement.disabled = true;
        state.isBuffing = true;

        buffOverlay.classList.add('show');
        buffCurrent.textContent = '0';
        buffTotal.textContent = '0';
        buffProgressBar.style.width = '0%';
        buffStatusText.textContent = 'Đang khởi tạo...';
        buffSub.textContent = 'Vui lòng chờ trong giây lát';
        buffSuccess.style.display = 'none';
        buffCloseBtn.style.display = 'none';
        buffCloseBtn.classList.remove('show');

        let maxCount, label;
        if (type === 'free') {
            maxCount = getRandomInt(10000, 100000);
            label = 'Buff Thường';
        } else {
            maxCount = getRandomInt(1, 1000);
            label = 'Buff VIP';
        }

        buffLabel.textContent = `${label}`;
        buffTotal.textContent = maxCount;

        let current = 0;
        const step = Math.max(1, Math.floor(maxCount / 80));

        const interval = setInterval(() => {
            current += step;
            if (current > maxCount) current = maxCount;

            const percent = (current / maxCount) * 100;
            buffProgressBar.style.width = percent + '%';
            buffCurrent.textContent = current;

            if (current < maxCount * 0.7) {
                buffStatusText.textContent = `Đang buff... ${current}/${maxCount}`;
            } else if (current < maxCount) {
                buffStatusText.textContent = `Gần xong... ${current}/${maxCount}`;
            }

            if (current >= maxCount) {
                clearInterval(interval);
                buffStatusText.textContent = '✅ Hoàn tất';
                buffProgressBar.style.width = '100%';
                buffSub.textContent = 'Admin sẽ xử lý yêu cầu của bạn trong 24h tới';
                buffSuccess.style.display = 'block';
                buffCloseBtn.style.display = 'inline-flex';
                buffCloseBtn.classList.add('show');

                showToast(`📨 Đã gửi yêu cầu ${label}, admin sẽ buff trong 24h tới.`, 'success', 4000);

                if (type === 'free') {
                    // Xóa key đã dùng (key chỉ dùng 1 lần)
                    state.freeKey = '';
                    keyDisplayFree.textContent = '🔑 Key sẽ xuất hiện tại đây';
                    keyDisplayFree.className = 'key-display';
                    buffKeyFree.value = '';
                } else {
                    const totalBuffs = state.vipBuffs + state.freeVipKeys;
                    if (totalBuffs > state.vipUsed) {
                        state.vipUsed++;
                        updateVipStats();
                    }
                    state.vipKey = '';
                    keyDisplayVip.textContent = '🔑 Key VIP sẽ xuất hiện sau khi nạp hoặc nhận nhiệm vụ';
                    keyDisplayVip.className = 'key-display';
                    buffKeyVip.value = '';
                    freeVipKeyDisplay.textContent = '🔑 Key VIP Free sẽ xuất hiện tại đây';
                    freeVipKeyDisplay.className = 'key-display';
                    state.currentFreeVipKey = '';
                }

                btnElement.disabled = false;
                state.isBuffing = false;
            }
        }, 30);
    }

    // ===========================================================
    //  TABS
    // ===========================================================
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (state.isBuffing) return;
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const tab = this.dataset.tab;
            Object.keys(panels).forEach(key => {
                panels[key].classList.toggle('active', key === tab);
            });
        });
    });

    // ===========================================================
    //  FREE PANEL
    // ===========================================================

    applyRefFree.addEventListener('click', function() {
        const code = refCodeFree.value.trim().toUpperCase();
        if (!code) {
            showToast('Vui lòng nhập mã mời!', 'warning');
            return;
        }
        state.refCode = code;
        if (code === 'NOVELAH2025') {
            showToast('✅ Mã mời hợp lệ! Bạn có thể nhận nhiệm vụ nhập mã mời.', 'success');
        } else {
            showToast(`Đã áp dụng mã mời: ${code}`, 'info');
        }
    });

    refCodeFree.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') applyRefFree.click();
    });

    btnBuffFree.addEventListener('click', function() {
        const key = buffKeyFree.value.trim();
        if (!key) {
            showToast('Vui lòng nhập key!', 'warning');
            return;
        }
        if (key !== state.freeKey) {
            showToast('Key không hợp lệ! Vui lòng kiểm tra lại.', 'error');
            return;
        }
        startBuffProcess('free', btnBuffFree);
    });

    // ===========================================================
    //  VIP PANEL
    // ===========================================================

    rechargeItems.forEach(item => {
        item.addEventListener('click', function() {
            if (state.isBuffing) return;
            rechargeItems.forEach(i => i.classList.remove('selected'));
            this.classList.add('selected');
            const amount = parseInt(this.dataset.amount, 10);
            const buffs = parseInt(this.dataset.buffs, 10);
            state.selectedAmount = amount;
            state.selectedBuffs = buffs;
            vipBuffCount.textContent = buffs;
        });
    });

    btnRecharge.addEventListener('click', function() {
        if (state.isBuffing) {
            showToast('Đang có tiến trình buff, vui lòng đợi!', 'warning');
            return;
        }
        const amount = state.selectedAmount;
        const buffs = state.selectedBuffs;
        modalRechargeAmount.textContent = formatCurrency(amount);
        modalRechargeBuffs.textContent = buffs;
        transferContent.textContent = state.refCode || 'Mã mời của bạn (nếu có)';
        adminCodeInput.value = '';
        rechargeModal.classList.add('show');
    });

    function closeRechargeModalFn() {
        rechargeModal.classList.remove('show');
    }
    closeRechargeModal.addEventListener('click', closeRechargeModalFn);
    cancelRecharge.addEventListener('click', closeRechargeModalFn);
    rechargeModal.addEventListener('click', function(e) {
        if (e.target === this) closeRechargeModalFn();
    });

    confirmRecharge.addEventListener('click', function() {
        const adminCode = adminCodeInput.value.trim();
        if (!adminCode) {
            showToast('Vui lòng nhập mã code admin!', 'warning');
            return;
        }
        const buffs = state.selectedBuffs;
        const vipKey = generateKey('VIP');
        state.vipKey = vipKey;
        state.vipBuffs += buffs;

        keyDisplayVip.textContent = vipKey;
        keyDisplayVip.className = 'key-display has-key';

        updateVipStats();

        closeRechargeModalFn();
        showToast(`🎉 Nạp thành công! Nhận ${buffs} Buff VIP. Tổng: ${state.vipBuffs} lượt.`, 'success', 4000);

        modalKeyContent.textContent = vipKey;
        keyModal.classList.add('show');
    });

    copyKeyVip.addEventListener('click', function() {
        if (!state.vipKey) {
            showToast('Chưa có key VIP! Hãy nạp tiền hoặc nhận nhiệm vụ.', 'warning');
            return;
        }
        copyToClipboard(state.vipKey);
    });

    clearKeyVip.addEventListener('click', function() {
        state.vipKey = '';
        keyDisplayVip.textContent = '🔑 Key VIP sẽ xuất hiện sau khi nạp hoặc nhận nhiệm vụ';
        keyDisplayVip.className = 'key-display';
        buffKeyVip.value = '';
        showToast('Đã xóa key VIP', 'info');
    });

    btnBuffVip.addEventListener('click', function() {
        const key = buffKeyVip.value.trim();
        if (!key) {
            showToast('Vui lòng nhập key VIP!', 'warning');
            return;
        }
        if (key !== state.vipKey) {
            showToast('Key VIP không hợp lệ!', 'error');
            return;
        }
        const totalBuffs = state.vipBuffs + state.freeVipKeys;
        const remaining = totalBuffs - state.vipUsed;
        if (remaining <= 0) {
            showToast('Bạn đã sử dụng hết số Buff VIP. Vui lòng nạp thêm hoặc nhận nhiệm vụ!', 'error');
            return;
        }
        startBuffProcess('vip', btnBuffVip);
    });

    // ===========================================================
    //  KEY MODAL
    // ===========================================================
    function closeKeyModalFn() {
        keyModal.classList.remove('show');
    }
    closeKeyModal.addEventListener('click', closeKeyModalFn);
    closeKeyModalBtn.addEventListener('click', closeKeyModalFn);
    keyModal.addEventListener('click', function(e) {
        if (e.target === this) closeKeyModalFn();
    });

    copyKeyModal.addEventListener('click', function() {
        const text = modalKeyContent.textContent;
        if (text) copyToClipboard(text);
    });

    // ===========================================================
    //  AUTO-FILL KEY ON CLICK DISPLAY
    // ===========================================================
    keyDisplayFree.addEventListener('click', function() {
        if (state.freeKey) {
            buffKeyFree.value = state.freeKey;
            showToast('Đã điền key vào ô nhập', 'info');
        }
    });

    keyDisplayVip.addEventListener('click', function() {
        if (state.vipKey) {
            buffKeyVip.value = state.vipKey;
            showToast('Đã điền key VIP vào ô nhập', 'info');
        }
    });

    freeVipKeyDisplay.addEventListener('click', function() {
        const key = freeVipKeyDisplay.textContent;
        if (key && !key.includes('xuất hiện')) {
            buffKeyVip.value = key;
            showToast('Đã điền key VIP Free vào ô nhập', 'info');
        }
    });

    // ===========================================================
    //  CLOSE BUFF OVERLAY
    // ===========================================================
    buffCloseBtn.addEventListener('click', function() {
        buffOverlay.classList.remove('show');
        if (state.isBuffing) {
            state.isBuffing = false;
            btnBuffFree.disabled = false;
            btnBuffVip.disabled = false;
        }
    });

    // ===========================================================
    //  INIT
    // ===========================================================
    vipBuffCount.textContent = '3';
    updateVipStats();

    console.log('🚀 Novelah Tool loaded successfully!');
    console.log('📌 Key Free: Lấy từ pool, mỗi key dùng 1 lần');
    console.log('📌 Key VIP: Tự động tạo khi nạp hoặc nhận nhiệm vụ');
    console.log('🔒 Mỗi key chỉ dùng 1 lần, phải get key mới sau khi buff.');
    console.log('💰 Gói 300k = 60 Buff VIP');
    console.log('🔄 Cộng dồn số lượt VIP khi nạp nhiều lần');
    console.log('⭐ Nhiệm vụ: YouTube, TikTok (dán link), Nhập mã mời NOVELAH2025 (nhập tên)');

})();
