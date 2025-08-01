(function(blocks, element, editor, components, i18n) {
    var el = element.createElement;
    var __ = i18n.__;
    var Fragment = element.Fragment;
    var InspectorControls = editor.InspectorControls;
    var PanelBody = components.PanelBody;
    var TextControl = components.TextControl;

    blocks.registerBlockType('word-list-organizer/word-list-block', {
        title: __('Word List Organizer'),
        description: __('Interactive word list organizer with drag and drop functionality'),
        icon: 'list-view',
        category: 'widgets',
        keywords: ['words', 'list', 'organizer', 'drag', 'drop'],
        
        attributes: {
            title: {
                type: 'string',
                default: 'Word List Organizer'
            }
        },

        edit: function(props) {
            var attributes = props.attributes;
            var setAttributes = props.setAttributes;

            return el(
                Fragment,
                {},
                el(
                    InspectorControls,
                    {},
                    el(
                        PanelBody,
                        {
                            title: __('Block Settings'),
                            initialOpen: true
                        },
                        el(TextControl, {
                            label: __('Block Title'),
                            value: attributes.title,
                            onChange: function(value) {
                                setAttributes({ title: value });
                            }
                        })
                    )
                ),
                el(
                    'div',
                    {
                        className: 'word-list-organizer-editor-preview'
                    },
                    el(
                        'div',
                        {
                            style: {
                                border: '2px dashed #ccc',
                                padding: '40px',
                                textAlign: 'center',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px'
                            }
                        },
                        el(
                            'h3',
                            {
                                style: {
                                    margin: '0 0 10px 0',
                                    color: '#495057'
                                }
                            },
                            attributes.title
                        ),
                        el(
                            'p',
                            {
                                style: {
                                    margin: '0',
                                    color: '#6c757d'
                                }
                            },
                            __('Interactive word list organizer will appear here on the frontend.')
                        ),
                        el(
                            'div',
                            {
                                style: {
                                    marginTop: '20px',
                                    fontSize: '12px',
                                    color: '#6c757d'
                                }
                            },
                            el('strong', {}, __('Features:')),
                            el('br'),
                            __('• Drag and drop word organization'),
                            el('br'),
                            __('• PDF export functionality'),
                            el('br'),
                            __('• Database storage'),
                            el('br'),
                            __('• Admin dashboard for viewing saved lists')
                        )
                    )
                )
            );
        },

        save: function() {
            // Return null since this is a dynamic block rendered by PHP
            return null;
        }
    });
})(
    window.wp.blocks,
    window.wp.element,
    window.wp.editor,
    window.wp.components,
    window.wp.i18n
);