// WordPress Gutenberg Block Frontend - Vanilla JavaScript
document.addEventListener('DOMContentLoaded', function() {
    class WordListOrganizerWP {
        constructor() {
            this.lists = {
                list1: [],
                list2: []
            };
            
            this.init();
        }

        init() {
            this.bindEvents();
            this.updateCounts();
            this.updateExportButton();
        }

        bindEvents() {
            // Input field events
            document.addEventListener('keypress', (e) => {
                if (e.target && e.target.id === 'wordInput' && e.key === 'Enter') {
                    this.addWord();
                }
            });

            // Username input event to update export button
            document.addEventListener('input', (e) => {
                if (e.target && e.target.id === 'usernameInput') {
                    this.updateExportButton();
                }
            });

            // Export button event
            document.addEventListener('click', (e) => {
                if (e.target && e.target.id === 'exportBtn') {
                    this.exportToPDF();
                }
            });

            // Save button event
            document.addEventListener('click', (e) => {
                if (e.target && e.target.id === 'saveBtn') {
                    this.saveToDatabase();
                }
            });

            // Setup drag and drop for all lists
            this.setupDragAndDrop();
        }

        addWord() {
            const input = document.getElementById('wordInput');
            const listSelector = document.getElementById('listSelector');
            
            if (!input || !listSelector) return;
            
            const word = input.value.trim();
            const targetList = listSelector.value;

            if (!word) {
                this.showAlert('Please enter a word', 'error');
                return;
            }

            if (this.isWordDuplicate(word)) {
                this.showAlert('This word already exists in your lists', 'warning');
                input.value = '';
                return;
            }

            if (word.length > 50) {
                this.showAlert('Word is too long (max 50 characters)', 'error');
                return;
            }

            this.lists[targetList].push(word);
            this.renderList(targetList);
            this.updateCounts();
            this.updateExportButton();
            
            input.value = '';
            const listDisplayName = this.getListDisplayName(targetList);
            this.showAlert(`"${word}" added to ${listDisplayName}!`, 'success');
        }

        isWordDuplicate(word) {
            const allWords = [...this.lists.list1, ...this.lists.list2];
            return allWords.some(existingWord => 
                existingWord.toLowerCase() === word.toLowerCase()
            );
        }

        setupDragAndDrop() {
            const lists = ['list1', 'list2'];
            
            lists.forEach(listName => {
                const listElement = document.getElementById(listName);
                if (!listElement) return;
                
                listElement.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    listElement.classList.add('drag-over');
                });

                listElement.addEventListener('dragleave', (e) => {
                    if (!listElement.contains(e.relatedTarget)) {
                        listElement.classList.remove('drag-over');
                    }
                });

                listElement.addEventListener('drop', (e) => {
                    e.preventDefault();
                    listElement.classList.remove('drag-over');
                    
                    const draggedWord = e.dataTransfer.getData('text/plain');
                    const sourceList = e.dataTransfer.getData('source-list');
                    const targetList = listElement.dataset.list;

                    if (sourceList !== targetList) {
                        this.moveWord(draggedWord, sourceList, targetList);
                    }
                });
            });
        }

        makeWordDraggable(wordElement, word, listName) {
            wordElement.draggable = true;
            
            wordElement.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', word);
                e.dataTransfer.setData('source-list', listName);
                wordElement.classList.add('dragging');
            });

            wordElement.addEventListener('dragend', () => {
                wordElement.classList.remove('dragging');
            });
        }

        moveWord(word, sourceList, targetList) {
            const sourceIndex = this.lists[sourceList].indexOf(word);
            if (sourceIndex > -1) {
                this.lists[sourceList].splice(sourceIndex, 1);
            }

            this.lists[targetList].push(word);

            this.renderList(sourceList);
            this.renderList(targetList);
            this.updateCounts();
            this.updateExportButton();

            this.showAlert(`"${word}" moved to ${this.getListDisplayName(targetList)}`, 'success');
        }

        getListDisplayName(listName) {
            const names = {
                list1: 'Ser',
                list2: 'Estar'
            };
            return names[listName] || listName;
        }

        renderList(listName) {
            const listElement = document.getElementById(listName);
            if (!listElement) return;
            
            const words = this.lists[listName];

            if (words.length === 0) {
                const emptyMessages = {
                    list1: 'Add words using the input above',
                    list2: 'Add words using the input above'
                };
                
                listElement.innerHTML = `<div class="empty-state text-muted text-center p-4">${emptyMessages[listName]}</div>`;
                return;
            }

            listElement.innerHTML = '';
            
            words.forEach(word => {
                const wordElement = document.createElement('div');
                wordElement.className = 'word-item new-word';
                wordElement.innerHTML = `
                    <span class="word-text">${this.escapeHtml(word)}</span>
                    <span class="drag-handle">⋮⋮</span>
                `;
                
                this.makeWordDraggable(wordElement, word, listName);
                listElement.appendChild(wordElement);

                setTimeout(() => {
                    wordElement.classList.remove('new-word');
                }, 300);
            });
        }

        updateCounts() {
            const list1Count = document.getElementById('list1Count');
            const list2Count = document.getElementById('list2Count');
            
            if (list1Count) {
                list1Count.textContent = `${this.lists.list1.length} word${this.lists.list1.length !== 1 ? 's' : ''}`;
            }
            if (list2Count) {
                list2Count.textContent = `${this.lists.list2.length} word${this.lists.list2.length !== 1 ? 's' : ''}`;
            }
        }

        updateExportButton() {
            const exportBtn = document.getElementById('exportBtn');
            const usernameInput = document.getElementById('usernameInput');
            
            if (!exportBtn || !usernameInput) return;
            
            const username = usernameInput.value.trim();
            const hasWordsInBothLists = this.lists.list1.length > 0 && this.lists.list2.length > 0;
            const hasUsername = username.length > 0;
            
            const canExport = hasWordsInBothLists && hasUsername;
            exportBtn.disabled = !canExport;
            
            const hint = document.querySelector('.export-hint');
            if (hint) {
                if (canExport) {
                    hint.textContent = 'Ready to export! Click the button above.';
                    hint.style.color = '#059669';
                } else if (!hasUsername) {
                    hint.textContent = 'Enter your name and add words to both lists to enable PDF export';
                    hint.style.color = '#64748b';
                } else {
                    hint.textContent = 'Add words to both lists to enable PDF export';
                    hint.style.color = '#64748b';
                }
            }
        }

        async saveToDatabase() {
            const usernameInput = document.getElementById('usernameInput');
            const username = usernameInput ? usernameInput.value.trim() : '';

            if (!username) {
                this.showToaster('Please enter your name before saving', 'error');
                return;
            }

            if (this.lists.list1.length === 0 && this.lists.list2.length === 0) {
                this.showToaster('Please add some words before saving', 'warning');
                return;
            }

            // Show saving notification
            this.showAlert('Saving your word lists...', 'info');

            // Check if we're in WordPress environment
            if (typeof wpAjax !== 'undefined' && wpAjax.ajaxurl !== '/save_test') {
                // WordPress environment - use real AJAX
                const formData = new FormData();
                formData.append('action', 'save_word_lists');
                formData.append('nonce', wpAjax.nonce);
                formData.append('username', username);
                
                // Append array values properly
                this.lists.list1.forEach((word, index) => {
                    formData.append(`list1_words[${index}]`, word);
                });
                this.lists.list2.forEach((word, index) => {
                    formData.append(`list2_words[${index}]`, word);
                });

                try {
                    const response = await fetch(wpAjax.ajaxurl, {
                        method: 'POST',
                        body: formData
                    });

                    const result = await response.json();

                    if (result.success) {
                        this.showToaster(`Your word lists have been saved successfully! (ID: ${result.data.id})`, 'success');
                        this.clearAllData();
                    } else {
                        this.showToaster('Error saving to database: ' + (result.data || 'Unknown error'), 'error');
                    }
                } catch (error) {
                    console.error('Database save error:', error);
                    this.showToaster('Error connecting to database: ' + error.message, 'error');
                }
            } else {
                // Demo/test environment - simulate successful save
                setTimeout(() => {
                    this.showToaster(`Demo: Word lists would be saved for ${username}! (Test ID: 123)`, 'success');
                    this.clearAllData();
                }, 1000);
            }
        }

        clearAllData() {
            // Clear username
            const usernameInput = document.getElementById('usernameInput');
            if (usernameInput) {
                usernameInput.value = '';
            }

            // Clear word input
            const wordInput = document.getElementById('wordInput');
            if (wordInput) {
                wordInput.value = '';
            }

            // Clear both lists
            this.lists.list1 = [];
            this.lists.list2 = [];

            // Re-render both lists
            this.renderList('list1');
            this.renderList('list2');

            // Update counts and export button
            this.updateCounts();
            this.updateExportButton();
        }

        exportToPDF() {
            const usernameInput = document.getElementById('usernameInput');
            const username = usernameInput.value.trim();

            if (!username) {
                this.showAlert('Please enter your name before exporting', 'error');
                return;
            }

            if (this.lists.list1.length === 0 || this.lists.list2.length === 0) {
                this.showAlert('Please add words to both lists before exporting', 'warning');
                return;
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            doc.setFontSize(20);
            doc.text('Word Lists', 20, 30);

            doc.setFontSize(12);
            doc.text(`Created by: ${username}`, 20, 45);
            doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 55);

            doc.setFontSize(16);
            doc.text('Ser:', 20, 75);

            doc.setFontSize(12);
            let yPosition = 85;
            this.lists.list1.forEach((word, index) => {
                doc.text(`${index + 1}. ${word}`, 25, yPosition);
                yPosition += 10;
            });

            yPosition += 10;
            doc.setFontSize(16);
            doc.text('Estar:', 20, yPosition);

            yPosition += 10;
            doc.setFontSize(12);
            this.lists.list2.forEach((word, index) => {
                doc.text(`${index + 1}. ${word}`, 25, yPosition);
                yPosition += 10;
            });

            doc.save(`${username.replace(/[^a-z0-9]/gi, '_')}_word_lists.pdf`);
            this.showAlert('PDF exported successfully!', 'success');
        }

        showToaster(message, type = 'info') {
            // Remove existing toasters
            const existingToasters = document.querySelectorAll('.toaster');
            existingToasters.forEach(toaster => toaster.remove());

            const toaster = document.createElement('div');
            toaster.className = 'toaster';
            
            const colors = {
                success: 'linear-gradient(135deg, #059669, #10b981)',
                error: 'linear-gradient(135deg, #dc2626, #ef4444)',
                warning: 'linear-gradient(135deg, #d97706, #f59e0b)',
                info: 'linear-gradient(135deg, #2563eb, #3b82f6)'
            };

            Object.assign(toaster.style, {
                position: 'fixed',
                top: '20px',
                right: '20px',
                padding: '16px 20px',
                borderRadius: '12px',
                color: 'white',
                fontWeight: '500',
                fontSize: '14px',
                zIndex: '1000',
                minWidth: '300px',
                maxWidth: '400px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                background: colors[type] || colors.info,
                transform: 'translateX(120%)',
                transition: 'transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
            });

            const icons = {
                success: '✓',
                error: '✕',
                warning: '⚠',
                info: 'ℹ'
            };

            const icon = icons[type] || icons.info;
            toaster.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 18px; font-weight: bold;">${icon}</span>
                    <span>${message}</span>
                </div>
            `;

            document.body.appendChild(toaster);

            setTimeout(() => {
                toaster.style.transform = 'translateX(0)';
            }, 100);

            setTimeout(() => {
                toaster.style.transform = 'translateX(120%)';
                setTimeout(() => {
                    toaster.remove();
                }, 400);
            }, 4000);
        }

        showAlert(message, type = 'info') {
            const existingAlerts = document.querySelectorAll('.custom-alert');
            existingAlerts.forEach(alert => alert.remove());

            const alert = document.createElement('div');
            alert.className = 'custom-alert';
            
            const colors = {
                success: '#059669',
                error: '#dc2626',
                warning: '#d97706',
                info: '#2563eb'
            };

            Object.assign(alert.style, {
                position: 'fixed',
                top: '20px',
                right: '20px',
                padding: '12px 20px',
                borderRadius: '8px',
                color: 'white',
                fontWeight: '500',
                zIndex: '1000',
                maxWidth: '300px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                transform: 'translateX(100%)',
                transition: 'transform 0.3s ease',
                backgroundColor: colors[type] || colors.info
            });

            alert.textContent = message;
            document.body.appendChild(alert);

            setTimeout(() => {
                alert.style.transform = 'translateX(0)';
            }, 10);

            setTimeout(() => {
                alert.style.transform = 'translateX(100%)';
                setTimeout(() => {
                    alert.remove();
                }, 300);
            }, 3000);
        }

        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    }

    // Initialize the application when DOM is loaded
    window.wordApp = new WordListOrganizerWP();
});