import React, { Component } from 'react';
import { View, Text } from 'react-native';

class Chat extends Component {

  render() {

    return (
      <View style={styles.container}>
        <Text>Chat Screen</Text>
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