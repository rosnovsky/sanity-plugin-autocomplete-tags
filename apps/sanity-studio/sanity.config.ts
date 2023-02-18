import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {visionTool} from '@sanity/vision'
import { schemaTypes } from './schemas'
import { autocompleteTags } from 'sanity-plugin-autocomplete-tags'

export default defineConfig({
  name: 'default',
  title: 'Advice API',

  projectId: 'lln1rnec',
  dataset: 'production',

  plugins: [deskTool(), visionTool(), autocompleteTags()],

  schema: {
    types: schemaTypes,
  },
})
