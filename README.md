# Sanity Autocomplete Tags Dropdown Plugin 🚀

This plugin creates a custom tags input field for Sanity Studio. This custom input field allows users to type tags, select existing ones from the dropdown or create new ones. This is handy if you want to offer authors an experience of "type, hit Enter, repeat" for adding tags.

![Plugin screenshot](https://s3.us-west-1.wasabisys.com/rosnovsky-media/screenshot.png)

## How To Use

This plugin is easy to use and set up. All you need is to have Sanity installed, and its folder open in your terminal.

### Installation

```bash
sanity install autocomplete-tags
```

That'll do it. Easy, eh? ;)

### Configuration

None 💃

### Implementation

Whenever you want to add tags to an item in your schema, just add this snippet

```javascript
{
  name: 'tags',
  title: 'Tags',
  type: 'tags',
  options: {
    //Locks menu from creating new tags (defaults to false)
    frozen: true,
    //Preset of tags (defaults to empty)
    preload: [{label: "Oranges", value: "oranges"}, {label: "Apples", value: "apples"}],
    //Closes menu after tag selected (defaults to true)
    closeMenuOnSelect: true
  }
}
```

Yep, that's it.

## Contribute

This repo is friendly to beginners and there are some awesome and easy wins available for your first PR. Feel free to install this plugin, poke around and improve it in any way you see feet. Open an issue, pick an existing one, or open a PR right away. Reach out for help, I'd be happy to walk you through your first PR!

## Acknowledgements

This plugin is based on React Select, a fantastic select library for React.
