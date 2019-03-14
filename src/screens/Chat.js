import React, { Component } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { GiftedChat, Send, Message } from 'react-native-gifted-chat';
import Chatkit from '@pusher/chatkit';
import axios from 'axios';
import Config from 'react-native-config';

import ChatBubble from '../components/ChatBubble';
import Preview from '../components/Preview';

const CHATKIT_INSTANCE_LOCATOR_ID = `v1:us1:${Config.CHATKIT_INSTANCE_LOCATOR_ID}`;
const CHATKIT_SECRET_KEY = Config.CHATKIT_SECRET_KEY;
const CHATKIT_TOKEN_PROVIDER_ENDPOINT = `https://us1.pusherplatform.io/services/chatkit_token_provider/v1/${Config.CHATKIT_INSTANCE_LOCATOR_ID}/token`;

const CHAT_SERVER = "YOUR NGROK HTTPS URL/rooms";

class Chat extends Component {

  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;

    return {
      headerTitle: `Chat with ${params.friends_username}`
    };
  };

  state = {
    messages: [],
    is_initialized: false,
    is_loading: false,
    show_load_earlier: false
  };


  constructor(props) {
    super(props);
    const { navigation } = this.props;
    const user_id = navigation.getParam("user_id");
    const username = navigation.getParam("username");
    const friends_username = navigation.getParam("friends_username");

    const members = [username, friends_username];
    members.sort();

    this.user_id = user_id;
    this.username = username;
    this.room_name = members.join("-");
  }


  async componentDidMount() {
    const tokenProvider = new Chatkit.TokenProvider({
      url: CHATKIT_TOKEN_PROVIDER_ENDPOINT
    });

    const chatManager = new Chatkit.ChatManager({
      instanceLocator: CHATKIT_INSTANCE_LOCATOR_ID,
      userId: this.user_id,
      tokenProvider: tokenProvider
    });

    try {
      let currentUser = await chatManager.connect();
      this.currentUser = currentUser;

      const response = await axios.post(
        CHAT_SERVER,
        {
          user_id: this.user_id,
          room_name: this.room_name
        }
      );

      const room = response.data;

      this.room_id = parseInt(room.id);
      await this.currentUser.subscribeToRoom({
        roomId: this.room_id,
        hooks: {
          onNewMessage: this.onReceive
        }
      });

      this.setState({
        is_initialized: true
      });

    } catch (err) {
      console.log("error with chat manager: ", err);
    }

  }


  onReceive = async (data) => {
    const { message } = await this.getMessage(data);

    await this.setState((previousState) => ({
      messages: GiftedChat.append(previousState.messages, message)
    }));

    if (this.state.messages.length > 9) {
      this.setState({
        show_load_earlier: true
      });
    }
  };


  onSend([message]) {
    const msg = {
      text: message.text,
      roomId: this.room_id
    };

    this.setState({
      is_sending: true
    });

    this.currentUser.sendMessage(msg).then(() => {
      this.setState({
        is_sending: false
      });
    });
  }


  renderSend = props => {
    if (this.state.is_sending) {
      return (
        <ActivityIndicator
          size="small"
          color="#0064e1"
          style={[styles.loader, styles.sendLoader]}
        />
      );
    }

    return <Send {...props} />;
  };


  getMessage = async ({ id, senderId, text, createdAt }) => {

    const msg_data = {
      _id: id,
      text: text,
      createdAt: new Date(createdAt),
      user: {
        _id: senderId,
        name: senderId,
        avatar:
          "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_960_720.png"
      }
    };

    return {
      message: msg_data
    };
  };


  loadEarlierMessages = async () => {
    this.setState({
      is_loading: true
    });

    const earliest_message_id = Math.min(
      ...this.state.messages.map(m => parseInt(m._id))
    );

    try {
      let messages = await this.currentUser.fetchMessages({
        roomId: this.room_id,
        initialId: earliest_message_id,
        direction: "older",
        limit: 10
      });

      if (!messages.length) {
        this.setState({
          show_load_earlier: false
        });
      }

      let earlier_messages = [];
      await this.asyncForEach(messages, async (msg) => {
        let { message } = await this.getMessage(msg);
        earlier_messages.push(message);
      });

      await this.setState(previousState => ({
        messages: previousState.messages.concat(earlier_messages)
      }));
    } catch (err) {
      console.log("error occured while trying to load older messages", err);
    }

    await this.setState({
      is_loading: false
    });
  };


  asyncForEach = async (array, callback) => {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  };


  renderMessage = (msg) => {
    console.log('hey');
    const url_matches = msg.currentMessage.text.match(/\bhttps?:\/\/\S+/gi);
    const renderBubble = (url_matches) ? this.renderPreview.bind(this, url_matches) : null;

    const modified_msg = {
      ...msg,
      renderBubble
    }

    return <Message {...modified_msg} />
  }


  renderPreview = (url_matches, bubbleProps) => {

    const uri = url_matches[0];
    const text_color = (bubbleProps.position == 'right') ? '#FFF' : '#000';
    const modified_bubbleProps = {
      ...bubbleProps,
      uri
    };

    return (
      <ChatBubble {...modified_bubbleProps}>
        <Preview uri={uri} text_color={text_color} />
      </ChatBubble>
    );

  }


  render() {
    const { is_loading, is_initialized, messages, show_load_earlier } = this.state;

    return (
      <View style={styles.container}>
        {(is_loading || !is_initialized) && (
          <ActivityIndicator
            size="small"
            color="#0064e1"
            style={styles.loader}
          />
        )}

        {is_initialized && (
          <GiftedChat
            messages={messages}
            onSend={messages => this.onSend(messages)}
            user={{
              _id: this.user_id
            }}
            loadEarlier={show_load_earlier}
            onLoadEarlier={this.loadEarlierMessages}
            renderSend={this.renderSend}
            renderMessage={this.renderMessage}
          />
        )}
      </View>
    );
  }
}


const styles = {
  container: {
    flex: 1
  },
  loader: {
    paddingTop: 20
  },
  sendLoader: {
    marginRight: 10,
    marginBottom: 10
  }
};

export default Chat;