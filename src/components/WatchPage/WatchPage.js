import React from 'react'
import Flex from 'flex-component'
import { hashHistory } from 'react-router'
import merge from 'lodash/merge'
import Loader from 'halogen/MoonLoader'

import { Media, controls } from 'react-media-player'
const { CurrentTime, MuteUnmute } = controls

import {
  Player,
  Overlay,
  Progress,
  PlayPause,
} from 'components/Player'

import BackLink from 'components/BackLink'
import Titlebar from 'components/Titlebar'
import Pinky from 'components/Pinky'

import { decryptBlob } from 'utils/irpc'
import { fetchStream } from 'utils/api'
import promised from 'utils/promised'
import parserDictionary from 'parser-dictionary.json'
import byQuality from 'utils/byQuality'
import parseLink from 'utils/parseLink'

import style from './WatchPage.scss'

export default class WatchPage extends React.Component {
  state = {
    streamIndex: 0
  }

  @promised static loadProps = ({ chapterId }) => (
    fetchStream(chapterId)
      .then(sources => sources.sort(byQuality))
      .then(sources => {
        const encryptedStreams = sources.map(({ stream }) => stream)
        return Promise.all(encryptedStreams.map(decryptBlob))
          .then(decryptedStreams => decryptedStreams.map(url => ({ url })))
          .then(decryptedStreams => ({
            streams: merge(sources, decryptedStreams)
          }))
      })
  )

  fetchSource({ url, parseType }) {
    const parser = parserDictionary[parseType]
    return parseLink(url, parser)
  }

  render() {
    const { streams, location: { state }} = this.props
    const { streamIndex } = this.state
    const stream = this.props.streams[streamIndex]

    const fetchPromise = this.fetchSource(stream)
      .catch(() => {
        console.log(streamIndex, streams.length);
        if (streamIndex !== streams.length - 1) {
          this.setState({ streamIndex: streamIndex + 1 })
        } else {
          console.error('no working stream');
        }
      })

    return (
      <Pinky promise={fetchPromise}>
        {({data}) => data ? (

          <Player src={data} vendor='video' onError={console.error} autoPlay>
            {media => (
              <Overlay visible={!media.isPlaying}>

                <Titlebar
                  floating
                  center={state.title}
                  left={<BackLink path={state.basePath} />}
                />

                {media.isLoading && <Flex style={{ width: '100vw', height: '100vh' }} alignItems='center' justifyContent='center'>
                  <Loader color='white' size='50px' />
                </Flex>}

                <Flex className={style.ControlsBottom} alignItems='center'>
                  <PlayPause />
                  <Progress />
                  <CurrentTime style={{ minWidth: 50, textAlign: 'center' }} />
                  <div className={style.Quality}>{stream.quality}</div>
                </Flex>
              </Overlay>
            )}
          </Player>
        ) : (
          <Flex className={style.Loading} alignItems='center' justifyContent='center'>
            <Loader color='white' size='50px' />
          </Flex>
        )}
      </Pinky>
    )
  }
}