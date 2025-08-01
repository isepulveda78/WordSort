# Word List Organizer - WordPress Gutenberg Block

A custom WordPress Gutenberg block that allows users to create, organize, and export word lists with drag-and-drop functionality. The block saves user data to the WordPress database and provides an admin interface for viewing all submitted word lists.

## Features

- **Interactive Gutenberg Block**: Custom block for the WordPress editor
- **Drag & Drop**: Organize words between two lists with smooth animations
- **Database Storage**: Saves word lists to WordPress database
- **Admin Dashboard**: View all saved word lists in WordPress admin
- **PDF Export**: Generate and download PDF files with word lists
- **Bootstrap Integration**: Responsive design with Bootstrap 5.3
- **Username Requirement**: Users must provide their name for saving/exporting

## Installation

### 1. Upload Plugin Files

Copy all the plugin files to your WordPress plugins directory:

```
wp-content/plugins/word-list-organizer-block/
├── word-list-organizer-block.php
├── block.js
├── frontend.js
├── style.css
├── editor-style.css
└── README.md
```

### 2. Activate the Plugin

1. Go to your WordPress admin dashboard
2. Navigate to **Plugins** > **Installed Plugins**
3. Find "Word List Organizer Block" and click **Activate**

### 3. Database Setup

The plugin automatically creates the required database table when activated. The table structure:

```sql
CREATE TABLE wp_word_lists (
    id mediumint(9) NOT NULL AUTO_INCREMENT,
    username varchar(100) NOT NULL,
    list1_words text NOT NULL,
    list2_words text NOT NULL,
    created_at datetime DEFAULT CURRENT_TIMESTAMP,
    updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
```

## Usage

### Adding the Block to a Page/Post

1. Edit a page or post in WordPress
2. Click the **+** button to add a new block
3. Search for "Word List Organizer" 
4. Add the block to your content
5. Publish or update the page

### Using the Word List Organizer

1. **Enter Username**: Required field for saving and PDF export
2. **Add Words**: Type words and select which list to add them to
3. **Drag & Drop**: Move words between List 1 and List 2
4. **Save to Database**: Click "Save Lists" to store in WordPress database
5. **Export PDF**: Generate and download a PDF file with your lists

### Admin Interface

Access the admin interface at **Word Lists** in your WordPress admin menu:

- View all saved word lists
- See usernames, lists content, and creation dates
- Delete unwanted entries
- Clean, organized table view

## Technical Details

### File Structure

- **word-list-organizer-block.php**: Main plugin file with PHP backend
- **block.js**: Gutenberg block registration and editor interface
- **frontend.js**: Frontend JavaScript functionality
- **style.css**: Frontend styling
- **editor-style.css**: Block editor styling

### Dependencies

- **WordPress 5.0+**: Required for Gutenberg blocks
- **Bootstrap 5.3**: Loaded from CDN for responsive design
- **jsPDF 2.5.1**: Loaded from CDN for PDF generation
- **jQuery**: WordPress core dependency

### Database Operations

- **Save**: AJAX endpoint saves word lists to custom table
- **View**: Admin interface queries and displays all entries
- **Delete**: Admin interface allows deletion of individual entries

### Security Features

- WordPress nonce verification for AJAX requests
- Data sanitization for all user inputs
- Capability checks for admin functions
- SQL injection protection through $wpdb methods

## Customization

### Styling

Modify `style.css` to customize the appearance:
- Change colors in the CSS variables
- Adjust spacing and layout
- Customize Bootstrap component styles

### Functionality

Extend the JavaScript in `frontend.js`:
- Add more list options
- Implement additional validation
- Add more export formats

### Admin Interface

Customize the admin page in the PHP file:
- Add search and filtering
- Export options for admin
- Additional data fields

## Browser Compatibility

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

Requires modern browser support for:
- Drag and Drop API
- ES6 JavaScript
- CSS Grid and Flexbox

## Troubleshooting

### Block Not Appearing
- Ensure plugin is activated
- Check WordPress version (5.0+ required)
- Clear any caching plugins

### Database Issues
- Verify WordPress database permissions
- Check error logs for SQL errors
- Ensure proper table creation on activation

### JavaScript Errors
- Check browser console for errors
- Verify CDN resources are loading
- Test with different browsers

## Support

For support and bug reports, please check:
- WordPress error logs
- Browser console errors
- Plugin activation/deactivation
- Database table existence

## License

This plugin is released under the GPL v2 or later license, same as WordPress core.