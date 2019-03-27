# RNChatkitLinkPreviews
A React Native chat app created with Chatkit with rich link previews.

You can read the full tutorial at: [https://pusher.com/tutorials/link-previews-react-native-chat](https://pusher.com/tutorials/link-previews-react-native-chat)

### Prerequisites

- React Native development environment
- [Node.js](https://nodejs.org/en/)
- [Yarn](https://yarnpkg.com/en/)
- [Chatkit app instance](https://pusher.com/chatkit)
- [ngrok account](https://ngrok.com/)

## Getting Started

1. Clone the repo:

```
git clone https://github.com/anchetaWern/RNChatkitLinkPreviews.git
cd RNChatkitLinkPreviews
```


2. Install the app dependencies:

```
yarn
```

3. Eject the project (re-creates the `ios` and `android` folders):

```
react-native eject
```

4. Link the packages:

```
react-native link react-native-gesture-handler
react-native link react-native-vector-icons
react-native link react-native-config
```

5. Update `android/app/build.gradle` file:

```
apply from: "../../node_modules/react-native/react.gradle"

// add these:
apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
apply from: project(':react-native-config').projectDir.getPath() + "/dotenv.gradle"
```

6. Update `.env` file with your Chatkit credentials.

7. Set up the server:

```
cd server
yarn
```

8. Update the `server/.env` file with your Chatkit credentials.

9. Run the server:

```
yarn start
```

10. If you're starting out with an empty `db.sqlite` file, access `http://localhost:5000/create-db` then `http://localhost:5000/create-quiz` on your browser. Otherwise, skip this step.

11. Run ngrok:

```
./ngrok http 5000
```

12. Update the `src/screens/Login.js` and `src/screens/Chat.js` file with your ngrok https URL.

13. Run the app:

```
react-native run-android
react-native run-ios
```

14. Log in to the app on two separate devices (or emulator) or simply use the Chatkit console to send messages with URLs in them.


## Built With

* [React Native](http://facebook.github.io/react-native/)
* [Chatkit](https://pusher.com/chatkit)
