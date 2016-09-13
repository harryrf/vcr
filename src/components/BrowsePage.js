import React from 'react'
import Flex from 'flex-component'
import { Link, withRouter } from 'react-router'
import { fetchMovies } from 'utils/api'

import promised from 'utils/promised'

import FilmList from 'components/FilmList'

export default class BrowsePage extends React.Component {

  shouldComponentUpdate({ params: { filmType, filmId }}) {
    return filmType !== this.props.params.filmType || filmId !== this.props.params.filmId
  }

  @promised static loadProps = ({ filmType }) => (
    fetchMovies(filmType).then(
      ({ films, more }) => ({ filmType, films, more })
    )
  )

  render() {
    const {
      children,
      filmType,
      films,
      more,
      params: { filmId }
    } = this.props

    return (
      <FilmList
        films={films}
        more={more}
        activeFilmId={filmId}
        basePath={`/browse/${filmType}`}
      >
        {children}
      </FilmList>
    )
  }
}
