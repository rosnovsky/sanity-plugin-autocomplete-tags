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

const createPatchFrom = (value) =>
  PatchEvent.from(value === "" ? unset() : set(value))

const autocompleteTagsComponent = forwardRef((props, ref) => {
  const [uniqueImageTags, setUniqueImageTags] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selected, setSelected] = useState([])

  console.log(props)

  useImperativeHandle(ref, () => ({
    focus() {
      this._inputElement.focus()
    }
  }))

  const document = props.document._type

  // On component load, let's fetch all tags from all images and only keep unique ones
  useEffect(() => {
    // Component is loading! Hands off!
    setIsLoading(true)
    const query = `*[_type == "${document}"] {${document}}` // TODO: Can I turn it itno a variable to make it work with user defined or "parent" document instead of hardcoding "photo" as a search term?

    console.log(query)

    const fetchTags = async () => {
      const allTags = []
      client.fetch(query).then((items) => {
        const fillTags = items.forEach((item) => {
          if (item[document].tags !== null) {
            allTags.push(item[document].tags)
          }
        })

        // At this point, we have an array of arrays. Let's flatten this sucker!
        // @ts-ignore
        const flatTags = allTags.flat().filter((tag) => {
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

        setUniqueImageTags(uniqueTags)
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
  const handleChange = (value) => {
    // again, ensuring that `selected` remains an array
    setSelected(!value ? [] : value)
    props.onChange(createPatchFrom(value))
  }

  /* 
  Ok, here's some fun: here we handle changes that involve creating new tags and populating these new options into selected tags and all tags
  */
  const createOption = (inputValue) => {
    let newSelected = selected
    newSelected.push({ value: inputValue, label: inputValue })
    setSelected(newSelected)

    // New tags need to be commited to Sanity so that we can reuse them elsewhere
    client
      .patch(props.document._id)
      .setIfMissing({ [document]: { tags: [] } })
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
        options={uniqueImageTags || ""}
      />
    </>
  )
})

export default withDocument(autocompleteTagsComponent)
