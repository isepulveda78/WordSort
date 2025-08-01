<?php
/**
 * Plugin Name: Wordsorter for Ser vs Estar
 * Description: A custom Gutenberg block for organizing words into two lists with database storage
 * Version: 1.0.0
 * Author: Israel Sepulveda
 * Text Domain: word-list-organizer
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class WordListOrganizerBlock {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_assets'));
        add_action('enqueue_block_editor_assets', array($this, 'enqueue_block_assets'));
        add_action('wp_ajax_save_word_lists', array($this, 'save_word_lists'));
        add_action('wp_ajax_nopriv_save_word_lists', array($this, 'save_word_lists'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        register_activation_hook(__FILE__, array($this, 'create_tables'));
    }
    
    public function init() {
        // Register the block
        register_block_type('word-list-organizer/word-list-block', array(
            'editor_script' => 'word-list-organizer-block-editor',
            'editor_style' => 'word-list-organizer-block-editor-style',
            'style' => 'word-list-organizer-block-style',
            'render_callback' => array($this, 'render_block'),
        ));
    }
    
    public function enqueue_block_assets() {
        wp_enqueue_script(
            'word-list-organizer-block-editor',
            plugin_dir_url(__FILE__) . 'block.js',
            array('wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-i18n'),
            filemtime(plugin_dir_path(__FILE__) . 'block.js')
        );
        
        wp_enqueue_style(
            'word-list-organizer-block-editor-style',
            plugin_dir_url(__FILE__) . 'editor-style.css',
            array(),
            filemtime(plugin_dir_path(__FILE__) . 'editor-style.css')
        );
    }
    
    public function enqueue_frontend_assets() {
        wp_enqueue_script(
            'word-list-organizer-frontend',
            plugin_dir_url(__FILE__) . 'frontend.js',
            array(),
            filemtime(plugin_dir_path(__FILE__) . 'frontend.js'),
            true
        );
        
        wp_enqueue_style(
            'word-list-organizer-block-style',
            plugin_dir_url(__FILE__) . 'style.css',
            array(),
            filemtime(plugin_dir_path(__FILE__) . 'style.css')
        );
        
        // Add Bootstrap CSS
        wp_enqueue_style(
            'bootstrap-css',
            'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
            array(),
            '5.3.0'
        );
        
        // Add jsPDF
        wp_enqueue_script(
            'jspdf',
            'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
            array(),
            '2.5.1',
            true
        );
        
        // Localize script for AJAX
        wp_localize_script('word-list-organizer-frontend', 'wpAjax', array(
            'ajaxurl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('word_list_nonce')
        ));
    }
    
    public function render_block($attributes, $content) {
        $block_id = uniqid('word-list-');
        
        ob_start();
        ?>
        <div id="<?php echo esc_attr($block_id); ?>" class="word-list-organizer-block">
            <div class="container-fluid">
                <!-- Header -->
                <div class="row">
                    <div class="col-12">
                        <header class="card text-white text-center py-4 mb-0">
                            <div class="container">
                                <h1 class="display-4 fw-bold mb-3">Ser vs Estar</h1>
                                <p class="lead mb-0 text-dark">Type words, drag them to organize into two lists, then export to PDF</p>
                            </div>
                        </header>
                    </div>
                </div>

                <!-- Input Section -->
                <div class="row">
                    <div class="col-12">
                        <div class="bg-light py-4">
                            <div class="container">
                                <div class="row justify-content-center">
                                    <div class="col-lg-8">
                                        <!-- Username Input -->
                                        <div class="mb-4">
                                            <label for="usernameInput" class="form-label fw-semibold">Your Name <span class="text-danger">*</span></label>
                                            <input type="text" class="form-control form-control-lg" id="usernameInput" 
                                                   placeholder="Enter your name..." maxlength="30" required>
                                            <div class="form-text fst-italic">Required for PDF export - your name will appear on the document</div>
                                        </div>
                                        
                                        <!-- Word Input -->
                                        <div class="mb-3">
                                            <label for="wordInput" class="form-label fw-semibold">Add Words</label>
                                            <div class="input-group input-group-lg">
                                                <input type="text" class="form-control" id="wordInput" 
                                                       placeholder="Type a word and press Enter..." maxlength="50">
                                                <select class="form-select" id="listSelector" style="max-width: 150px;">
                                                    <option value="list1">Ser</option>
                                                    <option value="list2">Estar</option>
                                                </select>
                                            </div>
                                            <div class="form-text">Press Enter to add word to the selected list</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Lists Container -->
                <div class="row">
                    <div class="col-12">
                        <div class="container my-4">
                            <div class="row g-4">
                                <!-- List 1 -->
                                <div class="col-lg-6">
                                    <div class="card h-100">
                                        <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
                                            <h5 class="card-title mb-0">Ser</h5>
                                            <span class="badge bg-light text-dark" id="list1Count">0 words</span>
                                        </div>
                                        <div class="card-body">
                                            <div class="word-list drop-zone" id="list1" data-list="list1">
                                                <div class="empty-state text-muted text-center p-4">
                                                    Add words using the input above
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- List 2 -->
                                <div class="col-lg-6">
                                    <div class="card h-100">
                                        <div class="card-header bg-info text-white d-flex justify-content-between align-items-center">
                                            <h5 class="card-title mb-0">Estar</h5>
                                            <span class="badge bg-light text-dark" id="list2Count">0 words</span>
                                        </div>
                                        <div class="card-body">
                                            <div class="word-list drop-zone" id="list2" data-list="list2">
                                                <div class="empty-state text-muted text-center p-4">
                                                    Add words using the input above
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Export Section -->
                <div class="row">
                    <div class="col-12">
                        <div class="bg-light py-4">
                            <div class="container text-center">
                                <button id="saveBtn" class="btn btn-primary btn-lg me-2">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-2">
                                        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"></path>
                                        <polyline points="17,21 17,13 7,13 7,21"></polyline>
                                        <polyline points="7,3 7,8 15,8"></polyline>
                                    </svg>
                                    Save Lists
                                </button>
                                <button id="exportBtn" class="btn btn-success btn-lg" disabled>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="me-2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14,2 14,8 20,8"></polyline>
                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                        <polyline points="10,9 9,9 8,9"></polyline>
                                    </svg>
                                    Export Lists to PDF or Save for Review
                                </button>
                                <div class="text-muted mt-2 export-hint">Enter your name and add words to both lists to enable PDF export</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Instructions -->
                <div class="row">
                    <div class="col-12">
                        <div class="container my-4">
                            <div class="row justify-content-center">
                                <div class="col-lg-8">
                                    <div class="card">
                                        <div class="card-header bg-primary text-white">
                                            <h5 class="card-title mb-0">How to use:</h5>
                                        </div>
                                        <div class="card-body">
                                            <ol class="mb-0">
                                                <li class="mb-2">Enter your name in the username field (required for PDF export)</li>
                                                <li class="mb-2">Type a word and select which list to add it to, then press Enter</li>
                                                <li class="mb-2">You can drag words between Ser and Estar to reorganize them</li>
                                                <li class="mb-2">Click "Save Lists" to save your work to the database</li>
                                                <li class="mb-0">Click "Export Lists to PDF" when you have your name and words in both lists</li>
                                            </ol>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }
    
    public function create_tables() {
        global $wpdb;
        
        $table_name = $wpdb->prefix . 'word_lists';
        
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            username varchar(100) NOT NULL,
            list1_words text NOT NULL,
            list2_words text NOT NULL,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    public function save_word_lists() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'word_list_nonce')) {
            wp_send_json_error('Security check failed');
            return;
        }
        
        global $wpdb;
        $table_name = $wpdb->prefix . 'word_lists';
        
        $username = sanitize_text_field($_POST['username']);
        
        // Handle array data properly - FormData sends arrays as indexed entries
        $list1_words = isset($_POST['list1_words']) ? $_POST['list1_words'] : array();
        $list2_words = isset($_POST['list2_words']) ? $_POST['list2_words'] : array();
        
        // Ensure they are arrays
        if (!is_array($list1_words)) {
            $list1_words = !empty($list1_words) ? array($list1_words) : array();
        }
        if (!is_array($list2_words)) {
            $list2_words = !empty($list2_words) ? array($list2_words) : array();
        }
        
        // Sanitize each word
        $list1_words = array_map('sanitize_text_field', $list1_words);
        $list2_words = array_map('sanitize_text_field', $list2_words);
        
        // Remove empty values
        $list1_words = array_filter($list1_words, function($word) { return !empty(trim($word)); });
        $list2_words = array_filter($list2_words, function($word) { return !empty(trim($word)); });
        
        // Debug logging
        error_log('Save word list attempt: Username=' . $username . ', List1=' . print_r($list1_words, true) . ', List2=' . print_r($list2_words, true));
        
        if (empty($username)) {
            wp_send_json_error('Username is required');
            return;
        }
        
        $result = $wpdb->insert(
            $table_name,
            array(
                'username' => $username,
                'list1_words' => json_encode(array_values($list1_words)),
                'list2_words' => json_encode(array_values($list2_words))
            ),
            array('%s', '%s', '%s')
        );
        
        if ($result === false) {
            error_log('Database insert failed: ' . $wpdb->last_error);
            wp_send_json_error('Failed to save word list: ' . $wpdb->last_error);
        } else {
            error_log('Word list saved successfully with ID: ' . $wpdb->insert_id);
            wp_send_json_success(array('id' => $wpdb->insert_id, 'message' => 'Word lists saved successfully!'));
        }
    }
    
    public function add_admin_menu() {
        add_menu_page(
            'Word List Organizer',
            'Word Lists',
            'manage_options',
            'word-list-organizer',
            array($this, 'admin_page'),
            'dashicons-list-view',
            30
        );
    }
    
    public function admin_page() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'word_lists';
        
        // Handle delete action
        if (isset($_GET['action']) && $_GET['action'] === 'delete' && isset($_GET['id'])) {
            $id = intval($_GET['id']);
            $wpdb->delete($table_name, array('id' => $id), array('%d'));
            echo '<div class="notice notice-success"><p>Word list deleted successfully.</p></div>';
        }
        
        $word_lists = $wpdb->get_results("SELECT * FROM $table_name ORDER BY created_at DESC");
        ?>
        <div class="wrap">
            <h1>Word List Organizer - Saved Lists</h1>
            
            <?php if (empty($word_lists)): ?>
                <p>No word lists have been saved yet.</p>
            <?php else: ?>
                <table class="wp-list-table widefat fixed striped">
                    <thead>
                        <tr>
                            <th scope="col" style="width: 60px;">ID</th>
                            <th scope="col">Username</th>
                            <th scope="col">Ser</th>
                            <th scope="col">Estar</th>
                            <th scope="col">Created</th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($word_lists as $word_list): ?>
                            <tr>
                                <td><?php echo esc_html($word_list->id); ?></td>
                                <td><strong><?php echo esc_html($word_list->username); ?></strong></td>
                                <td>
                                    <?php 
                                    $list1 = json_decode($word_list->list1_words, true);
                                    if (is_array($list1) && !empty($list1)) {
                                        echo '<div class="word-list-preview">';
                                        foreach ($list1 as $word) {
                                            echo '<span class="word-tag">' . esc_html($word) . '</span> ';
                                        }
                                        echo '</div>';
                                    } else {
                                        echo '<em>Empty</em>';
                                    }
                                    ?>
                                </td>
                                <td>
                                    <?php 
                                    $list2 = json_decode($word_list->list2_words, true);
                                    if (is_array($list2) && !empty($list2)) {
                                        echo '<div class="word-list-preview">';
                                        foreach ($list2 as $word) {
                                            echo '<span class="word-tag">' . esc_html($word) . '</span> ';
                                        }
                                        echo '</div>';
                                    } else {
                                        echo '<em>Empty</em>';
                                    }
                                    ?>
                                </td>
                                <td><?php echo esc_html(date('M j, Y g:i A', strtotime($word_list->created_at))); ?></td>
                                <td>
                                    <a href="<?php echo admin_url('admin.php?page=word-list-organizer&action=delete&id=' . $word_list->id); ?>" 
                                       class="button button-secondary" 
                                       onclick="return confirm('Are you sure you want to delete this word list?')">Delete</a>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php endif; ?>
        </div>
        
        <style>
            .word-list-preview {
                max-width: 300px;
                line-height: 1.5;
            }
            .word-tag {
                display: inline-block;
                background: #f0f0f1;
                color: #2c3338;
                padding: 2px 8px;
                margin: 2px;
                border-radius: 3px;
                font-size: 12px;
            }
        </style>
        <?php
    }
}

// Initialize the plugin
new WordListOrganizerBlock();