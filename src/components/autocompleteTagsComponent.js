// @ts-nocheck

import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle
} from "react"
import CreatableSelect from "react-select/creatable"
import PatchEvent, { set, unset } from "part:@sanity/form-builder/patch-event"
import { withDocument } from "part:@sanity/form-builder"
import client from "part:@sanity/base/client"

const createPatchFrom = value =>
  PatchEvent.from(value === "" ? unset() : set(value))

const autocompleteTagsComponent = forwardRef((props, ref) => {
  const [uniqueTags, setUniqueTags] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selected, setSelected] = useState([])

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
    const query = `*[_type == '${document}'] { ... }`

    const fetchTags = async () => {
      const allTags = []
      client.fetch(query).then(items => {
        items.forEach(item => {
          if (item.tags && item.tags.length > 0 && item.tags !== null) {
            // this could be a item?.tags?.length or something?
            allTags.push(item.tags)
          }
          return
        })

        // At this point, we have an array of arrays. Let's flatten this sucker!
        // @ts-ignore
        const flatTags = allTags.flat().filter(tag => {
          if (typeof tag !== "string") {
            return tag
          }
        })
        // Now, let's create a new array that only includes unique tags
        const uniqueTags = []
        const map = new Map()
        for (const tag of flatTags) {
          if (!map.has(tag.value)) {
            map.set(tag.value, true)
            uniqueTags.push({
              value: tag.value,
              label: tag.label
            })
          }
        }

        setUniqueTags(uniqueTags)
      })
    }

    // Ok, now let's populate the dropdown with tags already assigned.
    const setSelectedTags = async () => {
      // populating existing tags from document props (this is why we need to set CDN to `false`: to make sure props have fresh set of tags)

      // let's make sure selected !== null and is always an array
      setSelected(!props.value ? [] : props.value)
    }
    fetchTags()
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
  const createOption = inputValue => {
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

  return (
    <>
      <h4>{props.type.title}</h4>
      <CreatableSelect
        disabled={isLoading}
        isLoading={isLoading}
        value={selected ? selected : []}
        isMulti
        onChange={handleChange}
        onCreateOption={createOption}
        options={uniqueTags || ""}
      />
    </>
  )
})

export default withDocument(autocompleteTagsComponent)
