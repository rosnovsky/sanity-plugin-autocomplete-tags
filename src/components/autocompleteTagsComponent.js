// @ts-nocheck

import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle
} from "react"
import CreatableSelect from "react-select/creatable"
import Select from "react-select"
import Fieldset from "part:@sanity/components/fieldsets/default"
import PatchEvent, { set, unset } from "part:@sanity/form-builder/patch-event"
import { withDocument } from "part:@sanity/form-builder"
import sanityClient from "part:@sanity/base/client"

const client = sanityClient.withConfig({apiVersion: '2021-03-25'})

const createPatchFrom = (value) =>
  PatchEvent.from(value === "" ? unset() : set(value))

const FrozenAndEmptyWarning = () => (
  <p>
    Objects of type {"'"}tags{"'"} must have a {"'"}preload{"'"} value if they
    {"'"}re frozen, as no new tags may be added to a frozen tag set
  </p>
)
const autocompleteTagsComponent = forwardRef((props, ref) => {
  const { type, level } = props
  const [isLoading, setIsLoading] = useState(false)
  const [selected, setSelected] = useState([])
  const options = props.type.options || {}
  const preloadedTags = options.preload || []
  const closeMenuOnSelect = options.closeMenuOnSelect !== false
  const frozen = options.frozen === true
  const [uniqueTags, setUniqueTags] = useState(preloadedTags)
  // TODO: This doesn't work, obviously :( Gotta fix it
  useImperativeHandle(ref, () => ({
    focus() {
      this._inputElement.focus()
    }
  }))

  // We'll use this document type later to query and patch it
  const document = props.document._type

  // On component load, let's fetch all tags from all images and only keep unique ones
  useEffect(() => {
    // Component is loading! Hands off!
    setIsLoading(true)

    // Query for the document type and return the whole thing
    const query = `*[_type == $document && count(tags) > 0].tags[]`

    const fetchTags = async () => {
      const allTags = await client.fetch(query, { document })

        // Now, let's create a new array that only includes unique tags
        const uniqueTags = []
        const map = new Map()
        for (const tag of allTags) {
          if (!map.has(tag.value)) {
            map.set(tag.value, true)
            uniqueTags.push({
              value: tag.value,
              label: tag.label
            })
          }
        }

      setUniqueTags(uniqueTags)
    }

    // Ok, now let's populate the dropdown with tags already assigned.
    const setSelectedTags = async () => {
      // populating existing tags from document props (this is why we need to set CDN to `false`: to make sure props have fresh set of tags)

      // let's make sure selected !== null and is always an array
      setSelected(!props.value ? [] : props.value)
    }
    if (!frozen) {
      fetchTags()
    }
    setSelectedTags()

    // Component no longer loading
    setIsLoading(false)
  }, [])
  // Here we handle change to the tags when this change does not involve creating a new tag
  const handleChange = value => {
    // again, ensuring that `selected` remains an array
    setSelected(!value ? [] : value)
    props.onChange(createPatchFrom(!value ? [] : value))
  }

  /*
  Ok, here's some fun: here we handle changes that involve creating new tags and populating these new options into selected tags and all tags
  */
  const selectMenuProps = {
    disabled: isLoading,
    isLoading,
    value: selected ? selected : [],
    isMulti: true,
    options: uniqueTags || "",
    onChange: handleChange,
    closeMenuOnSelect
  }
  if (!frozen) {
    selectMenuProps.onCreateOption = inputValue => {
      let newSelected = selected
      newSelected.push({ value: inputValue, label: inputValue })
      setSelected(newSelected)

      // New tags need to be commited to Sanity so that we can reuse them elsewhere
      client
        .patch(props.document._id)
        .append(document, [{ value: inputValue, label: inputValue }])
        .commit()
        .then(() => props.onChange(createPatchFrom(newSelected)))
    }
  }
  return (
    <Fieldset level={level} legend={type.title} description={type.description}>
      {frozen && preloadedTags.length === 0 ? <FrozenAndEmptyWarning /> : null}
      {frozen ? (
        <Select {...selectMenuProps} />
      ) : (
        <CreatableSelect {...selectMenuProps} />
      )}
    </Fieldset>
  )
})

export default withDocument(autocompleteTagsComponent)
