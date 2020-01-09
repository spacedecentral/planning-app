import React, { useState, useEffect, Fragment } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { format, formatDistance } from 'date-fns'
import { GU, IdentityBadge, theme } from '@aragon/ui'
import { IconEdit, IconDelete, Markdown } from '../../../../shared/ui'
import CommentForm from './CommentForm'

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  width: 100%;
`

const TimeAgo = styled.time.attrs(props => ({
  dateTime: format(props.date, "y-MM-dd'T'hh:mm:ss"),
  children: formatDistance(props.date, new Date(), { addSuffix: true }),
}))`
  color: ${theme.textTertiary};
`

TimeAgo.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
}

const Top = ({ author, createdAt, identity }) => {
  const created = new Date(Number(createdAt) * 1000)
  return (
    <Header>
      {identity && identity.name ? (
        <IdentityBadge entity={author} customLabel={identity.name} />
      ) : (
        <IdentityBadge entity={author} />
      )}
      <TimeAgo date={created} />
    </Header>
  )
}

const CommentDiv = styled.div`
  padding: ${2 * GU}px;
  position: relative;
`

const Footer = styled.footer`
  background: white;
  opacity: 0;
  position: absolute;
  right: 20px;
  bottom: 10px;
  :focus-within,
  ${CommentDiv}:hover & {
    opacity: 1;
  }
`

const Button = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  line-height: 0;
  outline: none;
  padding: 0;
  vertical-align: middle;
`

const Edit = styled(Button)`
  :hover,
  :focus {
    color: ${theme.accent};
    path {
      fill: ${theme.accent};
    }
  }
`

const Delete = styled(Button)`
  :active,
  :hover,
  :focus {
    color: ${theme.negative};
    path {
      fill: ${theme.negative};
    }
  }
  // hack to make the svg flush with the right edge of CommentDiv
  ${Edit} + & {
    margin-right: -5px;
  }
`

const Bottom = ({ onDelete, onEdit }) => {
  const [deleting, setDeleting] = useState(false)

  return (
    <Footer>
      {!deleting && (
        <Edit onClick={onEdit}>
          <IconEdit height={22} />
        </Edit>
      )}
      <Delete
        aria-live="polite"
        onBlur={() => setDeleting(false)}
        onClick={deleting ? onDelete : () => setDeleting(true)}
      >
        {deleting ? 'Confirm delete' : <IconDelete height={22} />}
      </Delete>
    </Footer>
  )
}

const Comment = ({
  app,
  currentUser,
  comment: { author, id, text, createdAt, revisions, postCid },
  onDelete,
  onSave,
}) => {
  const [editing, setEditing] = useState(false)
  const [identity, setIdentity] = useState(null)

  const update = async updated => {
    await onSave({ id, text: updated.text, revisions, postCid })
    setEditing(false)
  }

  useEffect(() => {
    const resolveIdentity = async () => {
      const addressIdentity = await app
        .resolveAddressIdentity(author)
        .toPromise()
      if (addressIdentity) {
        setIdentity(addressIdentity)
      }
    }
    resolveIdentity()
  }, [author])

  return (
    <CommentDiv>
      {editing ? (
        <CommentForm
          defaultValue={text}
          onCancel={() => setEditing(false)}
          onSave={update}
        />
      ) : (
        <Fragment>
          <Top author={author} identity={identity} createdAt={createdAt} />
          <Markdown content={text} />
          {author === currentUser && (
            <Bottom onDelete={onDelete} onEdit={() => setEditing(true)} />
          )}
        </Fragment>
      )}
    </CommentDiv>
  )
}

Comment.propTypes = {
  currentUser: PropTypes.string.isRequired,
  comment: PropTypes.shape({
    id: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
}

export default Comment
