import autocompleteTagsComponent from './autocompleteTagsComponent'

export const schema = { 
  type: "object", 
  name: "tag", 
  fields: [
    {
      name: "value",
      type: "string"
    },
    {
      name: "label",
      type: "string"
    }
  ]
}

export default autocompleteTagsComponent;
