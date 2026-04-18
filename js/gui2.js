// gui2.js - usêrnam LanAnhT02 name: Lan Anh -- gui quản lý -- chưa bắt điều kiện nếu chưa đăng nhập mà trực tiếp vào gui2, nên bắt điều kiện đó nhưng lười quá
document.addEventListener('DOMContentLoaded', function () {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        document.getElementById('userInfo').textContent =
            `Xin chào cô ${currentUser.fullname} (${currentUser.username}) - Quản trị viên`;
    }

    const startGameBtn = document.getElementById('startGameBtn');
    const endGameBtn = document.getElementById('endGameBtn');
    const togglePlayersBtn = document.getElementById('togglePlayersBtn');
    const gameStatus = document.getElementById('gameStatus');
    const playersPanel = document.getElementById('playersPanel');
    const resultsPanel = document.getElementById('resultsPanel');
    const gameInterfacePanel = document.getElementById('gameInterfacePanel');
    const fullscreenToggleBtn = document.getElementById('fullscreenToggleBtn');
    const resultsContainer = document.getElementById('resultsContainer');
    const showResultsBtn = document.getElementById('showResultsBtn');
    const showAnswerBtn = document.getElementById('showAnswerBtn');

    let playersPanelVisible = true;
    let isAnyResultFullscreen = false;
    let resultsUpdateInterval;

    if (fullscreenToggleBtn && resultsContainer) {
        fullscreenToggleBtn.addEventListener('click', function () {
            toggleResultsFullscreen(resultsContainer);
        });
    }

    startGameBtn.addEventListener('click', startGame);
    endGameBtn.addEventListener('click', endGame);
    togglePlayersBtn.addEventListener('click', togglePlayersPanel);
    
    if (showResultsBtn) {
        showResultsBtn.addEventListener('click', showResultsPanel);
    }
    if (showAnswerBtn) {
        showAnswerBtn.addEventListener('click', showAnswerPanel); 
    }

    checkGameStatus();
    const statusUpdateInterval = setInterval(checkGameStatus, 3000);
    startResultsUpdateInterval();

    function startResultsUpdateInterval() {
        if (resultsUpdateInterval) {
            clearInterval(resultsUpdateInterval);
        }
        resultsUpdateInterval = setInterval(loadResults, 2000);
    }

    function stopResultsUpdateInterval() {
        if (resultsUpdateInterval) {
            clearInterval(resultsUpdateInterval);
            resultsUpdateInterval = null;
        }
    }

    function startGame() {
        const backendUrl = getBackendUrl();
        const startUrl = `${backendUrl}/api/game/start`;

        startGameBtn.disabled = true;
        endGameBtn.disabled = true;

        fetch(startUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user: currentUser })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message || 'Lỗi không xác định'); });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                showNotification('🎮 Game đã bắt đầu!', 'success');
                checkGameStatus();
                switchPanelWithTransition(resultsPanel, gameInterfacePanel);
                
                if (showResultsBtn) {
                    showResultsBtn.classList.remove('hidden');
                }

                if (showAnswerBtn) {
                    showAnswerBtn.classList.remove('hidden');
                }
                
            } else {
                showNotification(`❌ ${data.message}`, 'error');
            }
        })
        .catch(error => {
            console.error('Lỗi khi bắt đầu game:', error);
            showNotification(`⚠️ ${error.message || 'Không thể kết nối server!'}`, 'error');
        })
        .finally(() => {
            startGameBtn.disabled = false;
        });
    }

    function endGame() {
        if (!confirm('Cô có chắc chắn muốn kết thúc game?')) {
            return;
        }

        const backendUrl = getBackendUrl();
        const endUrl = `${backendUrl}/api/game/end`;

        startGameBtn.disabled = true;
        endGameBtn.disabled = true;

        fetch(endUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user: currentUser })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message || 'Lỗi không xác định'); });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                showNotification('🏁 Game đã kết thúc!', 'success');
                checkGameStatus();
                switchPanelWithTransition(gameInterfacePanel, resultsPanel);
                if (showResultsBtn) {
                    showResultsBtn.classList.add('hidden');
                }
                
                if (showAnswerBtn) {
                    showAnswerBtn.classList.add('hidden');
                }



            } else {
                showNotification(`❌ ${data.message}`, 'error');
            }
        })
        .catch(error => {
            console.error('Lỗi khi kết thúc game:', error);
            showNotification(`⚠️ ${error.message || 'Không thể kết nối server!'}`, 'error');
        })
        .finally(() => {
            endGameBtn.disabled = false;
        });
    }

    function togglePlayersPanel() {
        const isGameInterfaceVisible = !gameInterfacePanel.classList.contains('hidden');
        const isResultsPanelVisible = !resultsPanel.classList.contains('hidden');
        const targetPanel = isGameInterfaceVisible ? gameInterfacePanel : (isResultsPanelVisible ? resultsPanel : null);

        if (playersPanelVisible) {
            playersPanel.classList.add('hidden-panel');
            if (targetPanel) {
                targetPanel.classList.add('w-full');
            }
            togglePlayersBtn.innerHTML = '👥 Hiện Người chơi';
        } else {
            playersPanel.classList.remove('hidden-panel');
            if (targetPanel) {
                targetPanel.classList.remove('w-full');
            }
            togglePlayersBtn.innerHTML = '👥 Ẩn Người chơi';
        }
        playersPanelVisible = !playersPanelVisible;
    }

    function showResultsPanel(event) {
        const button = event ? event.currentTarget : showResultsBtn;
        if (button) {
            const originalTransition = button.style.transition;
            button.style.transition = 'transform 0.2s ease';
            button.style.transform = 'scale(0.95)';

            setTimeout(() => {
                button.style.transition = originalTransition;
                button.style.transform = '';
                switchPanelWithTransition(gameInterfacePanel, resultsPanel);
            }, 150);
        } else {
            switchPanelWithTransition(gameInterfacePanel, resultsPanel);
        }
    }

    function showAnswerPanel() {
        // Dữ liệu đáp án mẫu
        const answerData = {
            french: [
                { id: 'item1', text: 'Quy luật thị trường' },
                { id: 'item2', text: 'Hướng tới dân giàu, nước mạnh, dân chủ, công bằng, văn minh' },
                { id: 'item4', text: 'Đảng Cộng sản Việt Nam lãnh đạo' },
                { id: 'item7', text: 'Nhà nước pháp quyền XHCN quản lý' },
            ],
            vietnam: [
                { id: 'item3', text: 'Phù hợp xu thế thế giới' },
                { id: 'item5', text: 'Phù hợp điều kiện thực tiễn Việt Nam' },
                { id: 'item6', text: 'Ưu việt của KTTT' },
                { id: 'item8', text: 'Mong muốn nguyện vọng của nhân dân đạt được giá trị của CNXH' },
            ],
            unassigned: [
            ]
        };

        
        const answerResultElement = document.createElement('div');
        answerResultElement.className = 'result-item p-2 rounded-lg bg-gray-700 border border-gray-600 relative is-fullscreen';
        answerResultElement.style.position = 'fixed';
        answerResultElement.style.top = '0';
        answerResultElement.style.left = '0';
        answerResultElement.style.width = '100vw';
        answerResultElement.style.height = '100vh';
        answerResultElement.style.zIndex = '10001';
        answerResultElement.style.backgroundColor = '#1f2937';
        answerResultElement.style.padding = '1.5rem';
        answerResultElement.style.display = 'flex';
        answerResultElement.style.flexDirection = 'column';
        answerResultElement.style.border = 'none';
        answerResultElement.style.borderRadius = '0';

        
        const answerContentHtml = `
            <div class="result-user-fullscreen">ĐÁP ÁN</div>
            <div class="flex justify-between text-center text-lg font-semibold mb-2 mt-2">
                <div class="w-2/5 text-red-500">Khái niệm</div>
                <div class="w-2/5 text-green-500">Tính tất yếu khách quan</div>
                <div class="w-1/5 text-gray-500">   </div>
            </div>
            <div class="result-content">
                ${createVisualizationHtml(answerData, true)} <!-- Gọi hàm tạo HTML với isFullscreen = true -->
            </div>
        `;

        answerResultElement.innerHTML = answerContentHtml;

        // Nút back
        const backButton = document.createElement('button');
        backButton.className = 'fullscreen-back-btn';
        backButton.textContent = '⬅️ Quay lại';
        backButton.title = 'Quay lại giao diện chính';
        answerResultElement.appendChild(backButton);

        // append vào body
        document.body.appendChild(answerResultElement);

        // event cho nút bac
        backButton.addEventListener('click', function (event) {
            event.stopPropagation();
            if (answerResultElement.parentNode) {
                answerResultElement.parentNode.removeChild(answerResultElement);
            }
        });

        // Ngăn cập nhật kết quả khi đang xem đáp án -- Đôi khi không cần thiết , tùy theo hướng muốn bắt sự kieện
        isAnyResultFullscreen = true;
        stopResultsUpdateInterval();
    }


    function checkGameStatus() {
        const backendUrl = getBackendUrl();
        const statusUrl = `${backendUrl}/api/game/status`;

        fetch(statusUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    const session = data.session;
                    const statusElement = document.getElementById('gameStatus');

                    if (session.isActive) {
                        statusElement.innerHTML = `
                            <div class="text-green-400 font-medium flex justify-center items-center">
                                <span class="mr-2">🎮</span> Game đang hoạt động
                            </div>
                            <div class="text-gray-300 text-sm mt-1 text-center">Bắt đầu: ${new Date(session.startTime).toLocaleString('vi-VN')}</div>
                        `;
                        startGameBtn.disabled = true;
                        endGameBtn.disabled = false;
                        if (showResultsBtn) {
                            showResultsBtn.classList.remove('hidden');
                        }

                        if (showAnswerBtn) {
                            showAnswerBtn.classList.remove('hidden');
                        }



                    } else {
                        statusElement.innerHTML = `
                            <div class="text-yellow-400 font-medium flex justify-center items-center">
                                <span class="mr-2">⏸️</span> Game chưa bắt đầu
                            </div>
                            <div class="text-gray-300 text-sm mt-1 text-center">Hãy nhấn "Bắt đầu Game" để bắt đầu</div>
                        `;
                        startGameBtn.disabled = false;
                        endGameBtn.disabled = true;
                        if (!gameInterfacePanel.classList.contains('hidden')) {
                            gameInterfacePanel.classList.add('hidden');
                            resultsPanel.classList.remove('hidden');
                        }
                        if (showResultsBtn) {
                            showResultsBtn.classList.add('hidden');
                        }

                        if (showAnswerBtn) {
                            showAnswerBtn.classList.add('hidden');
                        }


                    }
                }
            })
            .catch(error => {
                console.error('Lỗi khi kiểm tra trạng thái game:', error);
                document.getElementById('gameStatus').innerHTML =
                    '<div class="text-red-400 flex justify-center items-center"><span class="mr-2">⚠️</span> Không thể kết nối server!</div>';
                startGameBtn.disabled = true;
                endGameBtn.disabled = true;
            });
    }

    function loadResults() {
        if (isAnyResultFullscreen) {
            console.log("Có kết quả đang fullscreen, tạm dừng cập nhật."); // đang fullscreen cập nhật dẽ sảy ra lỗi logic nên là arlert cá i này
            return;
        }

        const backendUrl = getBackendUrl();
        const resultsUrl = `${backendUrl}/api/results`;
        const playersUrl = `${backendUrl}/api/players/connected`;

        fetch(resultsUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    displayResults(data.results);
                }
            })
            .catch(error => {
                console.error('Lỗi khi load kết quả:', error);
            });

        fetch(playersUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    updateConnectedPlayersDisplay(data.players);
                }
            })
            .catch(error => {
                console.error('Lỗi khi load danh sách người chơi:', error);
            });
    }

    function updateConnectedPlayersDisplay(players) {
        const playersList = document.getElementById('playersList');
        const noPlayersMessage = document.getElementById('noPlayersMessage');
        const connectedCount = document.getElementById('connectedCount');

        connectedCount.textContent = players.length;

        if (players.length > 0) {
            noPlayersMessage.classList.add('hidden');
            playersList.classList.remove('hidden');

            players.sort((a, b) => a.fullname.localeCompare(b.fullname));

            playersList.innerHTML = '';
            players.forEach(player => {
                const playerElement = document.createElement('div');
                playerElement.className = 'p-2 bg-gray-700 rounded-lg border border-gray-600';
                playerElement.innerHTML = `
                    <div class="font-medium text-sm truncate">${player.fullname}</div>
                    <div class="text-xs text-gray-400 truncate">(${player.username})</div>
                `;
                playersList.appendChild(playerElement);
            });
        } else {
            noPlayersMessage.classList.remove('hidden');
            playersList.classList.add('hidden');
        }
    }

    function displayResults(results) {
        if (isAnyResultFullscreen) {
             console.log("Bỏ qua displayResults do có kết quả đang fullscreen.");
            return;
        }

        const noResultsMessage = document.getElementById('noResultsMessage');
        const resultsContent = document.getElementById('resultsContent');
        const playerCount = document.getElementById('playerCount');
        const resultsGrid = document.getElementById('resultsGrid');

        playerCount.textContent = results.length;

        if (results.length > 0) {
            noResultsMessage.classList.add('hidden');
            resultsContent.classList.remove('hidden');

            results.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

            const displayResults = results.slice(0, 20);

            resultsGrid.innerHTML = '';

            displayResults.forEach((result, index) => {
                const resultElement = document.createElement('div');
                resultElement.className = 'result-item p-2 rounded-lg bg-gray-700 border border-gray-600 relative clickable-result cursor-pointer';

                
                // Trong chế độ lưới nhỏ, tên vẫn hiển thị nhỏ và căn trái,
                const headerHtml = `
                    <div class="flex justify-between items-start mb-1 flex-shrink-0">
                        <span class="font-medium text-white text-xs truncate">${result.user.fullname}</span>
                        <span class="text-xs text-gray-400 whitespace-nowrap">${new Date(result.submittedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <!-- Phần hiển thị tên người dùng khi fullscreen sẽ được thêm bằng JS -->
                `;

                // --- Gọi với isFullscreen = false để hiển thị số ---
                const visualizationHtml = createVisualizationHtml(result.items, false);

                resultElement.innerHTML = `
                    ${headerHtml}
                    <div class="result-content">
                        ${visualizationHtml}
                    </div>
                `;

                // --- Lưu dữ liệu vào phần tử DOM để dùng khi fullscreen ---
                resultElement._resultData = result;

                resultsGrid.appendChild(resultElement);

                // --- Gắn sự kiện click để phóng to toàn màn hình với hiệu ứng  ---
                resultElement.addEventListener('click', function (event) {
                    // Ngăn chặn nếu click vào nút "Quay lại" (nếu có)
                    if (event.target.classList.contains('fullscreen-back-btn')) {
                        return;
                    }

                    // ---  Hiệu ứng thu nhỏ ---
                    const originalTransition = this.style.transition;
                    this.style.transition = 'transform 0.1s ease';
                    this.style.transform = 'scale(0.92)';

                    // Lưu ID của timeout để có thể hủy nếu cần
                    this._zoomTimeoutId = setTimeout(() => {
                        // Reset lại style transform trước khi phóng to
                        this.style.transition = originalTransition;
                        this.style.transform = '';
                        // Gọi hàm phóng to toàn màn hình
                        toggleResultFullscreen(this);
                        // Xóa ID timeout sau khi sử dụng
                        this._zoomTimeoutId = null;
                    }, 200); // Chờ 200ms làm màu
                });
            });

            const emptySlots = 20 - displayResults.length;
            for (let i = 0; i < emptySlots; i++) {
                const emptySlot = document.createElement('div');
                emptySlot.className = 'result-item p-2 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center relative';
                emptySlot.innerHTML = `
                    <span class="text-gray-600 text-xs">Trống</span>
                `;
                resultsGrid.appendChild(emptySlot);
            }

        } else {
            noResultsMessage.classList.remove('hidden');
            resultsContent.classList.add('hidden');
        }
    }

    // --- Hàm createVisualizationHtml  ---
    function createVisualizationHtml(itemsData, isFullscreen = false) {
        const frenchItems = itemsData.french || [];
        const vietnamItems = itemsData.vietnam || [];
        const unassignedItems = itemsData.unassigned || [];

        function createItemsHtml(items, sectionClass) {
            if (!items.length) return '';
            return items.map(item => {
                const itemId = item.id || item;
                const itemText = item.text || item;
                
                // --- Tạo nhãn  ---
                let displayLabel;
                if (isFullscreen) {
                    // Nếu đang ở chế độ fullscreen, hiển thị nội dung đầy đủ
                    displayLabel = itemText;
                } else {
                    // Nếu đang ở chế độ lưới nhỏ, hiển thị số (shortLabel)
                    const shortLabel = itemId.replace('item', '');
                    displayLabel = shortLabel;
                }

                const colors = {
                    'item1': 'bg-blue-500', 'item2': 'bg-green-500', 'item3': 'bg-red-500',
                    'item4': 'bg-yellow-500', 'item5': 'bg-purple-500', 'item6': 'bg-pink-500',
                    'item7': 'bg-indigo-500', 'item8': 'bg-teal-500', 'item9': 'bg-orange-500',
                    'item10': 'bg-cyan-500', 'item11': 'bg-lime-500', 'item12': 'bg-rose-500', 'item13': 'bg-amber-500'
                };
                const colorClass = colors[itemId] || 'bg-gray-500';

                if (isFullscreen) {
                    // --- Style cho chế độ fullscreen ---
                    return `<span class="viz-item ${colorClass}" title="${itemText}">${displayLabel}</span>`;
                } else {
                    // --- Style cho chế độ lưới nhỏ  ---
                    return `<span class="viz-item ${colorClass}" title="${itemText}">${displayLabel}</span>`;
                }
            }).join('');
        }

        const frenchItemsHtml = createItemsHtml(frenchItems, 'french');
        const vietnamItemsHtml = createItemsHtml(vietnamItems, 'vietnam');
        const unassignedItemsHtml = createItemsHtml(unassignedItems, 'unassigned');

        return `
            <div class="visualization-container">
                <div class="viz-section french">
                    ${frenchItemsHtml}
                </div>
                <div class="viz-section vietnam">
                    ${vietnamItemsHtml}
                </div>
                <div class="viz-section unassigned">
                    ${unassignedItemsHtml}
                </div>
            </div>
        `;
    }
    // --- Hết hàm createVisualizationHtml ---

    // --- Hàm toggleResultFullscreen  ---
    function toggleResultFullscreen(resultElement) {
        const isFullscreen = resultElement.classList.contains('is-fullscreen');

        if (isFullscreen) {
            // --- Đóng chế độ fullscreen ---
            // 1. Hủy bất kỳ timeout phóng to nào còn sót lại trên phần tử này -- quan trọng chú ý nếu sủa
            if (resultElement._zoomTimeoutId) {
                clearTimeout(resultElement._zoomTimeoutId);
                resultElement._zoomTimeoutId = null;
            }

            resultElement.classList.remove('is-fullscreen');
            const backButton = resultElement.querySelector('.fullscreen-back-btn');
            if (backButton) {
                backButton.remove();
            }
            // Xóa phần tên người dùng fullscreen nếu có
            const fullscreenUserElement = resultElement.querySelector('.result-user-fullscreen');
            if (fullscreenUserElement) {
                fullscreenUserElement.remove();
            }
            // Xóa phần tiêu đề nếu có
            const headerTitlesContainer = resultElement.querySelector('.flex.justify-between.text-center.text-lg.font-semibold');
            if (headerTitlesContainer) {
                headerTitlesContainer.remove();
            }
            
            isAnyResultFullscreen = false;
            startResultsUpdateInterval();

        } else {
            // --- Mở chế độ fullscreen ---
            isAnyResultFullscreen = true;
            stopResultsUpdateInterval();

            resultElement.classList.add('is-fullscreen');
            
            // --- Thêm tên người dùng lớn và căn giữa ---
            if (resultElement._resultData) {
                const userFullName = resultElement._resultData.user.fullname;
                const timeSubmitted = new Date(resultElement._resultData.submittedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                
                const userHeaderFullscreen = document.createElement('div');
                userHeaderFullscreen.className = 'result-user-fullscreen';
                userHeaderFullscreen.textContent = `${userFullName} (${timeSubmitted})`;
                // Chèn vào đầu phần tử result-content
                const resultContent = resultElement.querySelector('.result-content');
                resultContent.parentNode.insertBefore(userHeaderFullscreen, resultContent);
            }

            // --- Thêm tiêu đề cho các phần trong chế độ fullscreen ---
            const headerTitlesContainer = document.createElement('div');
            headerTitlesContainer.className = 'flex justify-between text-center text-lg font-semibold mb-2 mt-2'; // mb-2 để tạo khoảng cách dưới
            headerTitlesContainer.innerHTML = `
                <div class="w-2/5 text-red-500">Khái niệm</div>
                <div class="w-2/5 text-green-500">Tính tất yếu khách quan</div>
                <div class="w-1/5 text-gray-500 "> </div>
            `;
            // Chèn tiêu đề ngay sau tên người dùng
            const userHeaderFullscreen = resultElement.querySelector('.result-user-fullscreen');
            if (userHeaderFullscreen) {
                userHeaderFullscreen.parentNode.insertBefore(headerTitlesContainer, userHeaderFullscreen.nextSibling);
            } else {
                // Nếu không có tên người dùng, chèn vào đầu result-content
                const resultContent = resultElement.querySelector('.result-content');
                resultContent.parentNode.insertBefore(headerTitlesContainer, resultContent);
            }
            // --- Hết thêm tiêu đề ---

            // --- Cập nhật lại phần hiển thị trực quan với nội dung đầy đủ ---
            if (resultElement._resultData) {
                const fullscreenVisualizationHtml = createVisualizationHtml(resultElement._resultData.items, true);
                const vizContainer = resultElement.querySelector('.result-content .visualization-container');
                if (vizContainer) {
                    vizContainer.outerHTML = fullscreenVisualizationHtml;
                }
            }

            const backButton = document.createElement('button');
            backButton.className = 'fullscreen-back-btn';
            backButton.textContent = '⬅️ Quay lại danh sách kết quả';
            backButton.title = 'Quay lại danh sách kết quả';
            
            resultElement.appendChild(backButton);

            backButton.addEventListener('click', function (event) {
                event.stopPropagation(); // Ngăn sự kiện click lan ra phần tử cha --- sửa mãi mới biết lỗi ở thiếu cái này
                toggleResultFullscreen(resultElement); // Gọi lại hàm để close
            });
        }
    }
    // --- Hết hàm toggleResultFullscreen ---


    function toggleResultsFullscreen(containerElement) {
        const body = document.body;

        if (screenfull.isEnabled) {
            if (screenfull.isFullscreen && screenfull.element === containerElement) {
                screenfull.exit();
            } else {
                screenfull.request(containerElement);
            }
        } else {
            if (containerElement.classList.contains('is-fullscreen')) {
                containerElement.classList.remove('is-fullscreen');
                body.classList.remove('results-fullscreen-active');
            } else {
                body.classList.add('results-fullscreen-active');
                containerElement.classList.add('is-fullscreen');
            }
        }
    }

    function switchPanelWithTransition(panelToHide, panelToShow) {
        if (!panelToHide || !panelToShow) return;

        panelToShow.classList.add('panel-transition');

        panelToHide.classList.add('panel-exiting');

        setTimeout(() => {
            panelToHide.classList.add('hidden');
            panelToHide.classList.remove('panel-exiting');

            panelToShow.classList.remove('hidden');
            panelToShow.classList.add('panel-entering');

            void panelToShow.offsetWidth;

            requestAnimationFrame(() => {
                panelToShow.classList.remove('panel-entering');
                panelToShow.classList.add('panel-entered');
            });
        }, 300);

        setTimeout(() => {
            panelToShow.classList.remove('panel-entered', 'panel-transition');
        }, 600);
    }

    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-md ${
            type === 'success' ? 'bg-green-600' :
            type === 'error' ? 'bg-red-600' : 'bg-blue-600'
        } text-white`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    function getBackendUrl() {
        if (window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname === '0.0.0.0') {
            return 'http://localhost:3000';
        } else {
            return 'https://backend-3-229k.onrender.com';
        }
    }

    loadResults();

    window.addEventListener('beforeunload', function () {
        clearInterval(statusUpdateInterval);
        stopResultsUpdateInterval();
    });
});