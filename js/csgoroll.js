document.addEventListener('DOMContentLoaded', function() {
    // Variabel untuk pagination
    let currentPage = 1;
    const recordsPerPage = 10;
    let allPlayers = [];
    // Set the end date to September 30, 2025 23:59:59
    const endDate = new Date('September 30, 2025 23:59:59').getTime();
    
    // Update the countdown every second
    const countdown = setInterval(function() {
        // Get current date and time
        const now = new Date().getTime();
        
        // Calculate the remaining time
        const distance = endDate - now;
        
        // If the countdown is over, stop it
        if (distance < 0) {
            clearInterval(countdown);
            const countdownTimer = document.querySelector('.countdown-timer');
            if (countdownTimer) {
                countdownTimer.innerHTML = '<div class="countdown-ended">The leaderboard has ended!</div>';
            }
            return;
        }
        
        // Calculate days, hours, minutes, and seconds
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Update the display
        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');
        
        if (daysEl) daysEl.textContent = days.toString().padStart(2, '0');
        if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
        if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
        if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
    }, 1000);

    // Fungsi untuk memformat angka dengan pemisah ribuan dan 2 desimal
    function formatNumber(num) {
        // Konversi ke number jika input berupa string
        const number = typeof num === 'string' ? parseFloat(num) : num;
        // Format dengan 2 desimal dan pemisah ribuan
        return number.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Fungsi untuk mengupdate leaderboard
    async function updateLeaderboard() {
        try {
            console.log('Mengambil data leaderboard...');
            const response = await fetch('https://ace-csgoroll.agun9wib93.workers.dev/');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const responseData = await response.json();
            console.log('Data diterima:', responseData);
            
            // Ekstrak dan format data dari edges
            const players = responseData.data.affiliateEarningsByReferee.edges.map(edge => ({
                displayName: edge.node.referee?.displayName || 'Unknown',
                wageredTotal: edge.node.wageredTotal || 0,
                deposited: edge.node.deposited || 0,
                commission: edge.node.commission || 0
            }));
            
            // Urutkan data berdasarkan WageredTotal (terbesar ke terkecil)
            allPlayers = [...players].sort((a, b) => b.wageredTotal - a.wageredTotal);
            console.log('Data setelah diurutkan:', allPlayers);
            
            // Update Top 3 (kartu)
            const top3 = allPlayers.slice(0, 3);
            console.log('Top 3 pemain:', top3);
            
            top3.forEach((player, index) => {
                const rank = index + 1;
                const rankCard = document.querySelector(`.rank-${rank}`);
                if (rankCard) {
                    const usernameEl = rankCard.querySelector('.rank-username');
                    const wageredEl = rankCard.querySelector('.rank-wagered .amount');
                    const avatarEl = rankCard.querySelector('.avatar-img');
                    
                    if (usernameEl) usernameEl.textContent = player.displayName || `Player${rank}`;
                    if (wageredEl) {
                        // Hapus semua konten yang ada
                        wageredEl.innerHTML = '';
                        
                        // Buat container untuk amount dengan flex layout
                        const amountContainer = document.createElement('div');
                        amountContainer.className = 'wager-amount';
                        amountContainer.style.display = 'flex';
                        amountContainer.style.alignItems = 'center';
                        amountContainer.style.justifyContent = 'center';
                        amountContainer.style.gap = '6px';
                        
                        // Tambahkan ikon koin
                        const coinIcon = document.createElement('img');
                        coinIcon.src = 'assets/images/roll-coin.webp';
                        coinIcon.alt = 'Roll Coin';
                        coinIcon.className = 'coin-icon';
                        coinIcon.style.width = '16px';
                        coinIcon.style.height = '16px';
                        
                        // Tambahkan teks jumlah wager
                        const amountText = document.createElement('span');
                        amountText.textContent = formatNumber(player.wageredTotal || 0);
                        
                        // Gabungkan semuanya
                        amountContainer.appendChild(coinIcon);
                        amountContainer.appendChild(amountText);
                        wageredEl.appendChild(amountContainer);
                    }
                    if (avatarEl) {
                        avatarEl.alt = `${player.displayName || `Player${rank}`}'s avatar`;
                        avatarEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.displayName || `Player${rank}`)}&background=2d180f&color=ffd700&size=128`;
                    }
                    
                    // Update prize in the card
                    const prizeEl = rankCard.querySelector('.rank-prize');
                    if (prizeEl) {
                        // Hapus konten yang ada
                        prizeEl.innerHTML = '';
                        
                        // Tambahkan ikon hadiah
                        const prizeIcon = document.createElement('i');
                        prizeIcon.className = 'prize-icon';
                        
                        // Set ikon berdasarkan peringkat
                        switch(rank) {
                            case 1:
                                prizeIcon.className = 'fas fa-award gold';
                                break;
                            case 2:
                                prizeIcon.className = 'fas fa-medal silver';
                                break;
                            case 3:
                                prizeIcon.className = 'fas fa-medal bronze';
                                break;
                            default:
                                prizeIcon.className = 'fas fa-trophy';
                        }
                        
                        // Tambahkan teks hadiah
                        const prizeText = document.createElement('span');
                        prizeText.className = 'prize-text';
                        prizeText.textContent = getPrize(rank);
                        
                        // Gabungkan ikon dan teks
                        prizeEl.appendChild(prizeIcon);
                        prizeEl.appendChild(prizeText);
                    }
                }
            });
            
            // Update table dengan pagination
            updateTableForCurrentPage();
            
            // Update pagination controls
            updatePaginationControls();
            
            // Update table rows for ranks 4-10 (first page)
            const tableRows = document.querySelectorAll('.leaderboard-table tbody tr');
            const players4to10 = allPlayers.slice(3, 13); // Get first 10 players after top 3
            
            players4to10.forEach((player, index) => {
                const row = tableRows[index];
                if (row) {
                    const rank = index + 4;
                    const cells = row.cells;
                    
                    // Update rank
                    cells[0].textContent = rank;
                    
                    // Update username dan avatar
                    const usernameCell = cells[1];
                    const playerInfo = usernameCell.querySelector('.player-info');
                    if (playerInfo) {
                        const avatarImg = playerInfo.querySelector('.table-avatar');
                        const usernameSpan = playerInfo.querySelector('span');
                        
                        if (avatarImg) {
                            avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(player.displayName || `Player${rank}`)}&background=2d180f&color=ffd700&size=128`;
                            avatarImg.alt = `${player.displayName || `Player${rank}`}'s avatar`;
                        }
                        if (usernameSpan) {
                            usernameSpan.textContent = player.displayName || `Player${rank}`;
                        }
                    }
                    
                    // Update wagered with coin icon
                    cells[2].innerHTML = `
                        <div class="wager-amount">
                            <img src="assets/images/roll-coin.webp" alt="Roll Coin" class="coin-icon">
                            <span>${formatNumber(player.wageredTotal || 0)}</span>
                        </div>
                    `;
                    
                    // Update prize
                    const prize = getPrize(rank);
                    cells[3].textContent = prize;
                }
            });
            
            console.log('Leaderboard berhasil diperbarui');
            
        } catch (error) {
            console.error('Gagal mengambil data leaderboard:', error);
            // Tampilkan pesan error ke pengguna jika diperlukan
            const errorContainer = document.createElement('div');
            errorContainer.className = 'error-message';
            errorContainer.textContent = 'Gagal memuat data leaderboard. Silakan muat ulang halaman.';
            errorContainer.style.color = '#ff6b6b';
            errorContainer.style.textAlign = 'center';
            errorContainer.style.margin = '1rem 0';
            errorContainer.style.padding = '1rem';
            errorContainer.style.border = '1px solid #ff6b6b';
            errorContainer.style.borderRadius = '4px';
            
            const leaderboardContainer = document.querySelector('.leaderboard-top3');
            if (leaderboardContainer) {
                leaderboardContainer.parentNode.insertBefore(errorContainer, leaderboardContainer.nextSibling);
            }
        }
    }
    
    // Fungsi untuk mendapatkan hadiah berdasarkan peringkat
    function getPrize(rank) {
        const prizeMap = {
            1: 'M4A1-S | Black Lotus FN',
            2: 'StatTrak™ Nova | Graphite FN',
            3: 'Souvenir MAC-10 | Amber Fade FN'
        };
        return prizeMap[rank] || '-'; // Kembalikan '-' untuk peringkat 4 dan seterusnya
    }
    
    // Fungsi untuk mengupdate tabel berdasarkan halaman saat ini
    function updateTableForCurrentPage() {
        const tableBody = document.querySelector('.leaderboard-table tbody');
        if (!tableBody) return;
        
        // Kosongkan isi tabel
        tableBody.innerHTML = '';
        
        // Hitung indeks awal dan akhir untuk data yang akan ditampilkan
        const startIndex = (currentPage - 1) * recordsPerPage;
        const endIndex = Math.min(startIndex + recordsPerPage, allPlayers.length);
        const playersToShow = allPlayers.slice(startIndex, endIndex);
        
        // Tambahkan baris untuk setiap pemain
        playersToShow.forEach((player, index) => {
            const row = document.createElement('tr');
            const rank = startIndex + index + 1; // Rank global
            
            // Skip top 3 karena sudah ditampilkan di kartu
            if (rank <= 3) return;
            
            row.innerHTML = `
                <td>${rank}</td>
                <td>
                    <div class="player-info">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(player.displayName || `Player${rank}`)}&background=2d180f&color=ffd700&size=128" 
                             alt="${player.displayName || `Player${rank}`}'s avatar" 
                             class="table-avatar">
                        <span>${player.displayName || `Player${rank}`}</span>
                    </div>
                </td>
                <td>
                    <div class="wager-amount">
                        <img src="assets/images/roll-coin.webp" alt="Roll Coin" class="coin-icon">
                        <span>${formatNumber(player.wageredTotal || 0)}</span>
                    </div>
                </td>
                <td>${getPrize(rank)}</td>
            `;
            
            tableBody.appendChild(row);
        });
    }
    
    // Fungsi untuk mengupdate kontrol pagination
    function updatePaginationControls() {
        const paginationContainer = document.querySelector('.pagination');
        if (!paginationContainer) return;
        
        const totalPages = Math.ceil((allPlayers.length - 3) / recordsPerPage); // Kurangi 3 untuk top 3
        
        // Hapus tombol pagination yang ada
        paginationContainer.innerHTML = '';
        
        // Tombol Previous
        const prevButton = document.createElement('button');
        prevButton.textContent = '❮';
        prevButton.className = 'pagination-button';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                updateTableForCurrentPage();
                updatePaginationControls();
                window.scrollTo({ top: document.querySelector('.leaderboard-table').offsetTop - 50, behavior: 'smooth' });
            }
        });
        
        // Tombol Next
        const nextButton = document.createElement('button');
        nextButton.textContent = '❯';
        nextButton.className = 'pagination-button';
        nextButton.disabled = currentPage >= totalPages;
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                updateTableForCurrentPage();
                updatePaginationControls();
                window.scrollTo({ top: document.querySelector('.leaderboard-table').offsetTop - 50, behavior: 'smooth' });
            }
        });
        
        // Info halaman
        const pageInfo = document.createElement('span');
        pageInfo.className = 'page-info';
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        
        // Tambahkan elemen ke container
        paginationContainer.appendChild(prevButton);
        paginationContainer.appendChild(pageInfo);
        paginationContainer.appendChild(nextButton);
    }
    
    // Panggil fungsi updateLeaderboard saat halaman dimuat
    updateLeaderboard();
    
    // Update leaderboard setiap 5 menit
    setInterval(updateLeaderboard, 5 * 60 * 1000);
    
    // Highlight active logo based on current page
    const logoBtns = document.querySelectorAll('.logo-btn');
    const currentPagePath = window.location.pathname.split('/').pop() || 'index.html';
    
    logoBtns.forEach(btn => {
        if (btn.getAttribute('href') === currentPagePath) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
});
