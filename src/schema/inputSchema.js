import sanityTagAutocomplete from "../components/autocompleteTagsComponent"

export default {
  name: "tags",
  title: "Tags",
  type: "array",
  description: "Add your tags.",
  inputComponent: sanityTagAutocomplete,
  of: [{ type: "tag" }],
  options: {
    layout: "tags",
    isHighlighted: true
  }
}
