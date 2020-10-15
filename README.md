# Sanity Autocomplete Tags Dropdown Plugin 🚀

This plugin creates a custom tags input field for Sanity Studio. This custom input field allows users to type tags, select existing ones from the dropdown or create new ones. This is handy if you want to offer authors an experience of "type, hit Enter, repeat" for adding tags.

![Plugin screenshot](https://s3.us-west-1.wasabisys.com/rosnovsky-media/screenshot.png)

## How To Use

This plugin is easy to use and set up.

### Installation

```bash
sanity install sanity-studio-autocomplete-tags
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
}
```

Yep, that's it.
