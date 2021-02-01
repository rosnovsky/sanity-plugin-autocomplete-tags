import sanityTagAutocomplete from "../components/autocompleteTagsComponent"

export default {
  name: "tags",
  title: "Tags",
  type: "array",
  inputComponent: sanityTagAutocomplete,
  of: [{ type: "tag" }],
  options: {
    layout: "tags",
    isHighlighted: true
  }
}
