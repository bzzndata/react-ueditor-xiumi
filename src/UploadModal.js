import Button from './Button'
import Input from './Input'
import Label from './Label'
import Modal from 'rc-dialog'
import React from 'react'
import Select from './Select'
import Tag from './Tag'
import Upload from './Upload'
import Loading from './Loading'
import 'rc-dialog/assets/index.css'

const style = {
  paramsConfig: {
    paddingBottom: '10px',
    borderBottom: '1px solid rgb(217, 217, 217)',
    display: 'flex',
    flexWrap: 'wrap',
  },
  insertTitle: {
    fontSize: '14px',
    paddingRight: '10px',
    color: 'rgba(0, 0, 0, 0.65)',
  },
  sourceList: {
    margin: '10px 10px 10px 0',
    border: '1px dashed rgb(217, 217, 217)',
    borderRadius: '4px',
  },
  configTitle: {
    display: 'block',
    fontSize: '14px',
    margin: '10px 0',
    paddingRight: '10px',
    color: 'rgba(0, 0, 0, 0.65)',
  },
  warnInfo: {
    display: 'inline-block',
    width: '100%',
    margin: '5px',
    textAlign: 'center',
    fontSize: '12px',
    color: '#f04134',
  },
}

const linkRegx = /^https?:\/\/(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9,_-](\?)?)*)*$/i

const acceptMap = {
  audio: 'audio/*',
  video: 'video/*',
}

let timeoutInstance = null

class UploadModal extends React.Component {
  state = {
    sources: [],
    currentSource: '',
    width: '100%',
    height: 400,
    controls: 'true',
    autoplay: 'false',
    muted: 'false',
    loop: 'false',
    poster: '',
    name: '',
    author: '',
    errorMsg: '',
    errorMsgVisible: false,
  }

  updateCurrentSource = e => {
    this.setState({currentSource: e.target.value})
  }

  addSource = () => {
    let {sources, currentSource} = this.state
    let newsources = sources.concat([currentSource])
    if (currentSource === '') {
      this.showErrorMsg('链接不能为空')
    } else if (!linkRegx.test(currentSource)) {
      this.showErrorMsg('非法的链接')
    } else if (sources.indexOf(currentSource) !== -1) {
      this.showErrorMsg('链接已存在')
    } else {
      this.setState({
        sources: newsources,
        currentSource: '',
      })
    }
  }

  removeSource = index => {
    let sourcesCopy = this.state.sources.concat([])
    sourcesCopy.splice(index, 1)
    this.setState({sources: sourcesCopy})
  }

  upload = e => {
    let {upload} = this.props

    if (!upload) return

    upload(e).then(url => {
      this.setState({currentSource: url}, this.addSource)
    }).catch(e => {
      e.constructor === Error ? this.showErrorMsg(e.message) : this.showErrorMsg(e)
    })
  }

  showErrorMsg = msg => {
    this.setState({errorMsg: msg, errorMsgVisible: true})
    clearTimeout(timeoutInstance)
    timeoutInstance = setTimeout(() => {
      this.setState({errorMsg: '', errorMsgVisible: false})
    }, 4000)
  }

  getFileType = (fileUrl, mediaType) => {
    let type = fileUrl.match(/\.(\w+)$/, 'i')
    return type ? type[1].toLowerCase() : mediaType === 'audio' ? 'mp3' : 'mp4'
  }

  insert = () => {
    let {sources, width, height, controls, autoplay, muted, loop, poster, name, author} = this.state
    let {type} = this.props
    let dataExtra = JSON.stringify({'poster': poster, 'name': name, 'author': author})
    let len = sources.length

    if (len > 0) {
      let html = ''
      let attr = ''

      attr += controls === 'false' ? '' : ' controls="true" '
      attr += autoplay === 'false' ? '' : ' autoplay="true" '
      attr += loop === 'false' ? '' : ' loop="true" '
      if (type === 'audio') {
        if (len === 1) {
          html = `<audio style="width:100%" src="${sources[0]}" ${attr} data-extra='${dataExtra}'>你的浏览器不支持 audio 标签</audio>`
        } else {
          html = `<audio style="width:100%" ${attr} data-extra='${dataExtra}'>`
          sources.forEach(source => {
            html += `<source src=${source} type="audio/${this.getFileType(source, 'audio')}">`
          })
          html += '你的浏览器不支持 audio 标签</audio>'
        }
      } else {
        attr += muted === 'false' ? '' : ' muted '
        if (len === 1) {
          html = `<video src="${sources[0]}" width="${width}" height="${height}" ${attr}>你的浏览器不支持 video 标签</video>`
        } else {
          html = `<video width="${width}" height="${height}" ${attr}>`
          sources.forEach(source => {
            html += `<source src=${source} type="video/${this.getFileType(source, 'video')}"}>`
          })
          html += '你的浏览器不支持 video 标签</video>'
        }
      }

      // 修复在 Safari 浏览器中，插入视频后，由于没有在视频后面添加一个 p 标签，
      // 导致视频无法删除，无法将光标移动到视频后面的 bug
      this.props.insert(html + '<p></p>')
      this.closeModal()
    }
  }

  closeModal = () => {
    this.props.closeModal()
  }

  changeConfig = (e, type) => {
    let value = e.target.value
    let boolType = ['controls', 'autoplay', 'muted', 'loop']
    // fork 之前这段代码只能设置像素，为了支持百分比，故注释掉
    // if (type === 'width' || type === 'height') {
    //   if (isNaN(parseInt(value))) {
    //     value = parseInt(value)
    //   }
    // } 

    // fork 之前这段代码会导致 'controls', 'autoplay', 'muted', 'loop' 字段无论选择什么，结果都为 true，故注释掉
    // else if (boolType.indexOf(type) !== -1) {
    //   value = !!value
    // }
    this.setState({[type]: value})
  }

  renderSourceList = () => {
    let {sources} = this.state
    if (sources.length > 0) {
      let list = sources.map((source, index) => {
        return <Tag value={source} key={source} index={index} onRemove={this.removeSource} />
      })
      return list
    } else {
      return <span style={style.warnInfo}>至少添加一个链接</span>
    }
  }

  renderVideoConfig = () => {
    let {width, height, controls, autoplay, muted, loop} = this.state
    return (
      <form style={style.paramsConfig}>
        <Label name='宽度'>
          <Input type='text' value={width} onChange={e => { this.changeConfig(e, 'width') }} />
        </Label>
        <Label name='高度'>
          <Input type='text' value={height} onChange={e => { this.changeConfig(e, 'height') }} />
        </Label>
        <Label name='控制面板'>
          <Select value={controls} onChange={e => { this.changeConfig(e, 'controls') }}>
            <option value='true'>显示</option>
            <option value='false'>不显示</option>
          </Select>
        </Label>
        <Label name='自动播放'>
          <Select value={autoplay} onChange={e => { this.changeConfig(e, 'autoplay') }}>
            <option value='true'>是</option>
            <option value='false'>否</option>
          </Select>
        </Label>
        <Label name='静音'>
          <Select value={muted} onChange={e => { this.changeConfig(e, 'muted') }}>
            <option value='true'>是</option>
            <option value='false'>否</option>
          </Select>
        </Label>
        <Label name='循环播放'>
          <Select value={loop} onChange={e => { this.changeConfig(e, 'loop') }}>
            <option value='true'>是</option>
            <option value='false'>否</option>
          </Select>
        </Label>
      </form>
    )
  }

  renderAudioConfig = () => {
    let {controls, autoplay, loop, poster, name, author} = this.state
    return (
      <form style={style.paramsConfig}>
        <Label name='控制面板'>
          <Select value={controls} onChange={e => { this.changeConfig(e, 'controls') }}>
            <option value='true'>显示</option>
            <option value='false'>不显示</option>
          </Select>
        </Label>
        <Label name='自动播放'>
          <Select value={autoplay} onChange={e => { this.changeConfig(e, 'autoplay') }}>
            <option value='true'>是</option>
            <option value='false'>否</option>
          </Select>
        </Label>
        <Label name='循环播放'>
          <Select value={loop} onChange={e => { this.changeConfig(e, 'loop') }}>
            <option value='true'>是</option>
            <option value='false'>否</option>
          </Select>
        </Label>
      </form>
    )
  }

  render() {
    let {currentSource, errorMsg, errorMsgVisible,sources} = this.state
    let {type, title, visible, progress} = this.props
    const accept = acceptMap[type];
    // 为空时，要设置为空字符串 ''，否则为 undefined 时，删除最后一个已添加的链接，仍然会显示预览 source
    const previewSource = sources[sources.length - 1] || '';

    return (
      <Modal
        title={title}
        onClose={this.closeModal}
        visible={visible}
        footer={[
          <Button key='close' onClick={this.closeModal}>取消</Button>,
          <Button key='insert' onClick={this.insert}>插入</Button>,
        ]}
        animation='zome'
        maskAnimation='fade'>
        <div>
          <div>
            <span style={style.insertTitle}>插入链接</span>
            <Input style={{width: '300px'}} type='text' value={currentSource} onChange={this.updateCurrentSource} />
            <Button onClick={this.addSource}>添加</Button>
            <Upload onChange={this.upload} accept={accept} />
          </div>
          <div>
            <span style={{...style.warnInfo, display: progress && progress !== -1 ? 'block' : 'none'}}>
              <Loading />
            </span>
            <span style={{...style.warnInfo, display: errorMsgVisible ? 'block' : 'none'}}>{errorMsg}</span>
          </div>
          <div style={style.sourceList}>
            {this.renderSourceList()}
          </div>
          <span style={style.configTitle}>参数配置</span>
          {type === 'audio' ? this.renderAudioConfig() : this.renderVideoConfig()}
          <div style={{textAlign: 'center', padding: '20px 10px 0 10px'}}>
            {
              type === 'audio'
                ? <audio src={previewSource} controls='controls' style={{width: '100%'}}>
                你的浏览器不支持 audio 标签
                </audio>
                : <video src={previewSource} controls='controls'
                  style={{width: '100%', height: '250px', backgroundColor: '#000'}}>
                你的浏览器不支持 video 标签
                </video>
            }
          </div>
        </div>
      </Modal>
    )
  }
}

export default UploadModal
