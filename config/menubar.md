# Menu Bar Configuration

## ARIA Roles
- `menubar`: Top-level container (automatically applied)
- `menuitem`: Basic clickable item
- `menu`: Submenu container
- `menuitemcheckbox`: Toggleable item
- `menuitemradio`: Single-select item from a group
- `button`: Clickable button (like Apple menu)

## Action Types
- `dialog`: Opens a modal dialog
  - Properties: `title`, `content`
- `link`: Navigate to URL
  - Properties: `url`, `external` (boolean)
- `submenu`: Shows nested menu items
  - Properties: `items` (array of menu items)
- `preview`: Opens a preview panel
  - Properties: `content` (preview content identifier)
- `toggle`: Toggle a state
  - Properties: `target` (what to toggle), `value` (optional, for radio groups)

## Example Structure
```json
{
    "label": "Menu Item",
    "role": "menu",
    "items": [
        {
            "label": "Submenu Item",
            "role": "menuitem",
            "action": {
                "type": "dialog",
                "title": "Dialog Title",
                "content": "Dialog Content"
            }
        }
    ]
}
``` 