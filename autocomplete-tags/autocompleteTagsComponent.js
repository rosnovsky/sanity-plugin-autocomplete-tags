// @ts-nocheck

import React, {useState, useEffect} from 'react' 
import CreatableSelect from 'react-select/creatable';
const sanityClient = require('@sanity/client')
import PatchEvent, {set, unset} from 'part:@sanity/form-builder/patch-event' 
import {withDocument} from 'part:@sanity/form-builder'

import styles from './autocompleteTagsComponent.css'

const client = sanityClient({
  projectId: 'process.env.SANITY_PROJECT_ID', // TODO: How do I make users configure this inside the Studio?..
  dataset: 'production',
  token: process.env.SANITY_TOKEN, // TODO: Same question as above
  useCdn: false // important to set to `false`: we need our tags fresh
})

const createPatchFrom = value => PatchEvent.from(value === '' ? unset() : set(value))

const autocompleteTagsComponent = (props) => {
  const [uniqueImageTags, setUniqueImageTags] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selected, setSelected] = useState([]);

  // On component load, let's fetch all tags from all images and only keep unique ones
  useEffect(() => {
    // Component is loading! Hands off!
    setIsLoading(true)
    const query = '*[_type == "photo"] {photo}' // TODO: Can I turn it itno a variable to make it work with user defined or "parent" document instead of hardcoding "photo" as a search term?

    // TODO: Implement .focus() mentod

    const fetchTags = async () =>  {
      const allTags = []
      const result = client.fetch(query)
      .then(photos => {
        const fillTags = photos.forEach(photo => {
          allTags.push(photo.photo.tags)
        })
        
        // At this point, we have an array of arrays. Let's flatten this sucker!
        // @ts-ignore
        const flatTags = allTags.flat();
        
        // Now, let's create a new array that only includes unique tags
        const uniqueTags = Array.from(new Set(flatTags.map(tag => tag.value)))
        .map(tagValue => {
          return {
            value: tagValue,
            label: tagValue
          }
        })
        
        setUniqueImageTags(uniqueTags)
        return fillTags;
      })
      return result
    }
  
    // Ok, now let's populate the dropdown with tags already assigned.
    const setSelectedTags = async () => {
      // populating existing tags from document props (this is why we need to set CDN to `false`: to make sure props have fresh set of tags)
      setSelected(props.document.photo.tags)
    }
    fetchTags();
    setSelectedTags();
    
    // Component no longer loading
    setIsLoading(false)
  }, [])

  // Here we handle change to the tags when this change does not involve creating a new tag
  const handleChange = (newValue, actionMeta) => {
    setSelected(newValue)
    props.onChange(createPatchFrom(newValue))
  };

  // Ok, here's some fun: here we handle changes that involve creating new tags and 
  // populating these new options into selected tags and all tags
  const createOption = (newValue) => {
    const newSelected = selected
    newSelected.push({value: newValue, label: newValue})
    setSelected(newSelected)

    /* 
    
    !!! BUG: Sometimes newly added tags don't count towards validation rule.
    This validation would fail in case the second required tag was just created:
    
    validation: Rule => Rule.required().min(2).error('At least 2 tags are required.')
    
    */

    // New tags need to be commited to Sanity so that we can reuse them elsewhere
    client
      .patch(props.document._id)
      .setIfMissing({tags: []}) // shouldn't be a factor, but who knows? 🤷
      .append('tags',
      [{value: newValue, label: newValue}]
      )
      .commit()
  }
  
  return (
    <>
      <CreatableSelect
        disabled={isLoading}
        isLoading={isLoading}
        value={selected || ""}
        isMulti
        onChange={handleChange}
        onCreateOption={createOption}
        options={uniqueImageTags || ""}
      />
    </>
  );
}

export default withDocument(autocompleteTagsComponent)
