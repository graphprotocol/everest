/** @jsx jsx */
import PropTypes from 'prop-types'
import { jsx } from 'theme-ui'
import Field from '../Field'
import Button from '../Button'

const ProjectForm = ({
  project,
  isDisabled,
  handleSubmit,
  setValue,
  setDisabled,
  buttonText,
  setImage,
  categories,
}) => {
  return (
    <form sx={{ maxWidth: '504px', width: '100%', mt: [5, 0, 0] }}>
      <Field
        title="Name *"
        field="name"
        type="input"
        value={project.name}
        charsCount={35}
        placeholder="Project Name"
        project={project}
        setValue={async value => {
          await setValue('name', value)
          setDisabled(value)
        }}
      />
      <Field
        title="Description *"
        field="description"
        value={project.description}
        type="textarea"
        charsCount={300}
        placeholder="Describe your project"
        project={project}
        setValue={async value => {
          await setValue('description', value)
          setDisabled(value)
        }}
      />
      <Field
        title="Categories *"
        field="category"
        type="filters"
        project={project}
        setValue={async value => {
          await setValue('categories', value)
          setDisabled(value)
        }}
        multiselect={true}
        categories={categories}
      />
      <Field
        title="Project logo"
        type="upload"
        field="logo"
        imageName={project.logoName}
        imageUrl={project.logoUrl}
        project={project}
        setImage={data => setImage('avatar', data)}
      />
      <Field
        title="Project image"
        type="upload"
        field="image"
        imageName={project.imageName}
        imageUrl={project.imageUrl}
        project={project}
        setImage={data => setImage('image', data)}
      />
      <Field
        title="Website"
        field="website"
        value={project.website}
        type="input"
        placeholder="Project website"
        project={project}
        setValue={value => setValue('website', value)}
      />
      <Field
        title="Github"
        field="github"
        value={project.github}
        type="input"
        placeholder="Github url"
        project={project}
        setValue={value => setValue('github', value)}
      />
      <Field
        title="Twitter"
        field="twitter"
        value={project.twitter}
        type="input"
        placeholder="Twitter url"
        project={project}
        setValue={value => setValue('twitter', value)}
      />
      <Field
        title="Project representative"
        text="Are you a project representative"
        value={project.isRepresentative}
        field="isRepresentative"
        type="checkbox"
        project={project}
        setValue={value => setValue('isRepresentative', value)}
      />
      <Button
        disabled={isDisabled}
        variant="secondary"
        onClick={e => {
          e.preventDefault()
          handleSubmit(project)
        }}
        text={buttonText}
      />
    </form>
  )
}

ProjectForm.propTypes = {
  project: PropTypes.any,
  uploadImage: PropTypes.func,
  isDisabled: PropTypes.bool,
  handleSubmit: PropTypes.func,
  setValue: PropTypes.func,
  setDisabled: PropTypes.func,
  buttonText: PropTypes.string,
  setImage: PropTypes.func,
}

export default ProjectForm
