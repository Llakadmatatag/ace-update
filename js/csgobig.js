document.addEventListener('DOMContentLoaded', function() {
    // Variables for pagination
    let currentPage = 1;
    const recordsPerPage = 10;
    let allPlayers = [];
    
    // Set the end date to October 31, 2025 23:59:59 UTC
    const endDate = new Date('2025-10-31T23:59:59Z').getTime();
    
    // Format number with commas
    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    // Format wager amount with exactly 2 decimal places
    function formatWager(amount) {
        // Convert to number, round to 2 decimal places, then format with commas
        const formattedNumber = parseFloat(amount).toFixed(2);
        return formatNumber(formattedNumber);
    }
    
    // Create coin icon element
    function createCoinIcon() {
        const img = document.createElement('img');
        img.src = 'assets/images/big-coin.svg';
        img.alt = 'coin';
        img.className = 'coin-icon';
        return img;
    }

    // Format prize amount based on rank with coin icon
    function getPrizeForRank(rank) {
        const prizes = {
            1: 75,
            2: 35,
            3: 25,
            4: 15
        };
        
        // For rank 5 and above, return dash
        if (rank > 4) {
            return '-';
        }
        
        // For ranks 1-4, return the value with coin icon
        const prizeValue = prizes[rank] || 0;
        return `${prizeValue}`;
    }

    // Fetch leaderboard data from API
    async function fetchLeaderboardData() {
        try {
            const response = await fetch('https://ace-csgobig.agun9wib93.workers.dev/');
            if (!response.ok) {
                throw new Error('Failed to fetch leaderboard data');
            }
            const data = await response.json();
            
            // Log only if there's an error in the response
            
            if (!data.success || !Array.isArray(data.results)) {
                throw new Error('Invalid data format from API');
            }
            
            // Process and sort players by wagerTotal in descending order
            allPlayers = data.results.map((player, index) => {
                // Process player data
                // Process avatar URL
                let avatarUrl = player.img || '';
                const defaultAvatar = 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_medium.jpg';
                
                try {
                    if (!avatarUrl) {
                        console.log(`Player ${player.name}: No avatar URL, using default`);
                        avatarUrl = defaultAvatar;
                    } else {
                        
                        // If it's a full URL, ensure it's HTTPS
                        if (avatarUrl.startsWith('http')) {
                            avatarUrl = avatarUrl.replace('http:', 'https:');
                        } 
                        // Handle protocol-relative URLs
                        else if (avatarUrl.startsWith('//')) {
                            avatarUrl = 'https:' + avatarUrl;
                        }
                        // Handle root-relative paths
                        else if (avatarUrl.startsWith('/')) {
                            // If it's a site asset, make it a full URL
                            if (avatarUrl.startsWith('/assets/') || avatarUrl.startsWith('/censored/')) {
                                avatarUrl = window.location.origin + avatarUrl;
                            } else {
                                // Assume it's a Steam avatar
                                avatarUrl = 'https://avatars.steamstatic.com' + avatarUrl;
                            }
                        }
                        // Handle bare filenames
                        else {
                            avatarUrl = `https://avatars.steamstatic.com/${avatarUrl}`;
                        }
                        
                    }
                } catch (error) {
                    console.error(`Error processing avatar for ${player.name}:`, error);
                    avatarUrl = defaultAvatar;
                }return {
                    id: player.id,
                    username: player.name,
                    avatar: avatarUrl,
                    wager: parseFloat(player.wagerTotal) || 0,
                    level: player.level,
                    lastActive: player.lastActive,
                    joined: player.joined,
                    totalDeposits: player.totalDeposits,
                        totalRewards: player.totalRewards
                    };
                })
                .sort((a, b) => b.wager - a.wager);
            
            // Update the leaderboard UI
            updateLeaderboard();
        } catch (error) {
            console.error('Error fetching leaderboard data:', error);
            // Show error message to user
            const leaderboardContainer = document.querySelector('.leaderboard-table tbody');
            if (leaderboardContainer) {
                leaderboardContainer.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align: center; padding: 20px; color: #ff6b6b;">
                            Failed to load leaderboard. Please try again later.
                        </td>
                    </tr>`;
            }
        }
    }

    // Update the leaderboard UI with the fetched data
    function updateLeaderboard() {
        // Update top 3 players
        updateTopPlayers();
        
        // Update leaderboard table
        updateLeaderboardTable();
    }

    // Update the top 3 players section
    function updateTopPlayers() {
        const topPlayers = allPlayers.slice(0, 3);
        
        topPlayers.forEach((player, index) => {
            const rank = index + 1;
            const rankCard = document.querySelector(`.rank-${rank}`);
            
            if (rankCard) {
                // Update avatar
                const avatar = rankCard.querySelector('.rank-avatar img');
                if (avatar) {
                    // Set up error handling first
                    avatar.onerror = function() {
                        this.src = 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_medium.jpg';
                        this.onerror = null; // Prevent infinite loop
                    };
                    
                    // Set the source with cache busting
                    const timestamp = Date.now();
                    const separator = player.avatar.includes('?') ? '&' : '?';
                    avatar.src = player.avatar + separator + 't=' + timestamp;
                    
                    avatar.alt = player.username || 'Player';
                    avatar.loading = 'eager'; // Force load images immediately
                    
                }
                
                // Update username
                const usernameEl = rankCard.querySelector('.rank-username');
                if (usernameEl) {
                    usernameEl.textContent = player.username;
                }
                
                // Update wager amount with coin icon
                const wagerEl = rankCard.querySelector('.rank-wagered .amount');
                if (wagerEl) {
                    // Clear existing content
                    wagerEl.innerHTML = '';
                    // Add coin icon
                    wagerEl.appendChild(createCoinIcon());
                    // Add wager amount as text node
                    wagerEl.appendChild(document.createTextNode(formatWager(player.wager)));
                }
                
                // Update prize amount with coin icon or dash
                const prizeEl = rankCard.querySelector('.rank-prize .amount');
                if (prizeEl) {
                    prizeEl.innerHTML = ''; // Clear existing content
                    if (rank > 4) {
                        prizeEl.textContent = '-';
                    } else {
                        prizeEl.appendChild(createCoinIcon());
                        prizeEl.appendChild(document.createTextNode(getPrizeForRank(rank)));
                    }
                }
            }
        });
    }

    // Update the leaderboard table
    function updateLeaderboardTable() {
        const tbody = document.querySelector('.leaderboard-table tbody');
        if (!tbody) return;
        
        // Clear existing rows
        tbody.innerHTML = '';
        
        // Exclude top 3 players from the table
        const playersToShow = allPlayers.slice(3);
        
        // Calculate start and end index for current page
        const startIndex = (currentPage - 1) * recordsPerPage;
        const endIndex = Math.min(startIndex + recordsPerPage, playersToShow.length);
        
        // Add rows for current page (starting from rank 4)
        for (let i = startIndex; i < endIndex; i++) {
            const player = playersToShow[i];
            const rank = i + 4; // Start rank from 4
            
            const row = document.createElement('tr');
            // Use the processed avatar URL directly and add timestamp to prevent caching
            let avatarSrc = player.avatar + (player.avatar.includes('?') ? '&' : '?') + 't=' + Date.now();
            const defaultAvatar = 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_medium.jpg';
                
            row.innerHTML = `
                <td>${rank}</td>
                <td>
                    <div class="player-info">
                        <img src="${avatarSrc}" 
                             alt="${player.username}" 
                             class="table-avatar"
                             onerror="this.onerror=null; this.src='${defaultAvatar}'">
                        <span class="player-name">${player.username}</span>
                    </div>
                </td>
                <td><img src="assets/images/big-coin.svg" alt="coin" class="coin-icon">${formatWager(player.wager)}</td>
                <td>${rank > 4 ? '-' : `<img src="assets/images/big-coin.svg" alt="coin" class="coin-icon">${getPrizeForRank(rank)}`}</td>
            `;
            
            tbody.appendChild(row);
        }
        
        // Update pagination with the correct total count
        updatePagination(playersToShow.length);
    }
    
    // Update pagination controls
    function updatePagination() {
        const totalPages = Math.ceil(allPlayers.length / recordsPerPage);
        const paginationContainer = document.querySelector('.pagination');
        
        if (!paginationContainer) return;
        
        // Ensure current page is within valid range
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        }
        
        // Clear existing pagination buttons
        paginationContainer.innerHTML = '';
        
        // Add previous button
        const prevButton = document.createElement('button');
        prevButton.className = 'page-btn prev-btn' + (currentPage === 1 ? ' disabled' : '');
        prevButton.innerHTML = '&lt;';
        prevButton.setAttribute('aria-label', 'Previous page');
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                updateLeaderboardTable();
            }
        });
        paginationContainer.appendChild(prevButton);
        
        // Add page info
        const pageInfo = document.createElement('span');
        pageInfo.className = 'page-info';
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        paginationContainer.appendChild(pageInfo);
        
        // Add next button
        
        // Add next button
        const nextButton = document.createElement('button');
        nextButton.className = 'page-btn next-btn' + (currentPage === totalPages ? ' disabled' : '');
        nextButton.innerHTML = '&gt;';
        nextButton.setAttribute('aria-label', 'Next page');
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                updateLeaderboardTable();
            }
        });
        paginationContainer.appendChild(nextButton);
    }
    
    // Initialize the page
    function init() {
        // Start the countdown
        const countdown = setInterval(function() {
            // Get current date and time
            const now = new Date().getTime();
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
        
        // Fetch and display leaderboard data
        fetchLeaderboardData();
    }
    
    // Initialize the page when DOM is loaded
    init();
});