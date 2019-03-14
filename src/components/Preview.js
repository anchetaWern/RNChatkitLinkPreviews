import React, { Component } from 'react';
import { TouchableOpacity, View, ImageBackground, Text, Linking } from 'react-native';
import LinkPreview from 'react-native-link-preview';
import Icon from 'react-native-vector-icons/FontAwesome';

class Preview extends Component {

  state = {
    title: null,
    image_url: null,
    link: this.props.uri,
    link_type: null,
    has_preview: false
  }


  async componentDidMount() {
    const { uri } = this.props;
    try {
      const { title, images, url, mediaType } = await LinkPreview.getPreview(uri);

      await this.setState({
        title: title,
        image_url: images[0],
        link: url,
        link_type: mediaType,
        has_preview: true
      });

    } catch (e) {
      console.log('error occurred: ', e);

    }

  }


  openLink = async () => {
    const { link } = this.state;
    try {
      const supported = await Linking.canOpenURL(link);
      if (supported) {
        return Linking.openURL(link);
      }
    } catch(e) {
      console.log('error occurred: ', e);
    }
  }


  render() {
    const { image_url, title, link, link_type, has_preview } = this.state;
    const { text_color } = this.props;
    const is_video = (link_type && link_type.indexOf('video') !== -1) ? true : false;

    return (
      <View style={styles.container}>

        {
          has_preview &&
          <TouchableOpacity onPress={this.openLink}>
            <ImageBackground
              style={styles.preview}
              source={{uri: image_url}}
              imageStyle={{resizeMode: 'contain'}}
            >
              {
                is_video &&
                <Icon name="play-circle" style={styles.play} size={50} color="#FFF" />
              }
            </ImageBackground>
            <View>
              <Text style={[styles.title, { color: text_color }]}>{title}</Text>
            </View>
          </TouchableOpacity>
        }

        {
          !this.state.has_preview &&
          <Text style={styles.link}>{link}</Text>
        }
      </View>
    );
  }
}

const styles = {
  container: {
    width: 130,
    margin: 10
  },
  preview: {
    width: 130,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center'
  },
  play: {
    opacity: 0.75
  },
  title: {
    fontSize: 10
  },
  link: {
    color: '#0178ff'
  }
}

export default Preview;