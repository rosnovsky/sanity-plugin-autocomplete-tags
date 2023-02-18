import { definePlugin } from 'sanity'

interface AutocompleteTagsConfig {
  /* nothing here yet */
}


export const autocompleteTags = definePlugin<AutocompleteTagsConfig | void>((config = {}) => {
  // eslint-disable-next-line no-console
  console.log('hello from sanity-plugin-autocomplete-tags')
  return {
    name: 'sanity-plugin-autocomplete-tags',
  }
})
